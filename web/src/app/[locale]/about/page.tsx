import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FactoryGallery } from "@/components/home/FactoryGallery";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSameAs, siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tNav = await getTranslations("nav");
  const legalName = locale === "zh" ? siteConfig.nameZh : siteConfig.name;

  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: t("h1"),
          url: `${siteConfig.url}${localePath(locale, "/about")}`,
          about: {
            "@type": "Organization",
            name: siteConfig.name,
            alternateName: siteConfig.nameZh,
            url: siteConfig.url,
            logo: `${siteConfig.url}${siteConfig.logo}`,
            telephone: siteConfig.phone,
            email: siteConfig.email,
            sameAs: organizationSameAs(),
            address: {
              "@type": "PostalAddress",
              addressLocality: "Linyi",
              addressRegion: "Shandong",
              addressCountry: "CN",
            },
          },
        }}
      />
      <main className="pb-24 md:pb-0">
        <section className="border-b border-outline-variant bg-surface-container-lowest px-margin-mobile py-12 md:px-margin-desktop md:py-16">
          <div className="mx-auto max-w-container-max">
            <Breadcrumbs items={[{ href: "/", label: tNav("home") }, { label: t("title") }]} />
            <p className="mb-2 text-label-caps tracking-widest text-primary uppercase">{t("legalLabel")}</p>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <BrandLogo size="lg" priority />
              <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-xl">{t("h1")}</h1>
            </div>
            <p className="mb-2 max-w-3xl text-body-lg font-medium text-on-surface">{legalName}</p>
            <p className="mb-8 max-w-3xl text-body-lg text-on-surface-variant">{t("lead")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/parts/transmission-systems"
                className="inline-flex items-center gap-2 rounded bg-primary-container px-6 py-3 text-technical-data font-bold text-on-primary-container hover:bg-primary hover:text-on-primary"
              >
                {t("ctaCatalog")}
                <MaterialIcon name="arrow_forward" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded border border-outline-variant px-6 py-3 text-technical-data font-bold text-on-surface hover:border-primary"
              >
                {t("ctaQuote")}
              </Link>
            </div>
          </div>
        </section>
        <section className="px-margin-mobile py-12 md:px-margin-desktop md:py-16">
          <div className="mx-auto max-w-container-max">
            <h2 className="mb-6 text-headline-md text-on-surface">{t("advantagesTitle")}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { icon: "precision_manufacturing", title: t("whatTitle"), desc: t("what") },
                { icon: "warehouse", title: t("whereTitle"), desc: t("where") },
                { icon: "local_shipping", title: t("howTitle"), desc: t("how") },
              ].map((item) => (
                <div key={item.title} className="rounded border border-outline-variant bg-surface p-6">
                  <MaterialIcon name={item.icon} className="mb-4 text-4xl text-primary" />
                  <h3 className="mb-2 text-headline-md text-on-surface">{item.title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-3xl text-body-lg text-on-surface-variant">{t("close")}</p>
            <div className="mt-6">
              <Link href="/quality-logistics" className="text-technical-data text-primary hover:underline">
                {t("ctaQuality")} →
              </Link>
            </div>
          </div>
        </section>
        <FactoryGallery />
      </main>
    </SiteShell>
  );
}
