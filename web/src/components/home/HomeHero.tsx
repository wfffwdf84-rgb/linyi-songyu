import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function HomeHero() {
  const t = await getTranslations("home");

  return (
    <HeroCarousel
      slides={[
        { src: "/images/hero-warehouse-parts.jpg", alt: t("heroAltLinkage"), objectPosition: "object-[42%_78%] scale-[1.22]" },
        { src: "/images/hero-radiator-field.jpg", alt: t("heroAltRadiator") },
        { src: "/images/hero-transmission-assembly.jpg", alt: t("heroAltTransmission"), objectPosition: "object-center" },
        { src: "/images/hero-cast-housing.jpg", alt: t("heroAltCastHousing"), objectPosition: "object-[55%_center]" },
      ]}
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
