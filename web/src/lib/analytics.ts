/**
 * GA4 wiring. Everything here is inert until NEXT_PUBLIC_GA_ID is set, so the
 * site ships no third-party script and no cookies for as long as the ID is
 * empty.
 */
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Report an event to GA4. No-op when the measurement ID is unset. */
export function track(event: string, params: EventParams = {}) {
  if (!gaMeasurementId) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}
