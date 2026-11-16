import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { readSiteImages } from "@/lib/site-images";
import { siteImageListFrom } from "@/lib/site-image-slots";

/**
 * What each shipped hero file looks like behind the text. The pan and zoom are
 * part of the photo, not of the carousel: a replaced file gets the neutral
 * position below, because a framing tuned for one picture ruins another.
 */
const SHIPPED_SLIDES = [
  {
    src: "/images/hero-warehouse-parts.webp",
    altKey: "heroAltLinkage",
    objectPosition: "object-[42%_78%] scale-[1.22]",
  },
  { src: "/images/hero-radiator-field.webp", altKey: "heroAltRadiator", objectPosition: undefined },
  {
    src: "/images/hero-transmission-assembly.webp",
    altKey: "heroAltTransmission",
    objectPosition: "object-center",
  },
  {
    src: "/images/hero-cast-housing.webp",
    altKey: "heroAltCastHousing",
    objectPosition: "object-[55%_center]",
  },
] as const;

/** Framing for a photo the operator uploaded, whose content we cannot know. */
const NEUTRAL_POSITION = "object-[72%_center]";

export async function HomeHero() {
  const t = await getTranslations("home");
  const images = await readSiteImages();

  const slides = siteImageListFrom(images, "home.hero").map((src) => {
    const shipped = SHIPPED_SLIDES.find((slide) => slide.src === src);
    return {
      src,
      // A replaced file has no per-picture description; the generic heroAlt is
      // still better than an empty alt for a full-screen image.
      alt: shipped ? t(shipped.altKey) : t("heroAlt"),
      objectPosition: shipped ? shipped.objectPosition : NEUTRAL_POSITION,
    };
  });

  return (
    <HeroCarousel
      slides={slides}
      prevLabel={t("heroPrev")}
      nextLabel={t("heroNext")}
    >
      <div className="w-full max-w-5xl px-4 text-start md:px-16 lg:px-20">
        <span className="mb-4 inline-block rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-semibold tracking-widest text-on-primary uppercase md:mb-5 md:text-[13px]">
          {t("heroBadge")}
        </span>
        <h1 className="mb-4 max-w-4xl text-[27px] leading-[1.15] font-bold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] md:mb-5 md:text-[50px] md:leading-[1.12] lg:text-[58px]">
          {t("heroTitle")}
        </h1>
        <p className="mb-8 max-w-2xl text-[14px] text-gray-200 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)] md:mb-10 md:text-lg lg:text-[20px] lg:leading-8">
          {t("heroSubtitle")}
        </p>
        <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/parts/transmission-systems"
            className="flex items-center justify-center gap-2 rounded bg-primary px-8 py-3.5 text-[14px] font-semibold text-on-primary shadow-lg transition-colors hover:bg-primary-container md:text-base"
          >
            <MaterialIcon name="menu_book" />
            {t("browse")}
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 rounded border border-white/40 bg-white/15 px-8 py-3.5 text-[14px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25 md:text-base"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t("whatsapp")}
          </Link>
        </div>
      </div>
    </HeroCarousel>
  );
}
