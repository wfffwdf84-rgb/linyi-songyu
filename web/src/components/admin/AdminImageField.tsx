"use client";

import { useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const inputClass =
  "w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0";

const UPLOAD_ERRORS: Record<string, string> = {
  too_large: "文件超过 5 MB，请先压缩。",
  unsupported_type: "只支持 JPEG / PNG / WebP，且文件内容必须与扩展名一致。",
  no_file: "请选择一张图片。",
  invalid_body: "上传内容无法识别，请重试。",
  not_configured: "服务器未配置 Blob 存储，无法上传。",
  upload_failed: "上传失败，请稍后重试。",
  unauthorized: "登录已过期，请重新登录。",
  forbidden: "需要所有者或运营权限。",
};

/**
 * The image field shared by "new product" and the editor: a URL (an upload
 * result or an existing /images/... path), a file picker that uploads to Blob,
 * and a live preview. The preview is a plain <img> because the operator is
 * typing a URL that may not be valid yet; the public pages render the saved
 * value through next/image.
 */
export function AdminImageField({
  value,
  onChange,
  slug,
  disabled = false,
}: {
  value: string;
  onChange: (next: string) => void;
  slug: string;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("slug", slug.trim() || "product");
      const response = await fetch("/api/admin/products/upload", { method: "POST", body: form });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; url?: string; error?: string }
        | null;
      if (!response.ok || !data?.ok || !data.url) {
        setError(UPLOAD_ERRORS[data?.error ?? ""] ?? "上传失败，请稍后重试。");
        return;
      }
      onChange(data.url);
      setNotice("已上传，保存产品后生效。");
    } catch {
      setError("网络错误，上传失败。");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://<项目>.supabase.co/storage/v1/object/public/songyu-media/products/… 或 /images/products/…"
          maxLength={500}
          spellCheck={false}
          disabled={disabled}
          className={inputClass}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || busy}
          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-outline-variant px-4 py-2 text-body-md text-on-surface-variant hover:border-primary disabled:opacity-60"
        >
          <MaterialIcon name="upload" className="text-[18px]" />
          {busy ? "上传中…" : "上传图片"}
        </button>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-white p-2">
          {value.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element -- a half-typed URL must not crash the form
            <img src={value.trim()} alt="产品图片预览" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-body-sm text-on-surface-variant">无图片</span>
          )}
        </div>
        <p className="min-w-0 flex-1 text-body-sm text-on-surface-variant">
          JPEG / PNG / WebP，单张 ≤ 5 MB。上传后得到完整 https 地址；也可以直接填站内路径
          （如 <code>/images/products/zx-800.webp</code>）。外部域不在白名单内会被拒绝。
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      ) : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
    </div>
  );
}
