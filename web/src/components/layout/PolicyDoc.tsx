import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";

export const policySlugs = ["shipping", "payment", "privacy", "terms"] as const;
export type PolicySlug = (typeof policySlugs)[number];

type PolicyDocProps = {
  locale: string;
  slug: PolicySlug;
};

export function policyStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function policyMetadata(locale: string, slug: PolicySlug): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: slug });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export async function PolicyDoc({ locale, slug }: PolicyDocProps) {
  setRequestLocale(locale);
  const t = await getTranslations(slug);
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const legalName = locale === "zh" ? siteConfig.nameZh : siteConfig.name;

  const sectionCount = slug === "payment" ? 3 : 4;
  const sections = Array.from({ length: sectionCount }, (_, i) => {
    const index = i + 1;
    return { title: t(`s${index}Title`), body: t(`s${index}Body`) };
  });

  const peers: { href: `/${PolicySlug}`; label: string }[] = [
    { href: "/shipping", label: tFooter("legalShipping") },
    { href: "/payment", label: tFooter("legalPayment") },
    { href: "/privacy", label: tFooter("legalPrivacy") },
    { href: "/terms", label: tFooter("legalTerms") },
  ];

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-container-max px-margin-mobile py-12 pb-24 md:px-margin-desktop md:pb-16">
        <Breadcrumbs items={[{ href: "/", label: tNav("home") }, { label: t("h1") }]} />
        <h1 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-xl">{t("h1")}</h1>
        <p className="mb-2 max-w-3xl text-body-sm text-on-surface-variant">{legalName}</p>
        <p className="mb-10 max-w-3xl text-body-lg text-on-surface-variant">{t("lead")}</p>
        <div className="max-w-3xl space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 text-headline-md text-on-surface">{section.title}</h2>
              <p className="text-body-md text-on-surface-variant">{section.body}</p>
            </section>
          ))}
        </div>
        {slug === "shipping" ? (
          <p className="mt-8 max-w-3xl">
            <Link href="/quality-logistics" className="text-technical-data text-primary hover:underline">
              {tFooter("qualityControl")} →
            </Link>
          </p>
        ) : null}
        {slug === "payment" ? (
          <p className="mt-8 max-w-3xl">
            <Link href="/contact" className="text-technical-data text-primary hover:underline">
              {tFooter("contactSupport")} →
            </Link>
          </p>
        ) : null}
        <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant pt-6 text-sm text-on-surface-variant">
          {peers.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === `/${slug}` ? "font-bold text-primary" : "hover:text-primary"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </main>
    </SiteShell>
  );
}
