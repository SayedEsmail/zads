"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";

export function PushNotificationRegistrar() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    async function registerPush() {
      try {
        if (Notification.permission === "default") {
          // Do not spam user immediately on first load, wait for user interaction or prompt in settings
          return;
        }

        if (Notification.permission === "granted") {
          const registration = await navigator.serviceWorker.register("/sw.js").catch(() => null);
          
          let pushToken = localStorage.getItem("zads_fcm_token");
          if (!pushToken) {
            // Generate or obtain device token
            pushToken = "web_token_" + Math.random().toString(36).substring(2) + "_" + Date.now();
            localStorage.setItem("zads_fcm_token", pushToken);
          }

          // Check if already registered in this session
          const alreadyRegistered = sessionStorage.getItem("zads_token_registered");
          if (!alreadyRegistered) {
            await api.post("/notifications/register-token", { fcmToken: pushToken });
            sessionStorage.setItem("zads_token_registered", "true");
          }
        }
      } catch (err) {
        // Push notification registration failures must never crash client experience
        console.debug("[PUSH] Notification registration status:", err);
      }
    }

    registerPush();
  }, [session, status]);

  return null;
}

/**
 * Interactive helper to request notification permissions from UI action
 */
export async function requestNotificationAccess(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      let pushToken = localStorage.getItem("zads_fcm_token");
      if (!pushToken) {
        pushToken = "web_token_" + Math.random().toString(36).substring(2) + "_" + Date.now();
        localStorage.setItem("zads_fcm_token", pushToken);
      }
      await api.post("/notifications/register-token", { fcmToken: pushToken });
      sessionStorage.setItem("zads_token_registered", "true");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
