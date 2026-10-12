"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { gaMeasurementId, track } from "@/lib/analytics";

type Props = {
  /** Locale of the rendered page, reported alongside every event. */
  locale: string;
};

export function GoogleAnalytics({ locale }: Props) {
  const pathname = usePathname();

  // The App Router swaps pages without a document load, so GA4 is configured
  // with send_page_view: false and each route is reported from here instead.
  useEffect(() => {
    if (!gaMeasurementId) return;
    track("page_view", { page_path: pathname, page_language: locale });
  }, [pathname, locale]);

  // One delegated listener measures contact intent without touching every
  // WhatsApp, phone and mail link in the UI.
  useEffect(() => {
    if (!gaMeasurementId) return;
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (href.startsWith("https://wa.me/")) track("contact_whatsapp", { page_path: pathname });
      else if (href.startsWith("tel:")) track("contact_phone", { page_path: pathname });
      else if (href.startsWith("mailto:")) track("contact_email", { page_path: pathname });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  if (!gaMeasurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}', { send_page_view: false });`}
      </Script>
    </>
  );
}
