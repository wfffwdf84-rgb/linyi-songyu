import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SiteShell } from "@/components/layout/SiteShell";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { categories, getCategory } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { loc } from "@/lib/locale";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
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

  const name = loc(locale, category.name.en, category.name.zh);
  const description = loc(locale, category.description.en, category.description.zh);

  return {
    title:
      locale === "zh"
        ? `${name}批发 | OEM 兼容`
        : `${name} Parts Wholesale | OEM Compatible`,
    description:
      locale === "zh"
        ? `${description} 向临沂松宇国际贸易有限公司询价。`
        : `${description} Request a quote from Linyi Songyu International Trade Co., Ltd.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, category: slug } = await params;
  setRequestLocale(locale);
  const category = getCategory(slug);
  if (!category) notFound();

  const t = await getTranslations("catalog");
  const products = getProductsByCategory(slug);

  return (
    <SiteShell>
      <CategorySidebar activeSlug={slug} />
      <main className="mx-auto min-h-screen w-full max-w-container-max flex-1 px-4 py-8 pb-20 md:px-margin-desktop lg:ml-80 lg:pl-12 lg:pb-0">
        <div className="mb-8 rounded border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h1 className="mb-4 text-headline-xl text-on-surface">
            {loc(locale, category.name.en, category.name.zh)}
          </h1>
          <p className="mb-6 max-w-2xl text-body-lg text-on-surface-variant">
            {loc(locale, category.description.en, category.description.zh)}
          </p>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <MaterialIcon
                name="search"
                className="absolute top-1/2 left-4 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                type="search"
                placeholder={t("searchPlaceholder")}
                className="w-full rounded border-2 border-outline-variant bg-surface-bright py-4 pr-4 pl-12 text-technical-data text-on-surface focus:border-primary focus:ring-0"
              />
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded border border-outline-variant bg-surface-variant px-6 py-4 text-label-caps font-bold text-on-surface hover:bg-surface-container-high"
            >
              <MaterialIcon name="tune" />
              {t("filters")}
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {category.filters.map((filter) => (
              <span
                key={filter.en}
                className="rounded border border-outline-variant bg-surface-container-high px-3 py-1 text-xs font-bold whitespace-nowrap text-on-surface"
              >
                {loc(locale, filter.en, filter.zh)}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
