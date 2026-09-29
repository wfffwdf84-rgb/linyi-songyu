"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { siteConfig } from "@/lib/site";
import { SocialTiles } from "@/components/layout/SocialTiles";
import { categories } from "@/lib/data/categories";
import { loc } from "@/lib/locale";
import { mapsOpenHref } from "@/lib/maps";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const locale = useLocale();
  const brand = locale === "zh" ? siteConfig.shortNameZh : siteConfig.shortName;
  const legalName = locale === "zh" ? siteConfig.nameZh : siteConfig.name;

  const linkClass = "text-sm text-secondary-fixed-dim hover:text-primary-fixed";

  return (
    <footer className="mt-auto border-t-4 border-primary bg-on-secondary-fixed">
      <div className="mx-auto grid w-full max-w-container-max grid-cols-1 gap-10 px-margin-mobile py-12 md:grid-cols-12 md:px-margin-desktop">
        <div className="md:col-span-3">
          <div className="mb-4 flex items-center gap-2 text-headline-md text-primary-fixed">
            <BrandLogo size="sm" />
            {brand}
          </div>
          <p className="mb-2 text-body-sm text-white/90">{legalName}</p>
          <p className="max-w-sm text-body-sm text-secondary-fixed-dim">{t("tagline")}</p>
          <SocialTiles />
        </div>
        <div className="md:col-span-2">
          <h2 className="mb-4 text-label-caps tracking-widest text-primary-fixed uppercase">{t("products")}</h2>
          <ul className="flex flex-col gap-3">
            <li>
              <Link href="/parts" className={linkClass}>
                {tNav("allProducts")}
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/parts/${category.slug}`} className={linkClass}>
                  {loc(locale, category.name.en, category.name.zh)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="mb-4 text-label-caps tracking-widest text-primary-fixed uppercase">{t("company")}</h2>
          <ul className="flex flex-col gap-3">
            <li>
              <Link href="/about" className={linkClass}>
                {t("about")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className={linkClass}>
                {t("contactSupport")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className={`${linkClass} text-primary-fixed`}>
                {t("rfq")}
              </Link>
            </li>
            <li>
              <Link href="/upload-video" className={linkClass}>
                {t("uploadVideo")}
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="mb-4 text-label-caps tracking-widest text-primary-fixed uppercase">{t("logistics")}</h2>
          <ul className="flex flex-col gap-3">
            <li>
              <Link href="/quality-logistics" className={linkClass}>
                {t("qualityControl")}
              </Link>
            </li>
            <li>
              <Link href="/quality-logistics#sea" className={linkClass}>
                {t("shippingPolicy")}
              </Link>
            </li>
            <li>
              <Link href="/quality-logistics#land" className={linkClass}>
                {t("landFreight")}
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="mb-4 text-label-caps tracking-widest text-primary-fixed uppercase">{t("contact")}</h2>
          <ul className="flex flex-col gap-3 text-sm text-secondary-fixed-dim">
            <li>
              <a href={siteConfig.tel} className="hover:text-primary-fixed">
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-fixed"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-primary-fixed">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={mapsOpenHref(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-fixed"
              >
                {tContact("locationValue")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-container-max flex-col justify-between gap-2 px-margin-mobile py-4 text-xs text-secondary-fixed-dim md:flex-row md:px-margin-desktop">
          <p>
            © {new Date().getFullYear()} {legalName}
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/shipping" className="hover:text-primary-fixed">
              {t("legalShipping")}
            </Link>
            <Link href="/payment" className="hover:text-primary-fixed">
              {t("legalPayment")}
            </Link>
            <Link href="/privacy" className="hover:text-primary-fixed">
              {t("legalPrivacy")}
            </Link>
            <Link href="/terms" className="hover:text-primary-fixed">
              {t("legalTerms")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
