"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ProductSearchForm } from "@/components/catalog/ProductSearchForm";
import { ProductsMenu } from "@/components/layout/ProductsMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { QuoteCountBadge } from "@/components/quote/QuoteSummary";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const brand = locale === "zh" ? siteConfig.shortNameZh : siteConfig.shortName;

  const navItems = [
    { href: "/", label: t("home"), match: pathname === "/" },
    { href: "/about", label: t("about"), match: pathname === "/about" },
    {
      href: "/quality-logistics",
      label: t("quality"),
      match: pathname === "/quality-logistics",
    },
    { href: "/contact", label: t("contact"), match: pathname === "/contact" },
  ];

  const navClass = (active: boolean) =>
    cn(
      "whitespace-nowrap border-b-2 py-1 text-[13px] font-medium tracking-wide transition-colors lg:text-sm",
      active
        ? "border-primary font-bold text-primary"
        : "border-transparent text-on-surface-variant hover:text-primary",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface">
      <div className="hidden bg-on-secondary-fixed md:block">
        <div className="mx-auto flex h-9 w-full max-w-container-max items-center justify-between px-margin-desktop text-[13px] text-white/80">
          <div className="flex items-center divide-x divide-white/20">
            <a href={siteConfig.tel} className="inline-flex items-center gap-1.5 pe-4 hover:text-primary-fixed">
              <MaterialIcon name="call" className="text-[15px]" />
              {siteConfig.phone}
            </a>
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 hover:text-primary-fixed"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-1.5 ps-4 hover:text-primary-fixed"
            >
              <MaterialIcon name="mail" className="text-[15px]" />
              {siteConfig.email}
            </a>
          </div>
          <LanguageSwitcher compact tone="dark" />
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex h-14 items-center gap-2 px-margin-mobile">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
            <BrandLogo size="sm" />
            <span className="truncate text-base font-bold tracking-tight text-on-surface">
              {brand}
            </span>
          </Link>
          <LanguageSwitcher compact />
          <MobileMenu />
        </div>
        <div className="px-margin-mobile pb-2">
          <ProductSearchForm compact />
        </div>
      </div>

      <div className="relative mx-auto hidden h-[4.5rem] w-full max-w-container-max items-center gap-6 px-margin-desktop md:flex">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <BrandLogo size="md" priority />
          <span className="truncate text-[22px] leading-none font-bold tracking-tight text-on-surface">
            {brand}
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-6 lg:flex xl:gap-8">
          {navItems.slice(0, 1).map((item) => (
            <Link key={item.href} href={item.href} className={navClass(item.match)}>
              {item.label}
            </Link>
          ))}
          <ProductsMenu />
          {navItems.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className={navClass(item.match)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2.5">
          <div className="w-[240px] xl:w-[280px]">
            <ProductSearchForm compact iconSubmit />
          </div>
          <Link
            href="/contact"
            className="relative flex h-10 shrink-0 items-center gap-1.5 rounded bg-primary-container px-4 text-sm font-semibold tracking-wide text-on-primary-container hover:bg-primary hover:text-on-primary"
          >
            <MaterialIcon name="request_quote" className="text-[18px]" />
            {t("rfq")}
            <QuoteCountBadge />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
