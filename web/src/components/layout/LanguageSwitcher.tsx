"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("lang");

  function switchLocale(next: "en" | "zh") {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className="flex overflow-hidden rounded border border-outline-variant"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-pressed={locale === "en"}
        aria-label={t("switchToEn")}
        className={cn(
          "px-3 py-2 text-label-caps transition-colors",
          locale === "en"
            ? "bg-primary text-on-primary"
            : "bg-surface text-on-surface-variant hover:bg-surface-container-high",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale("zh")}
        aria-pressed={locale === "zh"}
        aria-label={t("switchToZh")}
        className={cn(
          "px-3 py-2 text-label-caps transition-colors",
          locale === "zh"
            ? "bg-primary text-on-primary"
            : "bg-surface text-on-surface-variant hover:bg-surface-container-high",
        )}
      >
        中文
      </button>
    </div>
  );
}
