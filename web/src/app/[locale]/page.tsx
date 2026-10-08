import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { FactoryGallery } from "@/components/home/FactoryGallery";
import { HomeFeaturedProducts } from "@/components/home/HomeFeaturedProducts";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeInquiry } from "@/components/home/HomeInquiry";
import { HomeWhyUs } from "@/components/home/HomeWhyUs";
import { organizationSameAs, siteConfig } from "@/lib/site";
import { pageAlternates } from "@/lib/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: pageAlternates(locale, "/"),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          contactPoint: {
            "@type": "ContactPoint",
            email: siteConfig.email,
            telephone: siteConfig.phone,
            contactType: "sales",
          },
          sameAs: organizationSameAs(),
        }}
      />

      <main className="pb-24 md:pb-0">
        <HomeHero />
        <HomeWhyUs />
        <HomeFeaturedProducts />
        <FactoryGallery />

        <section className="border-y border-outline-variant bg-surface px-margin-mobile py-8 md:px-margin-desktop md:py-16">
          <div className="mx-auto max-w-container-max">
            <div className="mb-8 text-center">
              <span className="mb-2 block text-label-caps tracking-widest text-primary uppercase">
                {t("oemLabel")}
              </span>
              <h2 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {t("whyTitle")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: "warehouse",
                  title: t("hubTitle"),
                  desc: t("hubDesc"),
                  href: "/quality-logistics#hub" as const,
                },
                {
                  icon: "inventory_2",
                  title: t("consolTitle"),
                  desc: t("consolDesc"),
                  href: "/quality-logistics#consol" as const,
                },
                {
                  icon: "directions_boat",
                  title: t("seaTitle"),
                  desc: t("seaDesc"),
                  href: "/quality-logistics#sea" as const,
                },
                {
                  icon: "local_shipping",
                  title: t("landTitle"),
                  desc: t("landDesc"),
                  href: "/quality-logistics#land" as const,
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-colors hover:border-primary md:p-6"
                >
                  <MaterialIcon name={item.icon} className="mb-4 block text-4xl text-primary" />
                  <h3 className="mb-2 text-headline-md text-on-surface">{item.title}</h3>
                  <p className="mb-4 text-body-sm text-on-surface-variant">{item.desc}</p>
                  <span className="flex items-center gap-1 text-technical-data tracking-wide text-primary uppercase">
                    {t("factoryMore")}
                    <MaterialIcon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <HomeInquiry />
      </main>
    </SiteShell>
  );
}
