"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto flex w-full flex-col justify-between border-t-4 border-primary bg-on-secondary-fixed px-margin-mobile py-12 md:flex-row md:px-margin-desktop">
      <div className="mb-8 md:mb-0">
        <div className="mb-4 flex items-center gap-2 text-headline-md text-primary-fixed">
          <MaterialIcon name="construction" filled />
          {siteConfig.shortName}
        </div>
        <p className="max-w-sm text-body-sm text-secondary-fixed-dim">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-8 md:flex md:gap-12">
        <div className="flex flex-col gap-2">
          <Link
            href="/parts/transmission-systems"
            className="text-label-caps text-secondary-fixed-dim hover:text-primary-fixed"
          >
            {t("oemSearch")}
          </Link>
          <Link
            href="/quality-logistics"
            className="text-label-caps text-secondary-fixed-dim hover:text-primary-fixed"
          >
            {t("qualityControl")}
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/quality-logistics"
            className="text-label-caps text-secondary-fixed-dim hover:text-primary-fixed"
          >
            {t("shippingPolicy")}
          </Link>
          <Link
            href="/request-quote"
            className="text-label-caps text-secondary-fixed-dim hover:text-primary-fixed"
          >
            {t("contactSupport")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
