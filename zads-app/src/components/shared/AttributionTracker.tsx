"use client";

import { useEffect } from "react";
import api from "@/lib/api";

export function AttributionTracker() {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get("utm_source");
      const utmMedium = searchParams.get("utm_medium");
      const utmCampaign = searchParams.get("utm_campaign");
      const utmTerm = searchParams.get("utm_term");

      // Generate or reuse session ID
      let sessionId = sessionStorage.getItem("zads_session_id");
      if (!sessionId) {
        sessionId = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem("zads_session_id", sessionId);
      }

      if (utmSource || utmCampaign || utmMedium) {
        sessionStorage.setItem(
          "zads_utm",
          JSON.stringify({ utmSource, utmMedium, utmCampaign, utmTerm })
        );

        // Authoritative server-side attribution logging
        api
          .post("/analytics/attribution", {
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            landingPage: window.location.pathname,
            sessionId,
          })
          .catch(() => {
            // Non-blocking, analytics failure never interrupts user
          });
      }
    } catch {
      // Safety fallback
    }
  }, []);

  return null;
}
