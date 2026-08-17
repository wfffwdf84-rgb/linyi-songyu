"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

export function QuoteForm() {
  const [urgent, setUrgent] = useState(false);
  const t = useTranslations("quote");

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border border-error bg-error-container p-6 shadow-sm transition-all",
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
        <label className="relative inline-block h-8 w-14 cursor-pointer">
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

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <MaterialIcon name="add_a_photo" className="text-secondary" />
            <h2 className="text-headline-md text-on-surface">{t("step1")}</h2>
          </div>
          <span className="rounded-full bg-surface-container px-3 py-1 text-label-caps text-on-surface-variant">
            {t("required")}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-container bg-primary-fixed/10 p-8 text-center hover:bg-primary-fixed/20"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-md group-hover:scale-110">
              <MaterialIcon name="photo_camera" className="text-3xl" />
            </div>
            <span className="mb-1 text-headline-md text-primary">{t("tapCamera")}</span>
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
              {t("vin")}
            </label>
            <input
              type="text"
              placeholder="e.g. LGMG9562021004"
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </div>
          <div>
            <label className="mb-2 block text-technical-data text-on-surface-variant">
              {t("brand")}
            </label>
            <select className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0">
              <option>{t("selectBrand")}</option>
              <option>SDLG</option>
              <option>Liugong</option>
              <option>XCMG</option>
              <option>ZF</option>
              <option>{t("other")}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-technical-data text-on-surface-variant">
              {t("notes")}
            </label>
            <textarea
              rows={3}
              placeholder={t("notesPlaceholder")}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-headline-md text-on-primary shadow-md hover:bg-surface-tint"
      >
        <MaterialIcon name="send" />
        {t("submit")}
      </button>

      <p className="text-center text-body-sm text-on-surface-variant">
        {t("needHelp")}{" "}
        <Link href="/quality-logistics" className="text-primary hover:underline">
          {t("viewQuality")}
        </Link>
      </p>
    </form>
  );
}
