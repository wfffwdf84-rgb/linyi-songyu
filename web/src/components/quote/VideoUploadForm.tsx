"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { inquiryWhatsAppHref, siteConfig } from "@/lib/site";

const WARN_BYTES = 16 * 1024 * 1024;

function canShareVideo(file: File) {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export function VideoUploadForm() {
  const t = useTranslations("video");
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [sent, setSent] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [contactError, setContactError] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPick(next: File | null) {
    if (next && !next.type.startsWith("video/")) {
      setFile(null);
      setFileError(true);
      return;
    }
    setFileError(false);
    setFile(next);
  }

  function buildBody(contact: string, notes: string) {
    const isZh = locale === "zh";
    return [
      isZh ? "【临沂松昱询价 / 视频】" : "[Linyi Songyu Inquiry / video]",
      `${isZh ? "联系电话" : "Phone"}: ${contact}`,
      file ? `${isZh ? "视频" : "Video"}: ${file.name}` : "",
      notes ? `${isZh ? "需求" : "Need"}: ${notes}` : "",
      isZh ? "视频将在 WhatsApp 对话中发送。" : "Video to be sent in the WhatsApp chat.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const contact = String(fd.get("contact") ?? "").trim();
    const notes = String(fd.get("notes") ?? "").trim();
    if (!file) {
      setFileError(true);
      return;
    }
    if (!contact) {
      setContactError(true);
      return;
    }
    setContactError(false);
    const body = buildBody(contact, notes);

    if (canShareVideo(file)) {
      try {
        await navigator.share({
          files: [file],
          title: locale === "zh" ? "临沂松昱询价" : "Linyi Songyu Inquiry",
          text: body,
        });
        setSent(true);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    window.open(inquiryWhatsAppHref(body), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border-2 border-primary bg-primary-fixed/10 p-6">
        <h2 className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="check_circle" filled className="text-primary" />
          {t("sentTitle")}
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">{t("sentDesc")}</p>
        <a
          href={siteConfig.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 text-headline-md text-white"
        >
          <WhatsAppIcon className="h-6 w-6" />
          WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-container bg-primary-fixed/10 p-8 text-center hover:bg-primary-fixed/20"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-md group-hover:scale-110">
            <MaterialIcon name="videocam" className="text-3xl" />
          </div>
          <span className="mb-1 text-headline-md text-primary">{file ? t("change") : t("pick")}</span>
          <span className="text-body-sm text-on-surface-variant">{file?.name ?? t("hint")}</span>
        </button>
        {fileError ? <p className="mt-3 text-body-sm text-error">{t("fileError")}</p> : null}
        {file && file.size > WARN_BYTES ? (
          <p className="mt-3 text-body-sm text-on-surface-variant">{t("sizeWarn")}</p>
        ) : null}
        {preview ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-outline-variant bg-on-secondary-fixed">
            <p className="px-3 py-2 text-label-caps text-secondary-fixed-dim">{t("preview")}</p>
            <video src={preview} controls playsInline className="aspect-video w-full bg-black" />
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="mb-2 block text-technical-data text-on-surface-variant" htmlFor="video-contact">
              {t("contact")}
            </label>
            <input
              id="video-contact"
              name="contact"
              type="tel"
              required
              placeholder={t("contactPlaceholder")}
              onChange={() => setContactError(false)}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
            {contactError ? <p className="mt-2 text-body-sm text-error">{t("contactError")}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-technical-data text-on-surface-variant" htmlFor="video-notes">
              {t("notes")}
            </label>
            <textarea
              id="video-notes"
              name="notes"
              rows={3}
              placeholder={t("notesPlaceholder")}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </div>
        </div>
      </div>

      <p className="text-body-sm text-on-surface-variant">{t("privacyNote")}</p>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-headline-md text-on-primary hover:bg-primary-container"
      >
        <WhatsAppIcon className="h-6 w-6" />
        {t("sendWhatsApp")}
      </button>
    </form>
  );
}
