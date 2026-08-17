import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RequestQuotePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("quote");

  const quoteItems = [
    {
      title:
        locale === "zh" ? "轮式装载机变速箱总成" : "Wheel Loader Transmission Assembly",
      ref: "OEM Ref: ZF-4WG200",
      qty: locale === "zh" ? "数量: 1" : "QTY: 1",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBmnx05pOG6ztSQzdzamS7TQ3pN8uAUY3_5H0UCOa_nnp2H00c2pnNONyKpd7S2Hqy6U3jYm5rkmPo7hLxVLAN4zdxsE9uffGYrPbdI63u93YOh3fTU4270Qg2NrSoCC7i1pH-Tli0H9uy1rfpEDZ7qR0d-BEzQQ9E7ruij9P7Km00FMMqX36z9EneEKZnTxxmlhPxwd8QZKV4RIHgcHox_caMTxr9H13xfk0wxbD8oDmg5ztOQDyiA",
    },
    {
      title: locale === "zh" ? "气动黄油泵（50:1）" : "Pneumatic Grease Pump (50:1)",
      ref: locale === "zh" ? "挖掘机保养套件" : "Excavator Maintenance Kit",
      qty: locale === "zh" ? "数量: 3" : "QTY: 3",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD35uY3ebRaFbNrGaTg59be8dholfntAPY2X68lMzAzlG2skIWZgCXyuQemHT8w32c0XbZwBCU-C8qTwTWDhe9XqOnBPwfibbmePhCET0FiBXE1PTbt_i1N6OrhDurN8yPLrJyOz118-xoI0cg21USKgAQkOvYZIi_TBv0f0ypfvAnFjUz9vZo6wBkzINM0isS7qoi2gPyCJk0owqc3Ym5XkBGUGj5t9dBz9pJQsD0aK02B0ZOWK2pq",
    },
  ];

  return (
    <SiteShell hideFooter>
      <main className="mx-auto mb-20 grid w-full max-w-container-max flex-grow grid-cols-1 gap-gutter px-margin-mobile py-8 lg:mb-8 lg:grid-cols-12 md:px-margin-desktop">
        <div className="space-y-6 lg:col-span-8">
          <div className="mb-8">
            <h1 className="mb-2 text-headline-xl text-on-surface">{t("h1")}</h1>
            <p className="text-body-lg text-on-surface-variant">{t("intro")}</p>
          </div>
          <QuoteForm />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-sm">
            <div className="flex items-center justify-between bg-secondary p-4 text-on-secondary">
              <h3 className="flex items-center gap-2 text-headline-md">
                <MaterialIcon name="list_alt" />
                {t("summary")}
              </h3>
              <span className="rounded bg-on-secondary-fixed px-2 py-1 text-label-caps text-primary-fixed">
                {t("items", { count: 2 })}
              </span>
            </div>
            <div className="flex flex-col gap-4 p-4">
              {quoteItems.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 border-b border-outline-variant pb-4 last:border-0 last:pb-0"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-outline-variant bg-surface-variant">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-technical-data font-bold text-on-surface">{item.title}</h4>
                    <p className="text-body-sm text-on-surface-variant">{item.ref}</p>
                    <p className="mt-1 text-label-caps text-primary">{item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border-l-4 border-primary bg-surface-container-highest p-6">
            <h3 className="mb-4 text-headline-md text-on-surface">{t("why")}</h3>
            <ul className="space-y-4">
              {[
                { icon: "local_shipping", title: t("fastTitle"), desc: t("fastDesc") },
                { icon: "inventory_2", title: t("consolTitle"), desc: t("consolDesc") },
                { icon: "fact_check", title: t("qcTitle"), desc: t("qcDesc") },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <div className="rounded bg-on-tertiary-fixed p-1 text-primary-fixed">
                    <MaterialIcon name={item.icon} className="text-[20px]" />
                  </div>
                  <div>
                    <h4 className="text-technical-data font-bold text-on-surface">{item.title}</h4>
                    <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
