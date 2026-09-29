"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/data/categories";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { loc } from "@/lib/locale";
import { cn } from "@/lib/utils";

type CategorySidebarProps = {
  activeSlug?: string;
  activeBrand?: string;
};

function slugWithBrands(slug?: string) {
  return categories.some((item) => item.slug === slug && item.brands?.length) ? (slug ?? null) : null;
}

export function CategorySidebar({ activeSlug, activeBrand }: CategorySidebarProps) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const [openSlug, setOpenSlug] = useState<string | null>(() => slugWithBrands(activeSlug));

  useEffect(() => {
    setOpenSlug(slugWithBrands(activeSlug));
  }, [activeSlug]);

  function toggleBrands(slug: string) {
    setOpenSlug((current) => (current === slug ? null : slug));
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-outline-variant bg-surface lg:block">
      <div className="sticky top-20 p-6">
        <h2 className="mb-6 text-headline-md text-primary">{t("categories")}</h2>
        <nav className="flex flex-col gap-1">
          {categories.map((cat) => {
            const active = cat.slug === activeSlug;
            const brands = cat.brands ?? [];
            const expanded = openSlug === cat.slug && brands.length > 0;
            return (
              <div key={cat.slug}>
                <div
                  className={cn(
                    "flex items-center rounded transition-colors",
                    active && !activeBrand
                      ? "bg-primary-container font-bold text-on-primary-container"
                      : active
                        ? "font-bold text-primary"
                        : "text-on-surface-variant hover:bg-surface-container",
                  )}
                >
                  <Link
                    href={`/parts/${cat.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-3 p-3"
                    onClick={(event) => {
                      if (!brands.length) return;
                      if (active) {
                        event.preventDefault();
                        toggleBrands(cat.slug);
                      }
                    }}
                  >
                    <MaterialIcon name={cat.icon} />
                    <span className="text-sm font-semibold">
                      {loc(locale, cat.name.en, cat.name.zh)}
                    </span>
                  </Link>
                  {brands.length > 0 ? (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      className="me-2 flex h-9 w-9 shrink-0 items-center justify-center rounded"
                      onClick={() => toggleBrands(cat.slug)}
                    >
                      <MaterialIcon
                        name={expanded ? "expand_less" : "expand_more"}
                        className="text-[18px]"
                      />
                    </button>
                  ) : null}
                </div>
                {expanded ? (
                  <ul className="mb-2 ms-6 flex flex-col border-s border-outline-variant ps-3">
                    {brands.map((brand) => {
                      const selected =
                        activeBrand?.toLowerCase() === brand.id.toLowerCase();
                      return (
                        <li key={brand.id}>
                          <Link
                            href={`/parts/${cat.slug}?brand=${brand.id}`}
                            className={cn(
                              "block rounded px-2 py-1.5 text-sm transition-colors",
                              selected
                                ? "bg-primary-container font-bold text-on-primary-container"
                                : "text-on-surface-variant hover:bg-surface-container hover:text-primary",
                            )}
                          >
                            {loc(locale, brand.en, brand.zh)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
