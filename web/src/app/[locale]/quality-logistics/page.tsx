import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

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

  const qcCards = [
    { icon: "speed", title: t("card1Title"), desc: t("card1Desc"), spec: t("card1Spec") },
    { icon: "compress", title: t("card2Title"), desc: t("card2Desc"), spec: t("card2Spec") },
    { icon: "policy", title: t("card3Title"), desc: t("card3Desc"), spec: t("card3Spec") },
  ];

  return (
    <SiteShell>
      <main className="pb-20 md:pb-0">
        <section className="relative border-b border-outline-variant bg-surface-container-highest py-16 md:py-24">
          <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-12 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-outline px-3 py-1">
                <MaterialIcon name="verified" filled className="text-sm text-primary" />
                <span className="text-label-caps text-secondary uppercase">{t("badge")}</span>
              </div>
              <h1 className="mb-6 text-headline-lg-mobile text-on-surface md:text-headline-xl">
                {t("h1")}
              </h1>
              <p className="mb-8 max-w-xl text-body-lg text-secondary">{t("intro")}</p>
              <Link
                href="/request-quote"
                className="inline-flex items-center gap-2 rounded bg-primary-container px-8 py-3 text-technical-data font-bold text-on-primary-container shadow-sm hover:bg-primary hover:text-on-primary"
              >
                {t("startInquiry")}
                <MaterialIcon name="arrow_forward" />
              </Link>
            </div>
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-outline-variant shadow-sm">
              <Image
                src="https://lh3.googleusercontent.com/aida/AP1WRLt7zZE-Vo39YiGM-YsOVtriEsAdVOt08wUitJ9Lc1jYidjLhu0YH6LgYehQlZWpNcKikkFDzIDG1AU79KbsXxpq78eevqEjgqj0NALhg9gtuPD91HPCE-7s3DvO20tTsAswYUMOurWn0TrVt6W5PtRk-uwgm1r4CfDNqP4HF0aOcr0_FuGfKnKhTvqQ2ZZ8u_oBOeiSPhg6b-_8dFGKrI_dgr2wuxCIa03oQ3eztbqjQSCN2b36GHkkngs"
                alt={t("card1Title")}
                fill
                className="object-cover"
              />
              <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between rounded border border-outline-variant bg-surface/90 p-4 backdrop-blur-sm">
                <div>
                  <p className="mb-1 text-label-caps text-secondary">{t("status")}</p>
                  <p className="text-technical-data font-bold text-primary">{t("statusPass")}</p>
                </div>
                <MaterialIcon name="check_circle" className="text-3xl text-primary" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {t("protocolTitle")}
              </h2>
              <p className="mx-auto max-w-2xl text-body-md text-secondary">{t("protocolDesc")}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {qcCards.map((card) => (
                <div
                  key={card.title}
                  className="group rounded-lg border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container group-hover:bg-primary-container">
                    <MaterialIcon
                      name={card.icon}
                      className="text-secondary group-hover:text-on-primary-container"
                    />
                  </div>
                  <h3 className="mb-2 text-body-lg font-bold text-on-surface">{card.title}</h3>
                  <p className="mb-4 text-body-sm text-secondary">{card.desc}</p>
                  <div className="border-t border-outline-variant pt-4">
                    <p className="text-label-caps text-primary">{card.spec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-outline-variant bg-surface-container-low py-16 md:py-24">
          <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-12 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
            <div className="relative order-2 h-[500px] overflow-hidden rounded-lg border border-outline shadow-sm md:order-1">
              <Image
                src="https://lh3.googleusercontent.com/aida/AP1WRLs_nCSoedJ7kwmUZgQrDSVaXxWiCWSQfRSJ3o8Dg21zGgSMq2nkOFCh_1-X7-uzAl_bxupbuHteN7ref4Zxr2cN5zTRBraz9A4RfN8p7cHd7acfNySJfrpIWpnwDje0Ena3zhbBC2vGyvdPYafl8qGoTmU1BdPc_RxAvWhu2svn0V9Dw_qLFpEtJWregxdypMU6OCWbuv-p0zdHH2P19GO8A-rog_pC2cxDOFIekWRiftVwYIWHvz7vMyY"
                alt={t("hubTitle")}
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="mb-6 text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {t("hubTitle")}
              </h2>
              <p className="mb-8 text-body-lg text-secondary">{t("hubDesc")}</p>
              <ul className="space-y-6">
                {[
                  { icon: "schedule", title: t("shipTitle"), desc: t("shipDesc") },
                  { icon: "directions_boat", title: t("consolTitle"), desc: t("consolDesc") },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-outline-variant bg-surface-container">
                      <MaterialIcon name={item.icon} className="text-sm text-on-surface" />
                    </div>
                    <div>
                      <h4 className="text-technical-data font-bold text-on-surface">{item.title}</h4>
                      <p className="mt-1 text-body-sm text-secondary">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-inverse-surface py-20 text-on-primary">
          <div className="mx-auto max-w-container-max px-margin-mobile text-center md:px-margin-desktop">
            <h2 className="mb-6 text-headline-lg-mobile md:text-headline-lg">{t("ctaTitle")}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-body-lg text-secondary-fixed-dim">
              {t("ctaDesc")}
            </p>
            <Link
              href="/request-quote"
              className="inline-flex items-center gap-2 rounded bg-primary-container px-8 py-4 text-body-lg font-bold text-on-primary-container hover:bg-primary hover:text-on-primary"
            >
              {t("ctaButton")}
              <MaterialIcon name="send" />
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
