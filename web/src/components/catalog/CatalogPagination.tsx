import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { buildCategoryHref } from "@/lib/catalog-query";
import { cn } from "@/lib/utils";

type CatalogPaginationProps = {
  locale: string;
  slug: string;
  brand?: string;
  filters: string[];
  page: number;
  pageCount: number;
  /** Products in the whole filtered list, not just this page. */
  total: number;
};

const pageIdle =
  "flex min-w-9 items-center justify-center rounded border border-outline-variant px-2 py-1.5 text-body-sm text-on-surface-variant hover:border-primary";
const pageActive =
  "flex min-w-9 items-center justify-center rounded bg-primary px-2 py-1.5 text-body-sm font-semibold text-on-primary";

/** Current page ±2 plus the first and last page, in order. */
function pageNumbers(current: number, pageCount: number) {
  const numbers = new Set<number>([1, pageCount]);
  for (let page = current - 2; page <= current + 2; page += 1) {
    if (page >= 1 && page <= pageCount) numbers.add(page);
  }
  return [...numbers].sort((a, b) => a - b);
}

/**
 * Plain links rather than a client widget: page two is crawlable, shareable and
 * survives the back button. The bar wraps on narrow screens, so it cannot
 * overflow the viewport on a phone.
 */
export async function CatalogPagination({
  locale,
  slug,
  brand,
  filters,
  page,
  pageCount,
  total,
}: CatalogPaginationProps) {
  const t = await getTranslations({ locale, namespace: "catalog" });
  const href = (target: number) => buildCategoryHref(slug, { brand, filters, page: target });

  return (
    <nav
      aria-label={t("pagination")}
      className="mt-8 flex flex-col gap-3 border-t border-outline-variant pt-4 md:flex-row md:items-center md:justify-between"
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-on-surface-variant">
        <span>{t("productTotal", { count: total })}</span>
        <span>{t("pageStatus", { page, total: pageCount })}</span>
      </p>
      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          {page > 1 ? (
            <Link href={href(page - 1)} className={cn(pageIdle, "gap-1 whitespace-nowrap px-2.5")}>
              <MaterialIcon name="chevron_left" className="text-[16px]" />
              {t("pagePrev")}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex items-center gap-1 whitespace-nowrap rounded border border-outline-variant px-2.5 py-1.5 text-body-sm text-on-surface-variant/50"
            >
              <MaterialIcon name="chevron_left" className="text-[16px]" />
              {t("pagePrev")}
            </span>
          )}
          <ol className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {pageNumbers(page, pageCount).map((number) => (
              <li key={number}>
                <Link
                  href={href(number)}
                  aria-current={number === page ? "page" : undefined}
                  className={number === page ? pageActive : pageIdle}
                >
                  {number}
                </Link>
              </li>
            ))}
          </ol>
          {page < pageCount ? (
            <Link href={href(page + 1)} className={cn(pageIdle, "gap-1 whitespace-nowrap px-2.5")}>
              {t("pageNext")}
              <MaterialIcon name="chevron_right" className="text-[16px]" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex items-center gap-1 whitespace-nowrap rounded border border-outline-variant px-2.5 py-1.5 text-body-sm text-on-surface-variant/50"
            >
              {t("pageNext")}
              <MaterialIcon name="chevron_right" className="text-[16px]" />
            </span>
          )}
        </div>
      ) : null}
    </nav>
  );
}
