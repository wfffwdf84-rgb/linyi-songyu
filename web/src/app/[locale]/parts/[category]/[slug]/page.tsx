import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { getCategory } from "@/lib/data/categories";
import { getAllProductPaths, getProduct } from "@/lib/data/products";
import { loc } from "@/lib/locale";
import { siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { AddToQuoteButton } from "@/components/quote/AddToQuoteButton";
import { ProductBackButton } from "@/components/product/ProductBackButton";
import { addToQuoteButtonClass } from "@/lib/quote-button";
import { localePath, pageAlternates } from "@/lib/locales";

type PageProps = {
  params: Promise<{ locale: string; category: string; slug: string }>;
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllProductPaths().map(({ category, slug }) => ({ locale, category, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const product = getProduct(category, slug);
  if (!product) return {};
  const name = loc(locale, product.name.en, product.name.zh);

  return {
    title: `${product.partNumber} ${name} | OEM`,
    description: loc(locale, product.description.en, product.description.zh),
    alternates: pageAlternates(locale, `/parts/${category}/${slug}`),
    openGraph: {
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, category: categorySlug, slug } = await params;
  setRequestLocale(locale);
  const product = getProduct(categorySlug, slug);
  const category = getCategory(categorySlug);
  if (!product || !category) notFound();

  const t = await getTranslations("product");
  const tNav = await getTranslations("nav");
  const name = loc(locale, product.name.en, product.name.zh);
  const description = loc(locale, product.description.en, product.description.zh);
  const productUrl = `${siteConfig.url}${localePath(locale, `/parts/${categorySlug}/${slug}`)}`;

  return (
    <SiteShell showFloatingActions={false} hideBottomNav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          sku: product.partNumber,
          description,
          image: `${siteConfig.url}${product.image}`,
          brand: { "@type": "Brand", name: product.brands.join(", ") },
          offers: {
            "@type": "Offer",
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: productUrl,
          },
        }}
      />

      <main className="mx-auto mb-[calc(5.75rem+env(safe-area-inset-bottom))] max-w-container-max px-margin-mobile py-gutter md:mb-12 md:px-margin-desktop">
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <ProductBackButton fallbackHref={`/parts/${categorySlug}`} />
          <Breadcrumbs
            className="mb-0 min-w-0"
            items={[
              { href: "/", label: tNav("home") },
              { href: "/parts/transmission-systems", label: tNav("products") },
              { href: `/parts/${categorySlug}`, label: loc(locale, category.name.en, category.name.zh) },
              { label: product.partNumber },
            ]}
          />
        </div>

        <div className="mb-16 grid grid-cols-1 gap-gutter md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-7">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <Image
                src={product.image}
                alt={name}
                fill
                quality={100}
                unoptimized
                className={product.imageFit === "contain" ? "object-contain object-center p-6" : "object-cover object-center"}
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col md:col-span-5">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded bg-surface-tint px-2 py-1 text-label-caps text-on-primary">
                  {product.brands.join(" / ")}
                </span>
                {product.inStock && (
                  <span className="flex items-center text-technical-data text-primary">
                    <MaterialIcon name="check_circle" className="me-1 text-[16px]" />
                    {t("stockReady")}
                  </span>
                )}
              </div>
              <h1 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {name}
              </h1>
              {product.oemPart && (
                <p className="inline-block rounded border border-outline-variant bg-surface-container-low px-3 py-1 text-technical-data text-on-surface-variant">
                  {t("oemPart")}: {product.oemPart}
                </p>
              )}
            </div>

            <div className="mb-6 border-t border-b border-outline-variant py-6">
              <p className="mb-4 text-body-md text-on-surface-variant">{description}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { icon: "speed", label: t("dynamicBalancing") },
                  { icon: "water_drop", label: t("pressureTested") },
                  { icon: "inventory_2", label: t("exportPacking") },
                  { icon: "local_shipping", label: t("dispatch") },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container p-3"
                  >
                    <MaterialIcon name={badge.icon} filled className="text-primary" />
                    <span className="text-technical-data text-on-surface">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto hidden flex-col gap-4 md:flex">
              <AddToQuoteButton
                product={product}
                icon="request_quote"
                className={addToQuoteButtonClass("primary")}
              />
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-lowest py-3 text-technical-data text-on-surface hover:border-primary"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t("whatsapp")}
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
              <MaterialIcon name="table" />
              {t("techParams")}
            </h2>
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <table className="w-full border-collapse text-left">
                <tbody>
                  {product.technicalSpecs.map((row, i) => (
                    <tr key={row.labelKey} className="border-b border-outline-variant last:border-0">
                      <th className="w-1/3 bg-surface-container-high px-4 py-3 text-technical-data text-on-surface-variant">
                        {t(row.labelKey)}
                      </th>
                      <td
                        className={`px-4 py-3 text-body-sm text-on-surface ${i % 2 === 0 ? "bg-surface" : "bg-surface-container-low"}`}
                      >
                        {loc(locale, row.value.en, row.value.zh)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
              <MaterialIcon name="verified" />
              {t("zeroDefect")}
            </h2>
            <Link
              href="/quality-logistics"
              className="group relative block aspect-video overflow-hidden rounded-xl border border-outline-variant"
            >
              <Image
                src="/images/factory/cmm-inspection.jpg"
                alt={t("factoryTest")}
                fill
                quality={100}
                unoptimized
                className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-on-background/20 group-hover:bg-on-background/30" />
              <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between gap-3">
                <span className="rounded bg-surface/90 px-3 py-1 text-technical-data text-on-surface backdrop-blur-sm">
                  {t("factoryTest")}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-primary-container px-3 py-1 text-technical-data text-on-primary-container">
                  {t("qcLink")}
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 z-50 flex w-full gap-3 border-t border-outline-variant bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
        <ProductBackButton fallbackHref={`/parts/${categorySlug}`} variant="icon" />
        <a
          href={siteConfig.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest py-3 text-technical-data text-on-surface"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("chat")}
        </a>
        <AddToQuoteButton
          product={product}
          icon="request_quote"
          label={t("inquiry")}
          className={addToQuoteButtonClass("mobile")}
        />
      </div>
    </SiteShell>
  );
}
