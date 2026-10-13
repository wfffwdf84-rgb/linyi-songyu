"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { categories } from "@/lib/data/categories";
import { loc } from "@/lib/locale";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";
import { tr } from "@/lib/translated";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [openBrands, setOpenBrands] = useState<string | null>(() => {
    const match = categories.find(
      (category) => category.brands?.length && pathname.startsWith(`/parts/${category.slug}`),
    );
    return match?.slug ?? null;
  });

  const links = [
    { href: "/", label: t("home"), match: pathname === "/" },
    { href: "/about", label: t("about"), match: pathname === "/about" },
    { href: "/quality-logistics", label: t("quality"), match: pathname === "/quality-logistics" },
    { href: "/contact", label: t("contact"), match: pathname === "/contact" },
    { href: "/contact", label: t("rfq"), match: false },
    { href: "/upload-video", label: t("uploadVideo"), match: pathname === "/upload-video" },
  ];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant text-on-surface"
        aria-expanded={open}
        aria-label={t("menu")}
        onClick={() => setOpen((value) => !value)}
      >
        <MaterialIcon name={open ? "close" : "menu"} />
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-50 max-h-[min(70vh,calc(100dvh-8rem))] overflow-y-auto border-b border-outline-variant bg-surface shadow-lg">
          <nav className="flex flex-col px-margin-mobile py-3">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-3 text-sm font-medium",
                  link.match ? "font-bold text-primary" : "text-on-surface",
                )}
              >
                {link.label}
              </Link>
            ))}
            <p className="mt-2 border-t border-outline-variant pt-3 text-label-caps text-on-surface-variant">
              {t("products")}
            </p>
            {categories.map((category) => {
              const expanded = openBrands === category.slug;
              return (
                <div key={category.slug}>
                  <div className="flex items-center">
                    <Link
                      href={`/parts/${category.slug}`}
                      onClick={(event) => {
                        if (!category.brands?.length) {
                          setOpen(false);
                          return;
                        }
                        if (pathname.startsWith(`/parts/${category.slug}`)) {
                          event.preventDefault();
                          setOpenBrands(expanded ? null : category.slug);
                          return;
                        }
                        setOpen(false);
                      }}
                      className={cn(
                        "block flex-1 py-2 text-sm",
                        pathname.startsWith(`/parts/${category.slug}`)
                          ? "font-bold text-primary"
                          : "text-on-surface-variant",
                      )}
                    >
                      {tr(locale, category.name.en, category.name.zh)}
                    </Link>
                    {category.brands?.length ? (
                      <button
                        type="button"
                        aria-expanded={expanded}
                        className="flex h-10 w-10 items-center justify-center text-on-surface-variant"
                        onClick={() =>
                          setOpenBrands(expanded ? null : category.slug)
                        }
                      >
                        <MaterialIcon name={expanded ? "expand_less" : "expand_more"} />
                      </button>
                    ) : null}
                  </div>
                  {expanded
                    ? category.brands?.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/parts/${category.slug}?brand=${brand.id}`}
                          onClick={() => setOpen(false)}
                          className="block py-1 ps-4 text-sm text-on-surface-variant"
                        >
                          {loc(locale, brand.en, brand.zh)}
                        </Link>
                      ))
                    : null}
                </div>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
