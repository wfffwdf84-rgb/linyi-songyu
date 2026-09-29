import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function HomeInquiry() {
  const t = await getTranslations("home");

  return (
    <section className="bg-surface px-margin-mobile py-8 md:px-margin-desktop md:py-16">
      <div className="mx-auto max-w-container-max">
        <div className="flex flex-col gap-6 rounded border-y-4 border-primary bg-on-secondary-fixed p-6 text-on-secondary shadow-lg md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-2xl">
            <h2 className="mb-2 text-headline-md text-white">{t("rfqTitle")}</h2>
            <p className="text-body-sm text-secondary-fixed-dim">{t("rfqDesc")}</p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded bg-primary px-8 py-3 text-center text-base font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            {t("requestQuote")}
          </Link>
        </div>
      </div>
    </section>
  );
}
