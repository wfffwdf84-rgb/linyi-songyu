"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { inquiryWhatsAppHref, siteConfig } from "@/lib/site";
import { track } from "@/lib/analytics";

/**
 * Async message box: no third-party chat script, so the strict CSP is untouched
 * and every message lands in the same encrypted store as the contact form.
 * Contact details are required; the browser handles the empty-field prompts in
 * the visitor's own language.
 */
export function MessageBox() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reference, setReference] = useState("");
  /** The text the buyer just submitted; kept so the hand-off links carry it. */
  const [fallbackBody, setFallbackBody] = useState("");
  const t = useTranslations("quote");
  const locale = useLocale();
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function composeBody(contact: string, message: string) {
    const isZh = locale === "zh";
    return [
      isZh ? "【临沂松昱留言】" : "[Linyi Songyu Message]",
      `${t("contact")}: ${contact}`,
      `${t("msgLabel")}: ${message}`,
    ].join("\n");
  }

  useEffect(() => {
    if (open && !sent) messageRef.current?.focus();
  }, [open, sent]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /** After a failure, the hand-off links follow whatever is now on screen. */
  function refreshFallback(event: FormEvent<HTMLFormElement>) {
    if (!failed) return;
    const data = new FormData(event.currentTarget);
    setFallbackBody(
      composeBody(String(data.get("contact") ?? ""), String(data.get("message") ?? "")),
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const contact = String(data.get("contact") ?? "");
    const message = String(data.get("message") ?? "");
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          page: window.location.pathname,
          contact,
          message,
          website: String(data.get("website") ?? ""),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; reference?: string; error?: string }
        | null;
      if (!response.ok || !result?.ok) {
        // A 5xx (or storage_unavailable) means the lead was not stored: keep the
        // message on screen and give the buyer a way to reach sales directly.
        setFallbackBody(composeBody(contact, message));
        setFailed(true);
        setBusy(false);
        return;
      }
      setReference(result.reference ?? "");
      setSent(true);
      track("generate_lead", { source: "message_box" });
    } catch {
      setFallbackBody(composeBody(contact, message));
      setFailed(true);
    }
    setBusy(false);
  }

  return (
    <>
      {open ? (
        <div className="max-h-[calc(100dvh-9rem)] w-[min(21rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-outline-variant bg-surface-container-low px-4 py-3">
            <h2 className="flex items-center gap-2 text-technical-data font-semibold text-on-surface">
              <MaterialIcon name="chat" className="text-primary" />
              {t("msgTitle")}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <MaterialIcon name="close" className="text-[20px]" />
            </button>
          </div>

          {sent ? (
            <div className="space-y-3 p-4">
              <p className="flex items-start gap-2 text-body-sm text-on-surface">
                <MaterialIcon name="check_circle" filled className="mt-0.5 text-primary" />
                {t("msgSent")}
              </p>
              {reference ? (
                <p className="text-technical-data text-on-surface-variant">
                  {t("reference")}: <span className="font-bold text-on-surface">{reference}</span>
                </p>
              ) : null}
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-technical-data text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} onChange={refreshFallback} className="space-y-3 p-4">
              <p className="text-body-sm text-on-surface-variant">{t("msgLead")}</p>

              <div>
                <label className="mb-1 block text-technical-data text-on-surface-variant" htmlFor="msg-contact">
                  {t("contact")}
                </label>
                <input
                  id="msg-contact"
                  name="contact"
                  type="text"
                  required
                  autoComplete="tel"
                  placeholder={t("contactPlaceholder")}
                  className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
                />
              </div>

              <div>
                <label className="mb-1 block text-technical-data text-on-surface-variant" htmlFor="msg-body">
                  {t("msgLabel")}
                </label>
                <textarea
                  id="msg-body"
                  ref={messageRef}
                  name="message"
                  required
                  rows={3}
                  placeholder={t("msgPlaceholder")}
                  className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0"
                />
              </div>

              {/* honeypot: hidden from visitors, filled only by bots */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="msg-website">Website</label>
                <input id="msg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {failed ? (
                <div className="space-y-2 rounded-xl border-2 border-error bg-error-container p-3">
                  <h3 className="flex items-start gap-2 text-technical-data font-semibold text-on-error-container">
                    <MaterialIcon name="cloud_off" filled className="shrink-0 text-[20px]" />
                    <span className="min-w-0 break-words">{t("fallbackTitle")}</span>
                  </h3>
                  <p className="text-body-sm text-on-error-container">{t("fallbackBody")}</p>
                  <a
                    href={inquiryWhatsAppHref(fallbackBody)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-center text-technical-data font-semibold text-white hover:brightness-110"
                  >
                    <WhatsAppIcon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0 break-words">{t("fallbackWhatsApp")}</span>
                  </a>
                  <a
                    href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
                      t("fallbackMailSubject"),
                    )}&body=${encodeURIComponent(fallbackBody)}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-outline-variant bg-surface px-3 py-2 text-center text-body-sm text-on-surface hover:border-primary"
                  >
                    <MaterialIcon name="mail" className="shrink-0 text-primary" />
                    <span className="min-w-0 break-words">{t("fallbackEmail")}</span>
                  </a>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-primary py-3 text-technical-data font-semibold text-on-primary disabled:opacity-60"
              >
                {t("msgSubmit")}
              </button>
            </form>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t("msgTitle")}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg hover:brightness-110 md:h-14 md:w-14"
      >
        <MaterialIcon name={open ? "close" : "chat"} className="text-2xl md:text-3xl" />
      </button>
    </>
  );
}
