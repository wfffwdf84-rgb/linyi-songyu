import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { localePath, pageAlternates } from "@/lib/locales";
import { parseInquiryTypes } from "@/lib/inquiry";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string | string[] }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: pageAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tNav = await getTranslations("nav");
  const initialTypes = parseInquiryTypes(query.type);

  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: t("h1"),
          url: `${siteConfig.url}${localePath(locale, "/contact")}`,
          about: {
            "@type": "Organization",
            name: siteConfig.name,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Linyi",
              addressRegion: "Shandong",
              addressCountry: "CN",
            },
          },
        }}
      />
      <main className="mx-auto w-full max-w-container-max px-margin-mobile py-12 pb-24 md:px-margin-desktop md:pb-16">
        <Breadcrumbs items={[{ href: "/", label: tNav("home") }, { label: t("title") }]} />
        <h1 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-xl">{t("h1")}</h1>
        <p className="mb-10 max-w-2xl text-body-lg text-on-surface-variant">{t("lead")}</p>
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <QuoteForm initialTypes={initialTypes} />
          </div>
          <div className="lg:col-span-4">
            <QuoteSummary />
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
