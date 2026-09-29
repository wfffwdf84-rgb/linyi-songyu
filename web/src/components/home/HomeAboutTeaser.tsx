import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function HomeAboutTeaser() {
  const t = await getTranslations("home");
  const about = await getTranslations("about");

  return (
    <section className="bg-surface px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <div className="mx-auto grid max-w-container-max items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-label-caps tracking-widest text-primary uppercase">
            {t("aboutEyebrow")}
          </span>
          <h2 className="mb-4 text-headline-lg-mobile text-on-surface md:text-headline-lg">{about("h1")}</h2>
          <p className="mb-6 max-w-xl text-body-md text-on-surface-variant md:text-body-lg">{about("lead")}</p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1 text-technical-data tracking-wide text-primary uppercase hover:underline"
          >
            {t("aboutCta")}
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-4 shadow-sm md:p-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-container">
            <Image
              src="/images/factory/factory-exterior.jpg"
              alt={t("shot1")}
              fill
              quality={100}
              unoptimized
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
