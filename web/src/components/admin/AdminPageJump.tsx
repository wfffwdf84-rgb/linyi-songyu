"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Props = {
  current: number;
  pageCount: number;
  query?: string;
};

/**
 * Fifteen pages of catalogue, three page numbers at a time: reaching page 12 by
 * clicking is tedious, so this jumps straight there. Whatever is typed is
 * clamped into range instead of producing an empty page.
 */
export function AdminPageJump({ current, pageCount, query }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(String(current));

  function go(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number.parseInt(value, 10);
    const target = Math.min(Math.max(Number.isFinite(parsed) ? parsed : 1, 1), pageCount);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (target > 1) params.set("page", String(target));
    const suffix = params.toString();
    router.push(suffix ? `/admin/products?${suffix}` : "/admin/products");
  }

  return (
    <form onSubmit={go} className="ms-auto flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-on-surface-variant">跳到第</span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        autoComplete="off"
        aria-label="页码"
        className="w-16 rounded border border-outline-variant bg-surface px-2 py-1 text-center text-body-sm text-on-surface focus:border-primary focus:ring-0"
      />
      <span className="text-body-sm text-on-surface-variant">页 · 共 {pageCount} 页</span>
      <button
        type="submit"
        className="rounded border border-outline-variant px-3 py-1 text-body-sm text-on-surface-variant hover:border-primary"
      >
        跳转
      </button>
    </form>
  );
}
