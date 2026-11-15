"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function AdminLogoutButton() {
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // fall through: the redirect shows the login form when the cookie is gone
    }
    // A full load on purpose: the session cookie is gone server-side and the
    // layout must re-render without a stale client-side shell.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={() => void onLogout()}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-on-surface-variant hover:border-primary disabled:opacity-60"
    >
      <MaterialIcon name="logout" className="text-[16px]" />
      退出
    </button>
  );
}
