"use client";

import { useState, type FormEvent } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const MESSAGES: Record<string, string> = {
  unauthorized: "Wrong password.",
  too_many_attempts: "Too many attempts. Try again later.",
  not_configured: "FACTORY_VIDEO_PASSWORD is not set on this deployment.",
  network: "Network error.",
};

export function InquiryDeskLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/factory-videos/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        window.location.reload();
        return;
      }
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(MESSAGES[data?.error ?? ""] ?? MESSAGES.unauthorized);
    } catch {
      setError(MESSAGES.network);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <h1 className="flex items-center gap-2 text-headline-md text-on-surface">
        <MaterialIcon name="inbox" className="text-primary" />
        Inquiry desk
      </h1>
      <p className="text-body-sm text-on-surface-variant">
        Enter the factory password to read captured inquiries.
      </p>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
        placeholder="Password"
      />
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="w-full rounded-xl bg-primary py-3 text-headline-md text-on-primary disabled:opacity-60"
      >
        {busy ? "Checking..." : "Open"}
      </button>
    </form>
  );
}
