import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getCategory } from "@/lib/data/categories";
import { getAllProductPaths, getProduct } from "@/lib/data/products";
import { loc } from "@/lib/locale";
import { siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";

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
  const name = loc(locale, product.name.en, product.name.zh);
  const description = loc(locale, product.description.en, product.description.zh);
  const productUrl = `${siteConfig.url}/parts/${categorySlug}/${slug}`;

  return (
    <SiteShell showFloatingActions={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          sku: product.partNumber,
          description,
          image: product.image,
          brand: { "@type": "Brand", name: product.brands.join(", ") },
          offers: {
            "@type": "Offer",
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            priceCurrency: "USD",
            price: "0",
            url: productUrl,
          },
        }}
      />

      <main className="mx-auto mb-24 max-w-container-max px-margin-mobile py-gutter md:mb-12 md:px-margin-desktop">
        <nav className="mb-8 flex items-center gap-2 text-label-caps text-on-surface-variant uppercase">
          <Link href="/parts/transmission-systems" className="hover:text-primary">
            {t("catalog")}
          </Link>
          <MaterialIcon name="chevron_right" className="text-[14px]" />
          <Link href={`/parts/${categorySlug}`} className="hover:text-primary">
            {loc(locale, category.name.en, category.name.zh)}
          </Link>
          <MaterialIcon name="chevron_right" className="text-[14px]" />
          <span className="text-on-surface">{product.partNumber}</span>
        </nav>

        <div className="mb-16 grid grid-cols-1 gap-gutter md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-7">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded bg-on-background px-3 py-1 text-label-caps text-on-primary shadow-sm">
                <MaterialIcon
                  name="verified"
                  filled
                  className="text-[14px] text-primary-container"
                />
                {t("genuine")}
              </div>
              <Image
                src={product.image}
                alt={name}
                fill
                className="object-cover"
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
                    <MaterialIcon name="check_circle" className="mr-1 text-[16px]" />
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
              <Link
                href="/request-quote"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-4 text-headline-md text-on-primary-container shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:bg-[#e6a600]"
              >
                <MaterialIcon name="request_quote" />
                {t("addRfq")}
              </Link>
              <a
                href={siteConfig.whatsapp}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-lowest py-3 text-technical-data text-on-surface hover:border-primary"
              >
                <MaterialIcon name="forum" className="text-[#25D366]" />
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
              <MaterialIcon name="precision_manufacturing" />
              {t("zeroDefect")}
            </h2>
            <div className="group relative h-64 cursor-pointer overflow-hidden rounded-xl border border-outline-variant md:h-[calc(100%-3rem)]">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd-RrbGPMK1NlHinR5KrA24qpJWyjxcl9x2i9LCkIUg78wwweO8ALFB44JSWhKjel3ER-lhgeGi_CefeJaHYogIaRrvkDkXeB4oZoUTiijni9RyYHlgeroSAWedNnAl2V3pLASi_r1WnBRawkV0lnfFBIYYy9xzj5-59jxS4yBn4OXBcGoTDYEH39-lz6YOK9h1hAlm7cpol2BLSLfDrXMuRgm8jUK7MJ-kTEus1jVZNCkAKVfxrFs"
                alt={t("zeroDefect")}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-on-background/40 group-hover:bg-on-background/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-lg">
                  <MaterialIcon name="play_arrow" filled className="text-[32px]" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 rounded bg-surface/90 px-3 py-1 text-technical-data text-on-surface backdrop-blur-sm">
                {t("factoryTest")}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 z-50 flex w-full gap-3 border-t border-outline-variant bg-surface p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
        <a
          href={siteConfig.whatsapp}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest py-3 text-technical-data text-on-surface"
        >
          <MaterialIcon name="forum" className="text-[#25D366]" />
          {t("chat")}
        </a>
        <Link
          href="/request-quote"
          className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary-container py-3 text-[18px] text-headline-md text-on-primary-container"
        >
          <MaterialIcon name="request_quote" />
          {t("inquiry")}
        </Link>
      </div>
    </SiteShell>
  );
}
