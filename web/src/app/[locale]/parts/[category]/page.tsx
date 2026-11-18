import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { CatalogFilterBar } from "@/components/catalog/CatalogFilterBar";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductSearchForm } from "@/components/catalog/ProductSearchForm";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Link } from "@/i18n/navigation";
import { categories, getCategory } from "@/lib/data/categories";
import { getPublicProductsByCategory } from "@/lib/catalog";
import {
  CATALOG_PAGE_SIZE,
  brandFacets,
  buildCategoryHref,
  filterCatalogProducts,
  firstParam,
  paginate,
  parseFilterParam,
  parsePageParam,
  resolveBrandValue,
} from "@/lib/catalog-query";
import { brandKey, brandLabel } from "@/lib/brand-names";
import { localePath, pageAlternates } from "@/lib/locales";
import { routing } from "@/i18n/routing";
import { tr } from "@/lib/translated";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{
    brand?: string | string[];
    filter?: string | string[];
    page?: string | string[];
    q?: string | string[];
  }>;
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categories.map((c) => ({ locale, category: c.slug })),
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  const query = await searchParams;
  const brand = firstParam(query.brand).trim();
  const q = firstParam(query.q).trim();
  const requestedPage = parsePageParam(firstParam(query.page));

  const name = tr(locale, category.name.en, category.name.zh);
  const description = tr(locale, category.description.en, category.description.zh);
  const copy = {
    title:
      locale === "zh"
        ? `${name}批发 | OEM 兼容`
        : `${name} Parts Wholesale | OEM Compatible`,
    description:
      locale === "zh"
        ? `${description} 向临沂松昱国际贸易有限公司询盘。`
        : `${description} Send an inquiry to Linyi Songyu International Trade Co., Ltd.`,
  };
  const path = `/parts/${slug}`;

  // A brand or search view is one slice of a single category, so there is
  // nothing of its own to index: point crawlers at the clean category URL
  // instead of generating hundreds of near-identical filtered pages.
  if (brand || q) {
    return {
      ...copy,
      robots: { index: false, follow: true },
      alternates: pageAlternates(locale, path),
    };
  }

  if (requestedPage > 1) {
    // Deeper pages stay indexable but canonicalise to themselves, so a product
    // listing spread over several pages is not folded back into page one.
    const products = await getPublicProductsByCategory(slug);
    const pageCount = Math.max(1, Math.ceil(products.length / CATALOG_PAGE_SIZE));
    const page = Math.min(requestedPage, pageCount);
    if (page > 1) {
      const suffix = `?page=${page}`;
      const base = pageAlternates(locale, path);
      return {
        ...copy,
        alternates: {
          canonical: `${localePath(locale, path)}${suffix}`,
          languages: Object.fromEntries(
            Object.entries(base.languages).map(([code, href]) => [code, `${href}${suffix}`]),
          ),
        },
      };
    }
  }

  return { ...copy, alternates: pageAlternates(locale, path) };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, category: slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const category = getCategory(slug);
  if (!category) notFound();

  const tNav = await getTranslations("nav");
  const tCatalog = await getTranslations("catalog");

  const products = await getPublicProductsByCategory(slug);
  const facets = brandFacets(products);
  const brandParam = firstParam(query.brand).trim();
  // Both a canonical key and an old raw value (?brand=SDLG, ?brand=LiuGong)
  // resolve here; the page then works with the canonical key only.
  const activeBrand =
    resolveBrandValue(facets, brandParam) ?? (brandParam ? brandKey(brandParam) : undefined);
  const activeFilters = parseFilterParam(firstParam(query.filter));
  const filtered = filterCatalogProducts(products, {
    brand: activeBrand,
    filters: activeFilters,
  });
  // Ordering stays whatever getPublicProductsByCategory returned; paging only
  // slices it, so page N+1 never reorders what page N showed.
  const { rows, page, pageCount, total } = paginate(
    filtered,
    parsePageParam(firstParam(query.page)),
  );

  const categoryName = tr(locale, category.name.en, category.name.zh);
  const brandName = activeBrand ? brandLabel(activeBrand, locale) : undefined;
  const title = brandName ?? categoryName;
  const hasSelection = Boolean(activeBrand) || activeFilters.length > 0;

  return (
    <SiteShell>
      <div className="mx-auto flex min-h-screen w-full max-w-container-max">
        <CategorySidebar activeSlug={slug} activeBrand={activeBrand} />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 md:px-margin-desktop md:py-8 md:pb-8">
          <div className="mb-6 rounded border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:mb-8 md:p-6">
            <Breadcrumbs
              items={[
                { href: "/", label: tNav("home") },
                { href: "/parts/transmission-systems", label: tNav("products") },
                brandName
                  ? { href: buildCategoryHref(slug, { filters: activeFilters }), label: categoryName }
                  : { label: categoryName },
                ...(brandName ? [{ label: brandName }] : []),
              ]}
            />
            <h1 className="mb-4 text-headline-lg-mobile text-on-surface md:mb-6 md:text-headline-xl">{title}</h1>
            {brandName ? null : (
              <p className="mb-4 max-w-2xl text-body-sm text-on-surface-variant md:mb-6 md:text-body-lg">
                {tr(locale, category.description.en, category.description.zh)}
              </p>
            )}
            <CatalogFilterBar
              locale={locale}
              slug={slug}
              filters={category.filters}
              facets={facets}
              activeBrand={activeBrand}
              activeFilters={activeFilters}
              total={products.length}
              shown={total}
              page={page}
              pageCount={pageCount}
              toolbar={<ProductSearchForm />}
            />
          </div>

          {rows.length === 0 ? (
            <div className="rounded border border-outline-variant bg-surface p-8">
              <p className="text-body-md text-on-surface-variant">
                {tCatalog("filterEmpty")}
              </p>
              {hasSelection ? (
                <Link
                  href="/contact?type=oemMatch"
                  className="mt-4 inline-flex items-center gap-1 text-technical-data text-primary hover:underline"
                >
                  {tCatalog("filterEmptyRfqCta")}
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {rows.map((product) => (
                <ProductCard key={`${product.categorySlug}-${product.slug}`} product={product} />
              ))}
            </div>
          )}

          <CatalogPagination
            locale={locale}
            slug={slug}
            brand={activeBrand}
            filters={activeFilters}
            page={page}
            pageCount={pageCount}
            total={total}
          />
        </main>
      </div>
    </SiteShell>
  );
}
