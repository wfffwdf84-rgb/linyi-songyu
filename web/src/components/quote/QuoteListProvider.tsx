"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/data/products";
import { productMoq } from "@/lib/commerce";
import {
  lineFromProduct,
  quoteLineCount,
  readQuoteLines,
  setQuoteQty,
  upsertQuoteLine,
  writeQuoteLines,
  type QuoteLine,
} from "@/lib/quote-list";

type QuoteListContextValue = {
  items: QuoteLine[];
  count: number;
  addProduct: (product: Product, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
};

const QuoteListContext = createContext<QuoteListContextValue | null>(null);

export function QuoteListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readQuoteLines());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeQuoteLines(items);
  }, [items, ready]);

  const value = useMemo<QuoteListContextValue>(
    () => ({
      items,
      count: quoteLineCount(items),
      addProduct(product, qty = productMoq(product)) {
        setItems((current) => upsertQuoteLine(current, lineFromProduct(product, qty)));
      },
      setQty(slug, qty) {
        setItems((current) => setQuoteQty(current, slug, qty));
      },
      remove(slug) {
        setItems((current) => current.filter((item) => item.slug !== slug));
      },
    }),
    [items],
  );

  return <QuoteListContext.Provider value={value}>{children}</QuoteListContext.Provider>;
}

export function useQuoteList() {
  const context = useContext(QuoteListContext);
  if (!context) {
    throw new Error("useQuoteList must be used within QuoteListProvider");
  }
  return context;
}
