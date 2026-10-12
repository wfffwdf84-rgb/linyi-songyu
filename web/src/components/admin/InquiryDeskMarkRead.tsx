"use client";

import { useEffect, useRef } from "react";

/**
 * Records the read watermark once the desk is actually on screen. Doing it here
 * rather than during the server render means a prefetch or a crawler cannot
 * mark leads as seen.
 */
export function InquiryDeskMarkRead({ upTo }: { upTo: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !upTo) return;
    sent.current = true;
    void fetch("/api/inquiries/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ upTo }),
    }).catch(() => {
      // the badge simply shows the same leads as new next time
    });
  }, [upTo]);

  return null;
}
