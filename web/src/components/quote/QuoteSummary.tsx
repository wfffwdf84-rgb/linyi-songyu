"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { loc } from "@/lib/locale";
import { QUOTE_QTY_MAX } from "@/lib/commerce";
import { useQuoteList } from "@/components/quote/QuoteListProvider";

export function QuoteCountBadge() {
  const { count } = useQuoteList();
  if (count <= 0) return null;
  return (
    <span className="ms-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-on-primary-container px-1.5 text-[11px] font-bold text-primary-container">
      {count > 999 ? "999+" : count}
    </span>
  );
}

export function QuoteSummary() {
  const t = useTranslations("quote");
  const locale = useLocale();
  const { items, count, setQty, remove } = useQuoteList();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center justify-between bg-secondary px-4 py-3 text-on-secondary">
        <h3 className="flex items-center gap-2 text-technical-data font-bold tracking-wide uppercase">
          <MaterialIcon name="list_alt" className="text-[20px]" />
          {t("summary")}
        </h3>
        <span className="rounded bg-on-secondary-fixed px-2 py-1 text-label-caps text-primary-fixed">
          {t("items", { count })}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
          <MaterialIcon name="inventory_2" className="text-4xl text-on-surface-variant" />
          <p className="text-technical-data font-bold text-on-surface">{t("emptyTitle")}</p>
          <p className="text-body-sm text-on-surface-variant">{t("emptyHint")}</p>
          <Link
            href="/parts/transmission-systems"
            className="mt-1 inline-flex items-center gap-1 rounded bg-primary-container px-4 py-2 text-label-caps text-on-primary-container hover:bg-primary hover:text-on-primary"
          >
            {t("browseCatalog")}
            <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant">
          {items.map((item) => {
            const name = loc(locale, item.nameEn, item.nameZh);
            return (
              <li key={item.slug} className="flex gap-3 p-4">
                <Link
                  href={`/parts/${item.categorySlug}/${item.slug}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-outline-variant bg-white"
                >
                  <Image src={item.image} alt={name} fill quality={100} unoptimized className="object-contain p-1" sizes="64px" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-label-caps text-on-surface-variant">PN: {item.partNumber}</p>
                      <Link
                        href={`/parts/${item.categorySlug}/${item.slug}`}
                        className="mt-0.5 block text-technical-data font-bold text-on-surface hover:text-primary"
                      >
                        {name}
                      </Link>
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        {item.inStock ? t("lineStock") : t("lineInquiry")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.slug)}
                      className="shrink-0 rounded p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-error"
                      aria-label={t("removeItem")}
                    >
                      <MaterialIcon name="close" className="text-[18px]" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-label-caps text-on-surface-variant">{t("qtyLabel")}</span>
                    <div className="flex items-center rounded border border-outline-variant bg-surface">
                      <button
                        type="button"
                        onClick={() => setQty(item.slug, item.qty - 1)}
                        disabled={item.qty <= item.moq}
                        className="px-2 py-1 text-on-surface hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t("qtyMinus")}
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-technical-data font-bold text-primary">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.slug, item.qty + 1)}
                        disabled={item.qty >= QUOTE_QTY_MAX}
                        className="px-2 py-1 text-on-surface hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t("qtyPlus")}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
