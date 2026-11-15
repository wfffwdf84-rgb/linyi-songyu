"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

/** Records the read watermark so the "new" chips clear for every operator. */
export function AdminMarkReadButton({ upTo, count }: { upTo: string; count: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onMarkRead() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/inquiries/read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ upTo }),
      });
      if (!response.ok) {
        setError("标记失败");
        setBusy(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("网络错误");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void onMarkRead()}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-on-surface-variant hover:border-primary disabled:opacity-60"
      >
        <MaterialIcon name="mark_email_read" className="text-[16px]" />
        {busy ? "处理中…" : `全部标记已读（${count}）`}
      </button>
      {error ? <span className="text-body-sm text-error">{error}</span> : null}
    </span>
  );
}

/** Deleting a lead is destructive, so only owner/editor see the control. */
export function AdminDeleteInquiryButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    if (!window.confirm("删除这条询盘？删除后无法恢复。")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        setError("删除失败");
        setBusy(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("网络错误");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void onDelete()}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-error hover:border-error disabled:opacity-60"
      >
        <MaterialIcon name="delete" className="text-[16px]" />
        {busy ? "删除中…" : "删除"}
      </button>
      {error ? <span className="text-body-sm text-error">{error}</span> : null}
    </span>
  );
}
