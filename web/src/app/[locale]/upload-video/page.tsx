import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { VideoUploadForm } from "@/components/quote/VideoUploadForm";
import { siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { localePath, pageAlternates } from "@/lib/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "video" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: pageAlternates(locale, "/upload-video"),
  };
}

export default async function UploadVideoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("video");
  const tNav = await getTranslations("nav");

  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("h1"),
          description: t("description"),
          url: `${siteConfig.url}${localePath(locale, "/upload-video")}`,
        }}
      />
      <main className="mx-auto mb-8 grid w-full max-w-container-max flex-grow grid-cols-1 gap-gutter px-margin-mobile py-8 pb-24 md:pb-8 lg:grid-cols-12 md:px-margin-desktop">
        <div className="space-y-6 lg:col-span-8">
          <div>
            <Breadcrumbs items={[{ href: "/", label: tNav("home") }, { label: t("h1") }]} />
            <h1 className="mb-2 text-headline-xl text-on-surface">{t("h1")}</h1>
            <p className="text-body-lg text-on-surface-variant">{t("lead")}</p>
          </div>
          <VideoUploadForm />
        </div>
        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border-s-4 border-primary bg-surface-container-highest p-6">
            <h2 className="mb-4 text-headline-md text-on-surface">{t("tipsTitle")}</h2>
            <ul className="space-y-3">
              {[t("tip1"), t("tip2"), t("tip3")].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <MaterialIcon name="check_circle" className="mt-0.5 text-[20px] text-primary" />
                  <span className="text-body-sm text-on-surface-variant">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-1 text-technical-data text-primary hover:underline"
            >
              {t("rfqLink")}
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </aside>
      </main>
    </SiteShell>
  );
}
