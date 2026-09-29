import { getProduct, type Product } from "@/lib/data/products";
import { inquiryTypeFromProduct, normalizeInquiryType, type InquiryTypeId } from "@/lib/inquiry";
import { productMoq, QUOTE_QTY_MAX } from "@/lib/commerce";

export const QUOTE_STORAGE_KEY = "linyi-songyu-rfq-v1";

export type QuoteLine = {
  slug: string;
  categorySlug: string;
  partNumber: string;
  nameEn: string;
  nameZh: string;
  image: string;
  inquiryType: InquiryTypeId;
  inStock: boolean;
  qty: number;
  moq: number;
};

function lineMoq(item: { slug?: string; categorySlug?: string }): number {
  if (item.categorySlug && item.slug) {
    const product = getProduct(item.categorySlug, item.slug);
    if (product) return productMoq(product);
  }
  return productMoq({ categorySlug: item.categorySlug });
}

export function lineFromProduct(product: Product, qty?: number): QuoteLine {
  const moq = productMoq(product);
  const nextQty = Math.min(QUOTE_QTY_MAX, Math.max(moq, Math.round(qty ?? moq)));
  return {
    slug: product.slug,
    categorySlug: product.categorySlug,
    partNumber: product.partNumber,
    nameEn: product.name.en,
    nameZh: product.name.zh,
    image: product.image,
    inquiryType: inquiryTypeFromProduct(product.categorySlug, product.slug),
    inStock: product.inStock,
    qty: nextQty,
    moq,
  };
}

export function readQuoteLines(): QuoteLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUOTE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuoteLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item?.slug && item?.partNumber && item.qty > 0)
      .map((item) => {
        const moq = lineMoq(item);
        return {
          ...item,
          inquiryType: normalizeInquiryType(item.inquiryType),
          moq,
          qty: Math.max(moq, Math.round(item.qty)),
        };
      });
  } catch {
    return [];
  }
}

export function writeQuoteLines(lines: QuoteLine[]) {
  window.localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(lines));
}

export function upsertQuoteLine(lines: QuoteLine[], next: QuoteLine): QuoteLine[] {
  const index = lines.findIndex((item) => item.slug === next.slug);
  if (index === -1) return [...lines, next];
  return lines.map((item, i) =>
    i === index ? { ...item, qty: Math.min(QUOTE_QTY_MAX, item.qty + next.qty) } : item,
  );
}

export function setQuoteQty(lines: QuoteLine[], slug: string, qty: number): QuoteLine[] {
  const next = Math.min(QUOTE_QTY_MAX, Math.max(0, Math.round(qty)));
  if (next <= 0) return lines.filter((item) => item.slug !== slug);
  return lines.map((item) =>
    item.slug === slug ? { ...item, qty: Math.max(lineMoq(item), next) } : item,
  );
}

export function quoteLineCount(lines: QuoteLine[]) {
  return lines.reduce((sum, item) => sum + item.qty, 0);
}
