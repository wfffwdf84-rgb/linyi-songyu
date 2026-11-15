import { cache } from "react";
import {
  getHomeFeaturedProducts,
  isChineseMachineBrand,
  products,
  searchProducts,
  type Product,
  type ProductSearchHit,
} from "@/lib/data/products";
import {
  applyOverride,
  readOverrides,
  readOverridesReport,
  type CatalogProduct,
  type OverlayReadStatus,
  type ProductPrice,
} from "@/lib/product-store";

/**
 * A catalogue entry merged with its override, plus the two flags the admin
 * panel needs. `price` is internal; only toPublicProduct() may hand this object
 * to anything that renders for a visitor.
 */
export type AdminProduct = CatalogProduct & {
  hidden: boolean;
  overridden: boolean;
};

/**
 * Drops every internal-only field. This is the single place where price leaves
 * the catalogue: the public loaders return products that simply do not have the
 * property, so no page, JSON-LD block or search index can leak it even by
 * accident.
 */
function toPublicProduct(product: AdminProduct): Product {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping the internal fields is the whole point
  const { price: _price, hidden: _hidden, overridden: _overridden, ...visible } = product;
  return visible;
}

/**
 * The full catalogue with overrides applied, price included. Memoised for the
 * render pass, so one page that asks for a product, a category and the featured
 * strip still reads the overlay once.
 */
export const getAdminProducts = cache(async (): Promise<AdminProduct[]> => {
  const overrides = await readOverrides();
  return products.map((product) => {
    const override = overrides[product.slug];
    return {
      ...applyOverride(product, override),
      hidden: override?.hidden === true,
      overridden: Boolean(override),
    };
  });
});

export const getAdminProduct = cache(async (slug: string): Promise<AdminProduct | null> => {
  const all = await getAdminProducts();
  return all.find((product) => product.slug === slug) ?? null;
});

/** The untouched seed entry, used to diff an edit against the original. */
export function getSeedProduct(slug: string): Product | null {
  return products.find((product) => product.slug === slug) ?? null;
}

/**
 * Whether the overlay could be read at all. Public pages do not care (they
 * fall back to the seed); the admin list does, because a failed read is
 * indistinguishable from "nothing has been edited yet".
 */
export const getOverlayStatus = cache(async (): Promise<OverlayReadStatus> => {
  return (await readOverridesReport()).status;
});

/** Everything a visitor may see: hidden products removed, prices stripped. */
export const getPublicProducts = cache(async (): Promise<Product[]> => {
  const all = await getAdminProducts();
  const visible: Product[] = [];
  for (const product of all) {
    if (product.hidden) continue;
    visible.push(toPublicProduct(product));
  }
  return visible;
});

/**
 * Same rules as getProductsByCategory() in the seed module, applied to the
 * overlaid catalogue: the pseudo-category groups every Chinese machine brand,
 * whatever category the part itself sits in.
 */
export function filterByCategory(list: Product[], categorySlug: string): Product[] {
  if (categorySlug === "chinese-brand-parts") {
    return list.filter((product) => product.brands.some(isChineseMachineBrand));
  }
  return list.filter((product) => product.categorySlug === categorySlug);
}

export const getPublicProductsByCategory = cache(async (categorySlug: string): Promise<Product[]> => {
  return filterByCategory(await getPublicProducts(), categorySlug);
});

export const getPublicProduct = cache(
  async (categorySlug: string, slug: string): Promise<Product | null> => {
    const list = await getPublicProducts();
    return (
      list.find((product) => product.categorySlug === categorySlug && product.slug === slug) ?? null
    );
  },
);

/** The home page spotlights; a delisted product drops out of the strip. */
export const getPublicFeaturedProducts = cache(
  async (): Promise<{ brakeDiscs: Product[]; radiators: Product[] }> => {
    const seed = getHomeFeaturedProducts();
    const bySlug = new Map((await getPublicProducts()).map((product) => [product.slug, product]));
    const pick = (list: Product[]) =>
      list
        .map((product) => bySlug.get(product.slug))
        .filter((product): product is Product => Boolean(product));
    return { brakeDiscs: pick(seed.brakeDiscs), radiators: pick(seed.radiators) };
  },
);

function publicSearchBlob(product: Product) {
  // The part number, slug and both copy languages are what a rename or a new
  // description has to stay findable by. Spec values are included because the
  // seed search matches on them too.
  return [
    product.partNumber,
    product.slug,
    product.name.en,
    product.name.zh,
    product.description.en,
    product.description.zh,
    product.oemRef,
    product.oemPart,
    ...(product.oemNumbers ?? []),
    product.brands.join(" "),
    product.compatibleMachines,
    ...product.specs.map((spec) => `${spec.value.en} ${spec.value.zh}`),
    ...product.technicalSpecs.map((spec) => `${spec.value.en} ${spec.value.zh}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Search over the visible catalogue. The seed engine still does the ranking and
 * the Chinese brand aliases; its hits are then resolved against the overlaid
 * list so delisted products disappear and renamed ones show their new name.
 * Overridden copy the seed engine has never seen - a name an operator typed -
 * is matched afterwards so it stays findable.
 */
export const searchPublicProducts = cache(
  async (query: string, locale = "en"): Promise<Product[]> => {
    const all = await getPublicProducts();
    const bySlug = new Map(all.map((product) => [product.slug, product]));
    const seen = new Set<string>();
    const hits: Product[] = [];

    for (const seedHit of searchProducts(query, locale)) {
      const product = bySlug.get(seedHit.slug);
      if (!product || seen.has(seedHit.slug)) continue;
      hits.push(product);
      seen.add(product.slug);
    }

    const needle = query.trim().toLowerCase();
    if (needle) {
      for (const product of all) {
        if (seen.has(product.slug)) continue;
        if (!publicSearchBlob(product).includes(needle)) continue;
        hits.push(product);
        seen.add(product.slug);
      }
    }
    return hits;
  },
);

export const suggestPublicProducts = cache(
  async (query: string, limit = 8, locale = "en"): Promise<ProductSearchHit[]> => {
    return (await searchPublicProducts(query, locale))
      .slice(0, limit)
      .map((product) => ({
        href: `/parts/${product.categorySlug}/${product.slug}`,
        partNumber: product.partNumber,
        name: product.name,
        image: product.image,
      }));
  },
);

/** Re-exported so callers do not have to reach into the store for the type. */
export type { ProductPrice };
