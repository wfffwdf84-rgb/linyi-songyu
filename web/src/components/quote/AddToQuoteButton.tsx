"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { Product } from "@/lib/data/products";
import { inquiryTypeFromProduct } from "@/lib/inquiry";
import { useQuoteList } from "@/components/quote/QuoteListProvider";

type AddToQuoteButtonProps = {
  product: Product;
  className?: string;
  icon?: string;
  label?: string;
  stay?: boolean;
};

export function AddToQuoteButton({
  product,
  className,
  icon = "add_shopping_cart",
  label,
  stay = false,
}: AddToQuoteButtonProps) {
  const t = useTranslations("quote");
  const tp = useTranslations("product");
  const router = useRouter();
  const { addProduct } = useQuoteList();
  const [added, setAdded] = useState(false);
  const text = label ?? tp("addRfq");

  function onAdd() {
    addProduct(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    if (!stay) {
      const type = inquiryTypeFromProduct(product.categorySlug, product.slug);
      router.push(`/contact?type=${type}`);
    }
  }

  return (
    <button type="button" onClick={onAdd} className={className}>
      <MaterialIcon name={added ? "check" : icon} className="text-[18px]" />
      {added ? t("added") : text}
    </button>
  );
}
