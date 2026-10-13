"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/data/products";
import { loc } from "@/lib/locale";
import { AddToQuoteButton } from "@/components/quote/AddToQuoteButton";
import { addToQuoteButtonClass } from "@/lib/quote-button";
import { rememberProduct, saveScroll } from "@/lib/scroll-memory";
import { productName, productDescription, tr } from "@/lib/translated";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const tp = useTranslations("product");
  const href = `/parts/${product.categorySlug}/${product.slug}`;
  const name = productName(locale, product.name);

  return (
    <article
      data-product={product.slug}
      className="group flex flex-col rounded border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-lg"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-outline-variant bg-white p-2 md:h-72 md:p-4">
        <Image
          src={product.image}
          alt={name}
          width={400}
          height={300}
          className="mx-auto h-full w-auto max-h-full max-w-full object-contain object-center"
          quality={100}
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <div className="mb-0.5 truncate text-[11px] text-on-surface-variant md:mb-1 md:text-technical-data">
          PN: {product.partNumber}
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-on-surface md:mb-3 md:text-headline-md">
          {name}
        </h3>
        <div className="mt-auto mb-4 hidden space-y-2 md:block">
          {product.specs
            .filter((spec) => spec.labelKey !== "weight" && spec.labelKey !== "location")
            .map((spec) => (
            <div
              key={spec.labelKey}
              className="flex items-center justify-between border-b border-surface-variant py-1 last:border-0"
            >
              <span className="text-sm text-on-surface-variant">
                {tp(spec.labelKey)}:
              </span>
              <span className="text-technical-data font-semibold text-on-surface">
                {tr(locale, spec.value.en, spec.value.zh)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1.5 md:mt-2 md:flex-row md:gap-2">
          <Link
            href={href}
            onClick={() => {
              saveScroll();
              rememberProduct(product.slug);
            }}
            className="flex-1 rounded border border-outline-variant bg-surface-variant py-2 text-center text-[11px] font-bold text-on-surface hover:bg-surface-container-high md:py-3 md:text-label-caps"
          >
            {t("viewSpecs")}
          </Link>
          <AddToQuoteButton
            product={product}
            label={t("quote")}
            className={addToQuoteButtonClass("catalog")}
          />
        </div>
      </div>
    </article>
  );
}
