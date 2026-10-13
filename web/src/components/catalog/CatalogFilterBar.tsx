"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { CategoryFilter } from "@/lib/data/categories";
import { filterProducts, type Product } from "@/lib/data/products";
import { loc } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { brandLabel } from "@/lib/brand-names";

type CatalogFilterBarProps = {
  products: Product[];
  filters: CategoryFilter[];
  initialSelected?: string[];
  hideBrandChips?: boolean;
  toolbar?: ReactNode;
  children?: ReactNode;
};

export function CatalogFilterBar({
  products,
  filters,
  initialSelected = [],
  hideBrandChips = false,
  toolbar,
  children,
}: CatalogFilterBarProps) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const brandFilters = useMemo(() => {
    if (hideBrandChips) return [];
    const names = [...new Set(products.flatMap((product) => product.brands))];
    return names.map((brand) => ({
      id: `brand:${brand}`,
      en: brand,
      zh: brandLabel(brand, "zh"),
    }));
  }, [products, hideBrandChips]);

  const visibleFilters = open
    ? [...filters, ...brandFilters.filter((item) => !filters.some((filter) => filter.id === item.id))]
    : filters;
  const visible = filterProducts(products, selected);

  function toggle(id: string) {
    if (hideBrandChips && id.startsWith("brand:")) return;
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function clearFilters() {
    setSelected(hideBrandChips ? initialSelected.filter((id) => id.startsWith("brand:")) : []);
  }

  return (
    <>
      <div className="mb-6 rounded border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:mb-8 md:p-6">
        {children}
        <div className="flex flex-col gap-4 md:flex-row">
          {toolbar}
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded border px-4 py-3 text-label-caps font-bold md:px-6 md:py-4",
              selected.length > 0 || open
                ? "border-primary bg-primary-fixed/20 text-on-surface"
                : "border-outline-variant bg-surface-variant text-on-surface hover:bg-surface-container-high",
            )}
          >
            <MaterialIcon name="tune" />
            {t("filters")}
            {selected.length > 0 ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-on-primary">
                {selected.length}
              </span>
            ) : null}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {visibleFilters.map((filter) => {
            const active = selected.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(filter.id)}
                className={cn(
                  "rounded border px-3 py-1 text-xs font-bold whitespace-nowrap",
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface-container-high text-on-surface hover:border-primary",
                )}
              >
                {loc(locale, filter.en, filter.zh)}
              </button>
            );
          })}
          {selected.filter((id) => !(hideBrandChips && id.startsWith("brand:"))).length > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded border border-outline-variant px-3 py-1 text-xs font-bold text-on-surface-variant hover:text-primary"
            >
              {t("filterClear")}
            </button>
          ) : null}
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="rounded border border-outline-variant bg-surface p-8">
          <p className="text-body-md text-on-surface-variant">
            {selected.some((id) => id === "brand:SANY" || id === "brand:Shantui")
              ? t("filterEmptyRfq")
              : t("filterEmpty")}
          </p>
          {selected.some((id) => id === "brand:SANY" || id === "brand:Shantui") ? (
            <Link
              href="/contact?type=oemMatch"
              className="mt-4 inline-flex items-center gap-1 text-technical-data text-primary hover:underline"
            >
              {t("filterEmptyRfqCta")}
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
