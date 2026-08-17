"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems = [
    { href: "/", label: t("home"), match: (p: string) => p === "/" },
    {
      href: "/parts/transmission-systems",
      label: t("catalog"),
      match: (p: string) => p.startsWith("/parts"),
    },
    {
      href: "/request-quote",
      label: t("quotes"),
      match: (p: string) => p === "/request-quote",
    },
    {
      href: "/quality-logistics",
      label: t("inquiry"),
      match: (p: string) => p === "/quality-logistics",
    },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile md:h-20 md:px-margin-desktop">
      <Link href="/" className="flex items-center gap-2">
        <MaterialIcon name="construction" filled className="text-3xl text-primary" />
        <span className="text-headline-lg-mobile font-bold tracking-tight text-on-surface md:text-headline-lg">
          {siteConfig.shortName}
        </span>
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-medium transition-colors",
                active
                  ? "border-b-2 border-primary font-bold text-primary"
                  : "text-on-surface-variant hover:text-primary-container",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <LanguageSwitcher />
    </header>
  );
}
