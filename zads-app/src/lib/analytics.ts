/** GA4 Measurement ID for zads.app (public client-side tag). */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-00DPVWBBDZ";

export type AnalyticsEvent =
  | "sign_up_teacher"
  | "sign_up_parent"
  | "contact_request"
  | "contact_support"
  | "view_teacher_profile"
  | "join_teacher_cta";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, params?: EventParams) {
  if (typeof window === "undefined") return;
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

  window.gtag("event", event, params);
}

export function trackPageView(url: string) {
  if (typeof window === "undefined") return;
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}
