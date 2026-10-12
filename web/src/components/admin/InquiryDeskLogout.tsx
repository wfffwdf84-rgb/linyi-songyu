"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function InquiryDeskLogout({ label }: { label: string }) {
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      await fetch("/api/factory-videos/logout", { method: "POST" });
    } catch {
      // fall through: reloading still shows the login form when the cookie is gone
    }
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={() => void onLogout()}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-on-surface-variant hover:border-primary disabled:opacity-60"
    >
      <MaterialIcon name="logout" className="text-[16px]" />
      {label}
    </button>
  );
}
