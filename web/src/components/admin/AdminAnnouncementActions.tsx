"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { announcementErrorText } from "@/lib/announcement-messages";

/**
 * The two row actions that do not need the full editor: flip `active`, or drop
 * the announcement. Both revalidate the locale layout server-side, so
 * `router.refresh()` is only picking up this panel's own list.
 */
export function AdminAnnouncementActions({
  id,
  active,
  label,
}: {
  id: string;
  active: boolean;
  /** Used in the delete confirmation so the operator knows what they are removing. */
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function request(input: RequestInfo, init?: RequestInit) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(input, init);
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!response.ok || !data?.ok) {
        setError(announcementErrorText(data?.error));
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("网络错误，操作失败。");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function toggle() {
    void request("/api/admin/announcements", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, patch: { active: !active } }),
    });
  }

  function remove() {
    if (!window.confirm(`删除公告「${label}」？删除后前台立即不再显示，且无法撤销。`)) return;
    void request(`/api/admin/announcements?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-on-surface-variant hover:border-primary disabled:opacity-60"
      >
        <MaterialIcon name={active ? "pause" : "play_arrow"} className="text-[16px]" />
        {active ? "停用" : "启用"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded border border-error px-3 py-1 text-technical-data text-error hover:bg-error-container disabled:opacity-60"
      >
        <MaterialIcon name="delete" className="text-[16px]" />
        删除
      </button>
      {error ? (
        <span role="alert" className="text-body-sm text-error">
          {error}
        </span>
      ) : null}
    </span>
  );
}
