"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { inquirySmsHref, inquiryWhatsAppHref, openInquirySms, siteConfig } from "@/lib/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { type InquiryTypeId, inquiryTypeIds, normalizeInquiryType } from "@/lib/inquiry";
import { useQuoteList } from "@/components/quote/QuoteListProvider";

const inquiryTypeIcons: Record<InquiryTypeId, string> = {
  transmission: "settings",
  structural: "view_in_ar",
  brake: "disc_full",
  radiator: "device_thermostat",
  hydraulic: "water_drop",
  oemMatch: "pin",
  consol: "inventory_2",
  land: "local_shipping",
};

type QuoteFormProps = {
  initialTypes?: InquiryTypeId[];
};

export function QuoteForm({ initialTypes = [] }: QuoteFormProps) {
  const [urgent, setUrgent] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");
  const [selected, setSelected] = useState<InquiryTypeId[]>(initialTypes);
  const [typeError, setTypeError] = useState(false);
  const [smsHint, setSmsHint] = useState(false);
  const [smsDraft, setSmsDraft] = useState("");
  const [smsCopied, setSmsCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("quote");
  const locale = useLocale();
  const { items } = useQuoteList();
  const mergedTypes = useRef(false);

  useEffect(() => {
    if (mergedTypes.current || items.length === 0) return;
    mergedTypes.current = true;
    setSelected((current) => {
      const extra = items.map((item) => normalizeInquiryType(item.inquiryType));
      return [...new Set([...current, ...extra])];
    });
  }, [items]);

  function toggleType(id: InquiryTypeId) {
    setTypeError(false);
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function buildBody(form: HTMLFormElement) {
    if (selected.length === 0) {
      setTypeError(true);
      return null;
    }
    const fd = new FormData(form);
    const company = String(fd.get("company") ?? "").trim();
    const contact = String(fd.get("contact") ?? "").trim();
    const vin = String(fd.get("vin") ?? "").trim();
    const brand = String(fd.get("brand") ?? "").trim();
    const notes = String(fd.get("notes") ?? "").trim();
    const isZh = locale === "zh";
    const typeLabels = selected.map((id) => t(`type_${id}`)).join(isZh ? "、" : ", ");

    const parts =
      items.length > 0
        ? [
            isZh ? "零件" : "Parts",
            ...items.map((item) => `- ${item.partNumber} x${item.qty}`),
          ]
        : [];

    return [
      isZh ? "【临沂松昱询价】" : "[Linyi Songyu Inquiry]",
      `${isZh ? "种类" : "Type"}: ${typeLabels}`,
      urgent ? (isZh ? "紧急 / 停机" : "URGENT / Machine down") : "",
      ...parts,
      company ? `${isZh ? "公司" : "Company"}: ${company}` : "",
      `${isZh ? "联系电话" : "Phone"}: ${contact}`,
      vin ? `VIN: ${vin}` : "",
      brand && brand !== t("selectBrand") ? `${isZh ? "品牌" : "Brand"}: ${brand}` : "",
      photoName ? `${isZh ? "已选照片" : "Photo"}: ${photoName}` : "",
      notes ? `${isZh ? "需求" : "Need"}: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function buildPayload(form: HTMLFormElement) {
    const fd = new FormData(form);
    return {
      locale,
      page: window.location.pathname,
      types: selected,
      urgent,
      company: String(fd.get("company") ?? ""),
      contact: String(fd.get("contact") ?? ""),
      vin: String(fd.get("vin") ?? ""),
      brand: String(fd.get("brand") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      photoName,
      items: items.map((item) => ({ partNumber: item.partNumber, qty: item.qty })),
    };
  }

  /**
   * Record the inquiry on the server before WhatsApp opens. The WhatsApp
   * hand-off stays the primary path, but a blocked popup or a buyer without
   * WhatsApp no longer loses the lead. Returns the reference or "".
   */
  async function saveInquiry(form: HTMLFormElement) {
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });
      if (!response.ok) return "";
      const data = (await response.json()) as { ok?: boolean; reference?: string };
      return data.ok ? (data.reference ?? "") : "";
    } catch {
      return "";
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = buildBody(form);
    if (!body) return;
    setSaving(true);
    const saved = await saveInquiry(form);
    setSaving(false);
    setReference(saved);
    track("generate_lead", {
      inquiry_types: selected.join(","),
      urgent,
      parts: items.length,
    });
    window.open(inquiryWhatsAppHref(body), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  async function copySms(body: string) {
    try {
      await navigator.clipboard.writeText(body);
      setSmsCopied(true);
    } catch {
      setSmsCopied(false);
    }
  }

  async function onSms() {
    const form = formRef.current;
    if (!form) return;
    if (!form.reportValidity()) {
      form.querySelector(":invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const body = buildBody(form);
    if (!body) {
      document.getElementById("quote-types")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSmsDraft(body);
    setSmsHint(true);
    await copySms(body);
    openInquirySms(body);
  }

  return (
    <form ref={formRef} className="space-y-6" onSubmit={onSubmit}>
      {sent ? (
        <div className="rounded-xl border-2 border-primary bg-primary-fixed/10 p-6">
          <h3 className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
            <MaterialIcon name="check_circle" filled className="text-primary" />
            {t("sentTitle")}
          </h3>
          <p className="mb-4 text-body-sm text-on-surface-variant">{t("sentDesc")}</p>
          {reference ? (
            <p className="mb-4 text-technical-data text-on-surface">
              {t("reference")}: <span className="font-bold">{reference}</span>
            </p>
          ) : null}
          <div className="flex flex-col gap-3">
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 text-headline-md text-white"
            >
              <WhatsAppIcon className="h-6 w-6" />
              WhatsApp
            </a>
            <a
              href={siteConfig.tel}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-headline-md text-on-primary"
            >
              <MaterialIcon name="call" filled />
              {t("callNow")} {siteConfig.phone}
            </a>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-error bg-error-container p-6 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between",
          urgent && "scale-[1.02] shadow-md",
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-lg bg-error p-3 text-on-error">
            <MaterialIcon name="warning" filled className="text-3xl" />
          </div>
          <div>
            <h3 className="text-headline-md text-on-error-container">{t("urgentTitle")}</h3>
            <p className="text-body-sm text-on-error-container opacity-80">{t("urgentDesc")}</p>
          </div>
        </div>
        <label className="relative inline-block h-8 w-14 shrink-0 cursor-pointer self-end sm:self-auto">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
            className="peer sr-only"
          />
          <span className="block h-8 rounded-full border border-outline-variant bg-surface-variant peer-checked:bg-error" />
          <span className="absolute top-1 left-0 h-6 w-6 rounded-full border-4 border-outline bg-white transition-transform peer-checked:translate-x-6" />
        </label>
      </div>

      <div
        id="quote-types"
        className={cn(
          "rounded-xl border bg-surface-container-lowest p-6 shadow-sm",
          typeError ? "border-error" : "border-outline-variant",
        )}
      >
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <MaterialIcon name="category" className="text-secondary" />
            <h2 className="text-headline-md text-on-surface">{t("stepTypes")}</h2>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-label-caps text-primary">
            {t("required")}
          </span>
        </div>
        <p className="mb-4 text-body-sm text-on-surface-variant">{t("typesHint")}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {inquiryTypeIds.map((id) => {
            const active = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleType(id)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary-fixed/20 text-on-surface"
                    : "border-outline-variant bg-surface hover:border-primary/50",
                )}
              >
                <MaterialIcon
                  name={inquiryTypeIcons[id]}
                  className={cn("text-xl", active ? "text-primary" : "text-secondary")}
                />
                <span className="text-technical-data font-semibold">{t(`type_${id}`)}</span>
              </button>
            );
          })}
        </div>
        {typeError ? (
          <p className="mt-3 text-body-sm text-error">{t("typesError")}</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <MaterialIcon name="add_a_photo" className="text-secondary" />
            <h2 className="text-headline-md text-on-surface">{t("step1")}</h2>
          </div>
          <span className="rounded-full bg-surface-container px-3 py-1 text-label-caps text-on-surface-variant">
            {t("optional")}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-container bg-primary-fixed/10 p-8 text-center hover:bg-primary-fixed/20"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-md group-hover:scale-110">
              <MaterialIcon name="photo_camera" className="text-3xl" />
            </div>
            <span className="mb-1 text-headline-md text-primary">
              {photoName || t("tapCamera")}
            </span>
            <span className="text-body-sm text-on-surface-variant">{t("uploadHint")}</span>
          </button>
          <div className="flex flex-col justify-center rounded-xl border border-outline-variant bg-surface-container-low p-4">
            <h4 className="mb-3 flex items-center gap-2 text-technical-data text-on-surface">
              <MaterialIcon name="info" className="text-[18px] text-tertiary" />
              {t("acceptable")}
            </h4>
            <ul className="space-y-2 text-body-sm text-on-surface-variant">
              {[t("img1"), t("img2"), t("img3")].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="mt-0.5 text-[16px] text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-outline-variant pb-4">
          <MaterialIcon name="pin" className="text-secondary" />
          <h2 className="text-headline-md text-on-surface">{t("step2")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-technical-data text-on-surface-variant">
              {t("company")}
            </label>
            <input
              name="company"
              type="text"
              placeholder={t("companyPlaceholder")}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </div>
          <div>
            <label className="mb-2 block text-technical-data text-on-surface-variant">
              {t("contact")}
            </label>
            <input
              name="contact"
              type="tel"
              required
              placeholder={t("contactPlaceholder")}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </div>
          <div>
            <label className="mb-2 block text-technical-data text-on-surface-variant">
              {t("vin")}
            </label>
            <input
              name="vin"
              type="text"
              placeholder="e.g. LGMG9562021004"
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </div>
          <div>
            <label className="mb-2 block text-technical-data text-on-surface-variant">
              {t("brand")}
            </label>
            <select
              name="brand"
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            >
              <option>{t("selectBrand")}</option>
              <option>SDLG</option>
              <option>Lonking</option>
              <option>Liugong</option>
              <option>XCMG</option>
              <option>XGMA</option>
              <option>SANY</option>
              <option>Shantui</option>
              <option>ZF</option>
              <option>{t("other")}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-technical-data text-on-surface-variant">
              {t("notes")}
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder={t("notesPlaceholder")}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 text-headline-md text-white shadow-md hover:brightness-110 disabled:opacity-60"
      >
        <WhatsAppIcon className="h-6 w-6" />
        {t("submit")}
      </button>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void onSms()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-lowest py-3 text-technical-data text-on-surface hover:border-primary"
        >
          <MaterialIcon name="sms" className="text-primary" />
          {t("submitSms")}
        </button>
        <a
          href={siteConfig.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-lowest py-3 text-technical-data text-on-surface hover:border-primary"
        >
          <FacebookIcon className="h-5 w-5" />
          Facebook
        </a>
      </div>
      {smsHint && smsDraft ? (
        <div className="space-y-3 rounded-xl border-2 border-primary bg-primary-fixed/10 p-4">
          <h3 className="text-headline-md text-on-surface">{t("smsPanelTitle")}</h3>
          <p className="text-body-sm text-on-surface-variant">{t("smsDesktopHint")}</p>
          <p className="text-technical-data font-bold text-on-surface">
            {t("smsTo")} {siteConfig.phone}
          </p>
          <textarea
            readOnly
            value={smsDraft}
            rows={6}
            className="w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 font-mono text-body-sm text-on-surface"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a
              href={inquirySmsHref(smsDraft, false)}
              className="flex items-center justify-center gap-1 rounded-xl border-2 border-outline-variant bg-surface py-3 text-technical-data text-on-surface hover:border-primary"
            >
              <MaterialIcon name="sms" className="text-primary" />
              {t("smsOpenApp")}
            </a>
            <button
              type="button"
              onClick={() => void copySms(smsDraft)}
              className="flex items-center justify-center gap-1 rounded-xl border-2 border-outline-variant bg-surface py-3 text-technical-data text-on-surface hover:border-primary"
            >
              <MaterialIcon name="content_copy" className="text-primary" />
              {smsCopied ? t("smsCopied") : t("smsCopy")}
            </button>
            <a
              href={inquiryWhatsAppHref(smsDraft)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 rounded-xl bg-[#25D366] py-3 text-technical-data text-white hover:brightness-110"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t("smsSendWhatsApp")}
            </a>
          </div>
        </div>
      ) : null}
      <a
        href={siteConfig.tel}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-lowest py-3 text-technical-data text-on-surface hover:border-primary"
      >
        <MaterialIcon name="call" className="text-primary" />
        {t("callNow")} {siteConfig.phone}
      </a>

      <p className="text-center text-body-sm text-on-surface-variant">
        {t("needHelp")}{" "}
        <Link href="/quality-logistics" className="text-primary hover:underline">
          {t("viewQuality")}
        </Link>
      </p>
    </form>
  );
}
