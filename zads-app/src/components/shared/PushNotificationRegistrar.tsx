"use client";

import { useEffect } from "react";

/**
 * Push Notification Registrar
 * Push is disabled until a real messaging provider and token flow are integrated.
 */
export function PushNotificationRegistrar() {
  useEffect(() => {
    // Remove tokens created by the previous placeholder implementation.
    if (typeof window !== "undefined") {
      try {
        const existing = localStorage.getItem("zads_fcm_token");
        if (existing?.startsWith("web_token_")) {
          localStorage.removeItem("zads_fcm_token");
          sessionStorage.removeItem("zads_token_registered");
        }
      } catch {
        // Storage may be unavailable in private browsing.
      }
    }
  }, []);

  return null;
}

/**
 * Interactive helper to request notification permissions from UI action
 */
export async function requestNotificationAccess(): Promise<boolean> {
  // Permission alone is not a registered subscription and must not be reported as success.
  return false;
}
