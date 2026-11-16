import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { readSiteImages } from "@/lib/site-images";
import { siteImageFrom } from "@/lib/site-image-slots";

/**
 * The same six shots appear on the home page, the about page and the quality
 * page, so there is one slot per frame rather than one per page: replacing the
 * factory photo updates the three places at once, which is what an operator
 * uploading a new plant photo expects.
 */
const factoryShots = [
  { slot: "factory.exterior", key: "shot1" },
  { slot: "factory.heatTreatment", key: "shot2" },
  { slot: "factory.envEquipment", key: "shot3" },
  { slot: "factory.productionLine", key: "shot4" },
  { slot: "factory.cmmInspection", key: "shot5" },
  { slot: "factory.workshop", key: "shot6" },
] as const;

type FactoryGalleryProps = {
  showMoreLink?: boolean;
};

export async function FactoryGallery({ showMoreLink = true }: FactoryGalleryProps) {
  const t = await getTranslations("home");
  const images = await readSiteImages();

  return (
    <section className="bg-surface px-margin-mobile py-8 md:px-margin-desktop md:py-16">
      <div className="mx-auto max-w-container-max">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block text-label-caps tracking-widest text-primary uppercase">
              {t("factoryEyebrow")}
            </span>
            <h2 className="border-s-4 border-primary ps-4 text-headline-lg-mobile text-on-surface md:text-headline-lg">
              {t("factoryTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">
              {t("factoryLead")}
            </p>
          </div>
          {showMoreLink ? (
            <Link
              href="/quality-logistics"
              className="inline-flex shrink-0 items-center gap-1 text-technical-data tracking-wide text-primary uppercase hover:underline"
            >
              {t("factoryMore")}
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {factoryShots.map((shot) => (
            <figure
              key={shot.key}
              className="overflow-hidden rounded border border-outline-variant bg-surface-container-lowest shadow-sm"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface-container">
                <Image
                  src={siteImageFrom(images, shot.slot)}
                  alt={t(shot.key)}
                  fill
                  quality={100}
                  unoptimized
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <figcaption className="border-t border-outline-variant px-3 py-2 text-xs text-on-surface md:px-4 md:py-3 md:text-technical-data">
                {t(shot.key)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
