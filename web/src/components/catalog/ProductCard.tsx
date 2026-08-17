"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/data/products";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { loc } from "@/lib/locale";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const tp = useTranslations("product");
  const href = `/parts/${product.categorySlug}/${product.slug}`;
  const name = loc(locale, product.name.en, product.name.zh);

  return (
    <article className="group flex flex-col rounded border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-lg">
      <div className="relative flex h-48 items-center justify-center border-b border-outline-variant bg-white p-4">
        {product.dispatch24h && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-primary px-2 py-1 text-[10px] font-bold tracking-wider text-on-primary uppercase">
            <MaterialIcon name="local_shipping" className="text-[12px]" />
            {t("dispatch24h")}
          </div>
        )}
        <Image
          src={product.image}
          alt={name}
          width={400}
          height={300}
          className="max-h-full object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-technical-data text-on-surface-variant">
          PN: {product.partNumber}
        </div>
        <h3 className="mb-3 line-clamp-2 text-headline-md text-on-surface">{name}</h3>
        <div className="mt-auto mb-4 space-y-2">
          {product.specs.map((spec) => (
            <div
              key={spec.labelKey}
              className="flex items-center justify-between border-b border-surface-variant py-1 last:border-0"
            >
              <span className="text-sm text-on-surface-variant">
                {tp(spec.labelKey)}:
              </span>
              <span className="text-technical-data font-semibold text-on-surface">
                {loc(locale, spec.value.en, spec.value.zh)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Link
            href={href}
            className="flex-1 rounded border border-outline-variant bg-surface-variant py-3 text-center text-label-caps font-bold text-on-surface hover:bg-surface-container-high"
          >
            {t("viewSpecs")}
          </Link>
          <Link
            href="/request-quote"
            className="flex flex-1 items-center justify-center gap-2 rounded bg-primary py-3 text-label-caps font-bold text-on-primary hover:bg-surface-tint"
          >
            <MaterialIcon name="add_shopping_cart" className="text-[18px]" />
            {t("quote")}
          </Link>
        </div>
      </div>
    </article>
  );
}
