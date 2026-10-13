import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { CatalogFilterBar } from "@/components/catalog/CatalogFilterBar";
import { ProductSearchForm } from "@/components/catalog/ProductSearchForm";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Link } from "@/i18n/navigation";
import { categories, findCategoryBrand, getCategory } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { loc } from "@/lib/locale";
import { routing } from "@/i18n/routing";
import { pageAlternates } from "@/lib/locales";
import { tr } from "@/lib/translated";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ brand?: string | string[] }>;
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categories.map((c) => ({ locale, category: c.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  const name = tr(locale, category.name.en, category.name.zh);
  const description = tr(locale, category.description.en, category.description.zh);

  return {
    title:
      locale === "zh"
        ? `${name}批发 | OEM 兼容`
        : `${name} Parts Wholesale | OEM Compatible`,
    description:
      locale === "zh"
        ? `${description} 向临沂松昱国际贸易有限公司询盘。`
        : `${description} Send an inquiry to Linyi Songyu International Trade Co., Ltd.`,
    alternates: pageAlternates(locale, `/parts/${slug}`),
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, category: slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const category = getCategory(slug);
  if (!category) notFound();

  const brandKey = Array.isArray(query.brand) ? query.brand[0] : query.brand;
  const brand = findCategoryBrand(category, brandKey);
  const products = getProductsByCategory(slug);
  const tNav = await getTranslations("nav");
  const categoryName = tr(locale, category.name.en, category.name.zh);
  const brandName = brand ? loc(locale, brand.en, brand.zh) : undefined;
  const title = brandName ?? categoryName;

  return (
    <SiteShell>
      <div className="mx-auto flex min-h-screen w-full max-w-container-max">
        <CategorySidebar activeSlug={slug} activeBrand={brand?.id} />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 md:px-margin-desktop md:py-8 md:pb-8">
          <CatalogFilterBar
            key={`${slug}-${brand?.id ?? "all"}`}
            products={products}
            filters={category.filters}
            initialSelected={brand ? [`brand:${brand.id}`] : []}
            hideBrandChips={Boolean(category.brands)}
            toolbar={<ProductSearchForm />}
          >
            <div>
            <Breadcrumbs
              items={[
                { href: "/", label: tNav("home") },
                { href: "/parts/transmission-systems", label: tNav("products") },
                brandName
                  ? { href: `/parts/${slug}`, label: categoryName }
                  : { label: categoryName },
                ...(brandName ? [{ label: brandName }] : []),
              ]}
            />
            <h1 className="mb-4 text-headline-lg-mobile text-on-surface md:mb-6 md:text-headline-xl">{title}</h1>
            {category.brands?.length ? (
              <nav className="mb-6 flex flex-wrap gap-2 lg:hidden">
                {category.brands.map((item) => {
                  const selected = item.id.toLowerCase() === brand?.id.toLowerCase();
                  return (
                    <Link
                      key={item.id}
                      href={`/parts/${slug}?brand=${item.id}`}
                      className={
                        selected
                          ? "rounded bg-primary-container px-3 py-1.5 text-sm font-bold text-on-primary-container"
                          : "rounded border border-outline-variant px-3 py-1.5 text-sm text-on-surface-variant"
                      }
                    >
                      {loc(locale, item.en, item.zh)}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
            {brandName ? null : (
              <p className="mb-4 max-w-2xl text-body-sm text-on-surface-variant md:mb-6 md:text-body-lg">
                {tr(locale, category.description.en, category.description.zh)}
              </p>
            )}
            </div>
          </CatalogFilterBar>
        </main>
      </div>
    </SiteShell>
  );
}
