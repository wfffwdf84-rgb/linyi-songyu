import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FactoryGallery } from "@/components/home/FactoryGallery";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quality" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function QualityLogisticsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("quality");
  const tNav = await getTranslations("nav");

  const jumps = [
    { href: "#qc", label: t("jumpQc") },
    { href: "#hub", label: t("jumpHub") },
    { href: "#sea", label: t("jumpSea") },
    { href: "#land", label: t("jumpLand") },
  ] as const;

  const qcCards = [
    { icon: "speed", title: t("card1Title"), desc: t("card1Desc"), spec: t("card1Spec") },
    { icon: "compress", title: t("card2Title"), desc: t("card2Desc"), spec: t("card2Spec") },
    { icon: "policy", title: t("card3Title"), desc: t("card3Desc"), spec: t("card3Spec") },
  ];

  return (
    <SiteShell>
      <main className="pb-20 md:pb-0">
        <section className="relative border-b border-outline-variant bg-surface-container-lowest py-12 md:py-16">
          <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-10 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
            <div>
              <Breadcrumbs
                items={[{ href: "/", label: tNav("home") }, { label: tNav("quality") }]}
              />
              <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-outline px-3 py-1">
                <MaterialIcon name="verified" filled className="text-sm text-primary" />
                <span className="text-label-caps text-secondary uppercase">{t("badge")}</span>
              </div>
              <h1 className="mb-6 text-headline-lg-mobile text-on-surface md:text-headline-xl">
                {t("h1")}
              </h1>
              <p className="mb-8 max-w-xl text-body-lg text-on-surface-variant">{t("intro")}</p>
              <div className="mb-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded bg-primary-container px-6 py-3 text-technical-data font-bold text-on-primary-container shadow-sm hover:bg-primary hover:text-on-primary"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t("whatsapp")}
                </Link>
                <Link
                  href="/parts/transmission-systems"
                  className="inline-flex items-center gap-2 rounded border border-outline-variant px-6 py-3 text-technical-data text-on-surface hover:border-primary"
                >
                  {t("browseCatalog")}
                </Link>
              </div>
              <nav aria-label={tNav("quality")} className="flex flex-wrap gap-2">
                {jumps.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded border border-outline-variant bg-surface px-3 py-1.5 text-technical-data text-on-surface-variant hover:border-primary hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <figure>
              <div className="relative aspect-video w-full overflow-hidden rounded border border-outline-variant bg-surface-container">
                <Image
                  src="/images/factory/cmm-inspection.jpg"
                  alt={t("photoCaption")}
                  fill
                  quality={100}
                  unoptimized
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <figcaption className="mt-3 text-technical-data text-on-surface-variant">
                {t("photoCaption")}
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="qc" className="scroll-mt-24 bg-surface py-16 md:py-20">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="mb-12 max-w-3xl">
              <h2 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {t("protocolTitle")}
              </h2>
              <p className="text-body-md text-on-surface-variant">{t("protocolDesc")}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {qcCards.map((card, index) => (
                <div
                  key={card.title}
                  className="rounded border border-outline-variant bg-surface-container-lowest p-6"
                >
                  <p className="mb-3 text-label-caps text-primary">{String(index + 1).padStart(2, "0")}</p>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-surface-container">
                    <MaterialIcon name={card.icon} className="text-primary" />
                  </div>
                  <h3 className="mb-2 text-body-lg font-bold text-on-surface">{card.title}</h3>
                  <p className="mb-4 text-body-sm text-on-surface-variant">{card.desc}</p>
                  <div className="border-t border-outline-variant pt-4">
                    <p className="text-label-caps text-primary">{card.spec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FactoryGallery showMoreLink={false} />

        <section
          id="hub"
          className="scroll-mt-24 border-y border-outline-variant bg-surface-container-low py-16 md:py-20"
        >
          <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-12 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
            <div className="relative order-2 aspect-video overflow-hidden rounded border border-outline-variant bg-surface-container md:order-1">
              <Image
                src="/images/factory/factory-exterior.jpg"
                alt={t("hubTitle")}
                fill
                quality={100}
                unoptimized
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="mb-6 text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {t("hubTitle")}
              </h2>
              <p className="mb-8 text-body-lg text-on-surface-variant">{t("hubDesc")}</p>
              <ul className="space-y-6">
                {[
                  { icon: "schedule", title: t("shipTitle"), desc: t("shipDesc") },
                  { icon: "directions_boat", title: t("portTitle"), desc: t("portDesc") },
                  { icon: "local_shipping", title: t("landTitle"), desc: t("landDesc") },
                  { icon: "inventory_2", title: t("consolTitle"), desc: t("consolDesc"), id: "consol" },
                  { icon: "public", title: t("destTitle"), desc: t("destDesc") },
                ].map((item) => (
                  <li
                    key={item.title}
                    id={item.id}
                    className="flex scroll-mt-24 items-start gap-4"
                  >
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-outline-variant bg-surface">
                      <MaterialIcon name={item.icon} className="text-sm text-primary" />
                    </div>
                    <div>
                      <h3 className="text-technical-data font-bold text-on-surface">{item.title}</h3>
                      <p className="mt-1 text-body-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="sea" className="scroll-mt-24 bg-surface py-16 md:py-20">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="mb-12 max-w-3xl">
              <h2 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {t("seaTitle")}
              </h2>
              <p className="text-body-md text-on-surface-variant">{t("seaLead")}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { icon: "warehouse", title: t("sea1Title"), desc: t("sea1Desc"), spec: t("sea1Spec") },
                { icon: "directions_boat", title: t("sea2Title"), desc: t("sea2Desc"), spec: t("sea2Spec") },
                { icon: "public", title: t("sea3Title"), desc: t("sea3Desc"), spec: t("sea3Spec") },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded border border-outline-variant bg-surface-container-lowest p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-surface-container">
                    <MaterialIcon name={card.icon} className="text-primary" />
                  </div>
                  <h3 className="mb-2 text-body-lg font-bold text-on-surface">{card.title}</h3>
                  <p className="mb-4 text-body-sm text-on-surface-variant">{card.desc}</p>
                  <div className="border-t border-outline-variant pt-4">
                    <p className="text-label-caps text-primary">{card.spec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="land"
          className="scroll-mt-24 border-t border-outline-variant bg-surface-container-low py-16 md:py-20"
        >
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="mb-12 max-w-3xl">
              <h2 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {t("landHowTitle")}
              </h2>
              <p className="text-body-md text-on-surface-variant">{t("landLead")}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { icon: "warehouse", title: t("land1Title"), desc: t("land1Desc"), spec: t("land1Spec") },
                { icon: "local_shipping", title: t("land2Title"), desc: t("land2Desc"), spec: t("land2Spec") },
                { icon: "public", title: t("land3Title"), desc: t("land3Desc"), spec: t("land3Spec") },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded border border-outline-variant bg-surface-container-lowest p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-surface-container">
                    <MaterialIcon name={card.icon} className="text-primary" />
                  </div>
                  <h3 className="mb-2 text-body-lg font-bold text-on-surface">{card.title}</h3>
                  <p className="mb-4 text-body-sm text-on-surface-variant">{card.desc}</p>
                  <div className="border-t border-outline-variant pt-4">
                    <p className="text-label-caps text-primary">{card.spec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-on-secondary-fixed py-16 text-white md:py-20">
          <div className="mx-auto max-w-container-max px-margin-mobile text-center md:px-margin-desktop">
            <h2 className="mb-4 text-headline-lg-mobile md:text-headline-lg">{t("ctaTitle")}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-body-lg text-secondary-fixed-dim">
              {t("ctaDesc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded bg-primary-container px-8 py-3 text-technical-data font-bold text-on-primary-container hover:bg-primary hover:text-on-primary"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t("whatsapp")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
