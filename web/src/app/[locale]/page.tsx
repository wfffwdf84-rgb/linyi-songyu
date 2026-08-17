import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

const heroImage = "/images/hero-warehouse.png";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const categories = [
    {
      title: t("catTransmission"),
      desc: t("catTransmissionDesc"),
      href: "/parts/transmission-systems" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvGvtgTzArZXqX1dR_PFsbXNkWuqcLdHOLOOfRCohJzgpVz2HZeozTD8COscCl5qBOS1fA27tENDoAoVj0C4NmtgGa2SsAgsO4F3tanx9q4Pfi-iFZP7Tf0DZrb-E6zvLvyRXivRAY56i61dFm9ozw_BZLpARSEX-sgJPXZ1IGOAsrRN2GfAOB25nUpkMtg67islWJfc3Hh42eXL9bxkRyqtiC9ECJoGFOJd2ek2Ou7CSKTwgCRqJK",
    },
    {
      title: t("catBrake"),
      desc: t("catBrakeDesc"),
      href: "/parts/brake-components" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCXtQ5E7RDUrDUSrJF6iYuj7YWhqFfw6BPHORKEuUtNR24VasPAZYNtF0WKGU0oiRLnmfSMpUxi33DiQT0jBJLpzAxmK5pNSfcBlSr_7F5k9gJk_D_FmcyyWAkOCHMOn0KK5QuSo2JQkBsR4aRlYac4lOYsGiAXAoVCuj0V44-YyvBCctGYX9nK7JGyUlzcM97-UWXtylQYx2GxhaYw1KtcvEevoAtavb0VC1RBfyBXMQkKNPIqt4Kj",
    },
    {
      title: t("catLube"),
      desc: t("catLubeDesc"),
      href: "/parts/lubrication-parts" as const,
      icon: "oil_barrel",
    },
  ];

  return (
    <SiteShell showFloatingActions={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          contactPoint: {
            "@type": "ContactPoint",
            email: siteConfig.email,
            contactType: "sales",
          },
        }}
      />

      <main className="pb-24">
        <section className="relative flex h-[80vh] w-full items-end px-margin-mobile pb-12">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage}
              alt={t("heroAlt")}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
          <div className="relative z-10 w-full">
            <span className="mb-4 inline-block rounded bg-primary px-3 py-1 text-label-caps tracking-widest text-on-primary uppercase">
              {t("heroBadge")}
            </span>
            <h1 className="mb-4 text-headline-xl leading-tight text-white">{t("heroTitle")}</h1>
            <p className="mb-8 max-w-md text-body-lg text-gray-200">{t("heroSubtitle")}</p>
            <div className="flex flex-col gap-4">
              <a
                href={siteConfig.whatsapp}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-headline-md text-on-primary shadow-lg transition-colors hover:bg-primary-container"
              >
                <MaterialIcon name="chat" filled />
                {t("whatsapp")}
              </a>
              <Link
                href="/parts/transmission-systems"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface/10 py-4 text-headline-md text-white backdrop-blur-md transition-colors hover:bg-surface/20"
              >
                <MaterialIcon name="menu_book" />
                {t("browse")}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-on-secondary-fixed px-margin-mobile py-8">
          <div className="mx-auto grid max-w-container-max grid-cols-1 gap-4">
            {[
              { icon: "verified", title: t("badgeExport"), desc: t("badgeExportDesc") },
              { icon: "local_shipping", title: t("badgeShip"), desc: t("badgeShipDesc") },
            ].map((badge) => (
              <div
                key={badge.title}
                className="flex items-center gap-4 rounded-xl border border-outline/20 bg-on-secondary-fixed-variant p-4"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <MaterialIcon
                    name={badge.icon}
                    filled
                    className="text-3xl text-primary-fixed"
                  />
                </div>
                <div>
                  <h3 className="text-technical-data tracking-wider text-primary-fixed uppercase">
                    {badge.title}
                  </h3>
                  <p className="text-body-sm text-secondary-fixed-dim">{badge.desc}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 rounded-xl border border-outline/20 bg-on-secondary-fixed-variant p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-outline/30">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVgSinNS2uAOqdKIbBm2ijblpfI6rtvOX_U29HqzUxpPOUN0nWOExxbliUAR7jGSz2uBNuTTPI8exGJYXl3xiaudRSTWIVLs7c3HIiXWegtBMlaYNEEhFpS0cvBf16_ijYbcb2ewy6-nWtWlr2XyW5_y1zWF6m19xRIWOVHse-OUq43grYSPEvGdR_vjrg0r7gSRb4zSp5yhkyaUjLadDDXcjfFrj0frYPqV35R7MDRR2HKDGfM-S_"
                  alt={t("qcAlt")}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-technical-data tracking-wider text-primary-fixed uppercase">
                  {t("badgeQc")}
                </h3>
                <p className="text-body-sm text-secondary-fixed-dim">{t("badgeQcDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest px-margin-mobile py-12">
          <h2 className="mb-8 border-l-4 border-primary pl-4 text-headline-lg-mobile text-on-surface">
            {t("matrix")}
          </h2>
          <div className="mx-auto grid max-w-container-max grid-cols-1 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-surface-container p-8">
                      <MaterialIcon
                        name={cat.icon ?? "inventory_2"}
                        className="text-[120px] text-primary opacity-80"
                      />
                    </div>
                  )}
                </div>
                <div className="border-t border-outline-variant p-4">
                  <h3 className="mb-2 text-headline-md text-on-surface">{cat.title}</h3>
                  <p className="mb-4 text-body-sm text-on-surface-variant">{cat.desc}</p>
                  <span className="flex items-center gap-1 text-technical-data tracking-wide text-primary uppercase">
                    {t("viewSpecs")} <MaterialIcon name="arrow_forward" className="text-sm" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-outline-variant bg-surface-container-low px-margin-mobile py-12">
          <div className="mx-auto max-w-container-max text-center">
            <span className="mb-2 block text-label-caps tracking-widest text-primary uppercase">
              {t("oemLabel")}
            </span>
            <h2 className="mb-8 text-headline-lg-mobile text-on-surface">{t("whyTitle")}</h2>
            <div className="flex flex-col gap-6 text-left">
              {[
                { icon: "warehouse", title: t("hubTitle"), desc: t("hubDesc") },
                { icon: "inventory_2", title: t("consolTitle"), desc: t("consolDesc") },
              ].map((item) => (
                <div
                  key={item.title}
                  className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface p-6 shadow-sm"
                >
                  <MaterialIcon name={item.icon} className="mb-4 block text-4xl text-primary" />
                  <h3 className="mb-2 text-headline-md text-on-surface">{item.title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest px-margin-mobile py-12">
          <div className="mx-auto max-w-container-max">
            <div className="rounded-xl border-t-4 border-primary bg-on-secondary-fixed p-6 text-on-secondary shadow-lg">
              <h2 className="mb-2 text-headline-md text-white">{t("rfqTitle")}</h2>
              <p className="mb-6 text-body-sm text-secondary-fixed-dim">{t("rfqDesc")}</p>
              <Link
                href="/request-quote"
                className="block w-full rounded-lg bg-primary py-3 text-center text-headline-md text-on-primary transition-colors hover:bg-primary-container"
              >
                {t("requestQuote")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <a
        href={siteConfig.whatsapp}
        className="fixed right-4 bottom-24 z-40 flex items-center justify-center rounded-full bg-green-500 p-4 text-white shadow-lg hover:bg-green-600 lg:bottom-8"
        aria-label="WhatsApp"
      >
        <MaterialIcon name="chat" filled className="text-3xl" />
      </a>
    </SiteShell>
  );
}
