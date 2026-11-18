import { filterProducts, type Product } from "@/lib/data/products";

/**
 * Category listing query helpers.
 *
 * The listing used to render a whole category and filter it in the browser.
 * With 300+ products in one HTML document that stopped being viable, so the
 * brand facet and the page number live in the URL and are resolved on the
 * server. Everything in this module is a pure function over the products the
 * caller already loaded, so it never touches the catalogue on its own.
 */

/** 3 columns x 8 rows on desktop; the same grid is 2 columns on mobile. */
export const CATALOG_PAGE_SIZE = 24;

export type BrandFacet = {
  /** The brand value exactly as it is stored on the products, so links round-trip. */
  value: string;
  count: number;
};

export type CatalogSelection = {
  brand?: string;
  filters: string[];
};

export type CatalogPage<T> = {
  rows: T[];
  /** Clamped page number: out-of-range input lands on the first or last page. */
  page: number;
  pageCount: number;
  /** Items after filtering, before slicing. */
  total: number;
};

/** Next gives `string | string[]` for a repeated parameter; the first one wins. */
export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** `?page=N` — anything that is not a positive integer means page one. */
export function parsePageParam(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** `?filter=a,b` — category facet ids, order preserved, duplicates dropped. */
export function parseFilterParam(raw: string | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))];
}

/**
 * Brand counts for one category, taken from the products that are actually
 * listed there instead of a hand-maintained list. Most listed brands sort
 * first; ties fall back to the brand name so the chip order is stable across
 * locales and renders.
 */
export function brandFacets(products: Product[]): BrandFacet[] {
  const counts = new Map<string, BrandFacet>();
  for (const product of products) {
    for (const brand of product.brands) {
      const key = brand.toLowerCase();
      const facet = counts.get(key);
      if (facet) facet.count += 1;
      else counts.set(key, { value: brand, count: 1 });
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.value.localeCompare(b.value, "en", { sensitivity: "base" }),
  );
}

/**
 * The casing a brand is stored with, matched case-insensitively. A brand that
 * has no products in this category stays as the visitor typed it: the page then
 * renders its empty state instead of pretending the filter did something.
 */
export function resolveBrandValue(facets: BrandFacet[], raw: string): string | undefined {
  const key = raw.trim().toLowerCase();
  if (!key) return undefined;
  return facets.find((facet) => facet.value.toLowerCase() === key)?.value;
}

/** Brand first, then the category facets, on top of the caller's own ordering. */
export function filterCatalogProducts(
  products: Product[],
  selection: CatalogSelection,
): Product[] {
  let list = products;
  const brandKey = selection.brand?.trim().toLowerCase();
  if (brandKey) {
    list = list.filter((product) =>
      product.brands.some((brand) => brand.toLowerCase() === brandKey),
    );
  }
  if (selection.filters.length > 0) list = filterProducts(list, selection.filters);
  return list;
}

/** Slices one page out of a filtered list, clamping the requested page. */
export function paginate<T>(
  list: T[],
  requestedPage: number,
  pageSize = CATALOG_PAGE_SIZE,
): CatalogPage<T> {
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * pageSize;
  return { rows: list.slice(start, start + pageSize), page, pageCount, total };
}

/**
 * The one place that writes a category listing URL. Page one is left out so a
 * cleared filter and a first page share the same clean address, and ``brand``
 * keeps the value it was given so the link is readable and shareable.
 */
export function buildCategoryHref(slug: string, state: CatalogSelection & { page?: number } = { filters: [] }) {
  const encode = (value: string) => encodeURIComponent(value).replace(/%2C/gi, ",");
  const params: string[] = [];
  if (state.brand) params.push(`brand=${encode(state.brand)}`);
  if (state.filters.length > 0) params.push(`filter=${state.filters.map(encode).join(",")}`);
  if (state.page && state.page > 1) params.push(`page=${state.page}`);
  const query = params.join("&");
  return query ? `/parts/${slug}?${query}` : `/parts/${slug}`;
}
