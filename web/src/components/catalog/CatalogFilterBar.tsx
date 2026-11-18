import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { brandLabel } from "@/lib/brand-names";
import { buildCategoryHref, type BrandFacet } from "@/lib/catalog-query";
import type { CategoryFilter } from "@/lib/data/categories";
import { loc } from "@/lib/locale";
import { cn } from "@/lib/utils";

type CatalogFilterBarProps = {
  locale: string;
  slug: string;
  filters: CategoryFilter[];
  /** Brand counts for this category, busiest first. */
  facets: BrandFacet[];
  activeBrand?: string;
  activeFilters: string[];
  /** Products in the category, before filtering. */
  total: number;
  /** Products after the brand and facet filters. */
  shown: number;
  page: number;
  pageCount: number;
  toolbar?: ReactNode;
};

const chipIdle =
  "rounded border border-outline-variant bg-surface-container-high text-on-surface hover:border-primary";
const chipActive = "rounded border border-primary bg-primary text-on-primary";

/**
 * Server-rendered filter bar: every chip is a real link, so a filtered view is
 * crawlable, shareable and correct after a page reload. It used to be a client
 * component that filtered the products it had already received, which cannot
 * work once the list is paginated on the server.
 */
export async function CatalogFilterBar({
  locale,
  slug,
  filters,
  facets,
  activeBrand,
  activeFilters,
  total,
  shown,
  page,
  pageCount,
  toolbar,
}: CatalogFilterBarProps) {
  const t = await getTranslations({ locale, namespace: "catalog" });

  // Brand chips are generated from the products now; the eight brand ids that
  // were hard-coded in the category data would only duplicate them.
  const facetFilters = filters.filter((filter) => !filter.id.startsWith("brand:"));
  const hasSelection = Boolean(activeBrand) || activeFilters.length > 0;
  const status =
    hasSelection
      ? [t("productTotal", { count: total }), t("productFiltered", { count: shown })]
      : [t("productTotal", { count: total })];

  return (
    <>
      {toolbar ? <div className="flex flex-col gap-4 md:flex-row">{toolbar}</div> : null}

      <div className="mt-5">
        <p className="mb-2 text-label-caps text-on-surface-variant">{t("brandFilter")}</p>
        <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto pe-1">
          <Link
            href={buildCategoryHref(slug, { filters: activeFilters })}
            aria-current={activeBrand ? undefined : "page"}
            className={cn(
              "whitespace-nowrap px-3 py-1 text-xs font-bold",
              activeBrand ? chipIdle : chipActive,
            )}
          >
            {t("brandAll")}
            <span className="ms-1.5 opacity-70">{total}</span>
          </Link>
          {facets.map((facet) => {
            const selected = activeBrand?.toLowerCase() === facet.value.toLowerCase();
            return (
              <Link
                key={facet.value}
                href={buildCategoryHref(slug, { brand: facet.value, filters: activeFilters })}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap px-3 py-1 text-xs font-bold",
                  selected ? chipActive : chipIdle,
                )}
              >
                {brandLabel(facet.value, locale)}
                <span className="ms-1.5 opacity-70">{facet.count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {facetFilters.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-label-caps text-on-surface-variant">{t("filters")}</p>
          <div className="flex flex-wrap gap-2">
            {facetFilters.map((filter) => {
              const selected = activeFilters.includes(filter.id);
              const next = selected
                ? activeFilters.filter((id) => id !== filter.id)
                : [...activeFilters, filter.id];
              return (
                <Link
                  key={filter.id}
                  href={buildCategoryHref(slug, { brand: activeBrand, filters: next })}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap px-3 py-1 text-xs font-bold",
                    selected ? chipActive : chipIdle,
                  )}
                >
                  {loc(locale, filter.en, filter.zh)}
                </Link>
              );
            })}
            {hasSelection ? (
              <Link
                href={buildCategoryHref(slug, { filters: [] })}
                className="flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-xs font-bold text-on-surface-variant hover:text-primary"
              >
                <MaterialIcon name="close" className="text-[14px]" />
                {t("filterClear")}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-on-surface-variant">
        {status.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
        {pageCount > 1 ? <span>{t("pageStatus", { page, total: pageCount })}</span> : null}
      </p>
    </>
  );
}
