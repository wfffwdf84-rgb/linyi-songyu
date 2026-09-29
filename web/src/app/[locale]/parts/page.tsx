import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductSearchForm } from "@/components/catalog/ProductSearchForm";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { searchProducts } from "@/lib/data/products";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const query = await searchParams;
  const q = Array.isArray(query.q) ? query.q[0] : query.q;
  const t = await getTranslations({ locale, namespace: "catalog" });
  if (!q?.trim()) return {};
  return {
    title: t("searchTitle", { q: q.trim() }),
    robots: { index: false, follow: true },
  };
}

export default async function PartsIndexPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const q = (Array.isArray(query.q) ? query.q[0] : query.q)?.trim() ?? "";

  if (!q) {
    redirect({ href: "/parts/transmission-systems", locale });
  }

  const t = await getTranslations("catalog");
  const tNav = await getTranslations("nav");
  const results = searchProducts(q);

  return (
    <SiteShell>
      <div className="mx-auto flex min-h-screen w-full max-w-container-max">
        <CategorySidebar activeSlug="" />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 md:px-margin-desktop md:py-8 md:pb-8">
          <div className="mb-6 rounded border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:mb-8 md:p-6">
            <Breadcrumbs
              items={[
                { href: "/", label: tNav("home") },
                { href: "/parts/transmission-systems", label: tNav("products") },
                { label: t("searchResults") },
              ]}
            />
            <h1 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-xl">{t("searchResults")}</h1>
            <p className="mb-6 text-body-lg text-on-surface-variant">
              {t("searchCount", { q, count: results.length })}
            </p>
            <ProductSearchForm defaultValue={q} />
          </div>
          {results.length === 0 ? (
            <p className="rounded border border-outline-variant bg-surface p-8 text-body-md text-on-surface-variant">
              {t("searchEmpty")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {results.map((product) => (
                <ProductCard key={`${product.categorySlug}-${product.slug}`} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </SiteShell>
  );
}
