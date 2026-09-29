import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function HomeWhyUs() {
  const t = await getTranslations("home");
  const items = [
    { icon: "verified", title: t("badgeExport"), lead: t("badgeExportDesc") },
    { icon: "local_shipping", title: t("badgeShip"), lead: t("badgeShipDesc") },
    { icon: "fact_check", title: t("badgeQc"), lead: t("badgeQcDesc") },
  ];

  return (
    <section className="bg-surface-container-low px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <div className="mx-auto max-w-container-max">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-label-caps tracking-widest text-primary uppercase">
            {t("whyUsLabel")}
          </span>
          <h2 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">{t("whyUsTitle")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-outline-variant/60 bg-surface p-6 shadow-sm md:p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MaterialIcon name={item.icon} filled className="text-3xl text-primary" />
              </div>
              <h3 className="mb-2 text-headline-md text-on-surface">{item.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{item.lead}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
