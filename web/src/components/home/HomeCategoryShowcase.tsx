import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getProductsByCategory } from "@/lib/data/products";
import { inquiryTypeFromProduct } from "@/lib/inquiry";

const featured = [
  {
    titleKey: "catTransmission" as const,
    descKey: "catTransmissionDesc" as const,
    href: "/parts/transmission-systems" as const,
    image: "/images/products/md-sdlg-953n.webp",
    slug: "transmission-systems",
  },
  {
    titleKey: "catCooling" as const,
    descKey: "catCoolingDesc" as const,
    href: "/parts/cooling-parts" as const,
    image: "/images/products/rad-sdlg-953-2.webp",
    slug: "cooling-parts",
  },
  {
    titleKey: "catBrake" as const,
    descKey: "catBrakeDesc" as const,
    href: "/parts/brake-components" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXtQ5E7RDUrDUSrJF6iYuj7YWhqFfw6BPHORKEuUtNR24VasPAZYNtF0WKGU0oiRLnmfSMpUxi33DiQT0jBJLpzAxmK5pNSfcBlSr_7F5k9gJk_D_FmcyyWAkOCHMOn0KK5QuSo2JQkBsR4aRlYac4lOYsGiAXAoVCuj0V44-YyvBCctGYX9nK7JGyUlzcM97-UWXtylQYx2GxhaYw1KtcvEevoAtavb0VC1RBfyBXMQkKNPIqt4Kj",
    slug: "brake-components",
  },
];

const more = [
  {
    titleKey: "catStructural" as const,
    descKey: "catStructuralDesc" as const,
    href: "/parts/structural-components" as const,
    image: "/images/products/sf-b-lonking-855.webp",
    slug: "structural-components",
  },
  {
    titleKey: "catChinese" as const,
    descKey: "catChineseDesc" as const,
    href: "/parts/chinese-brand-parts" as const,
    image: "/images/products/md-liugong-50c.webp",
    slug: "chinese-brand-parts",
  },
];

export async function HomeCategoryShowcase() {
  const t = await getTranslations("home");

  return (
    <section className="bg-surface-container-low px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <div className="mx-auto max-w-container-max">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">{t("matrix")}</h2>
          <Link
            href="/parts/transmission-systems"
            className="inline-flex items-center gap-1 text-technical-data tracking-wide text-primary uppercase hover:underline"
          >
            {t("matrixAll")}
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map((cat) => (
            <CategoryCard
              key={cat.slug}
              title={t(cat.titleKey)}
              desc={t(cat.descKey)}
              href={cat.href}
              image={cat.image}
              countLabel={t("catCount", { count: getProductsByCategory(cat.slug).length })}
              explore={t("catExplore")}
              inquire={t("catInquire")}
              inquiryType={inquiryTypeFromProduct(cat.slug)}
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {more.map((cat) => (
            <CategoryCard
              key={cat.slug}
              title={t(cat.titleKey)}
              desc={t(cat.descKey)}
              href={cat.href}
              image={cat.image}
              countLabel={t("catCount", { count: getProductsByCategory(cat.slug).length })}
              explore={t("catExplore")}
              inquire={t("catInquire")}
              inquiryType={inquiryTypeFromProduct(cat.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  title,
  desc,
  href,
  image,
  countLabel,
  explore,
  inquire,
  inquiryType,
}: {
  title: string;
  desc: string;
  href:
    | "/parts/transmission-systems"
    | "/parts/cooling-parts"
    | "/parts/brake-components"
    | "/parts/structural-components"
    | "/parts/chinese-brand-parts";
  image: string;
  countLabel: string;
  explore: string;
  inquire: string;
  inquiryType: string;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
      <div className="relative aspect-[4/3] bg-surface-container-lowest">
        <Image
          src={image}
          alt={title}
          fill
          quality={100}
          unoptimized
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute end-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold tracking-wide text-on-primary uppercase">
          {countLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="mb-2 text-headline-md text-on-surface">{title}</h3>
        <p className="mb-5 flex-1 text-body-sm text-on-surface-variant">{desc}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={href}
            className="inline-flex items-center justify-center gap-1 rounded bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container"
          >
            {explore}
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
          <Link
            href={`/contact?type=${inquiryType}`}
            className="inline-flex items-center justify-center rounded border border-outline px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            {inquire}
          </Link>
        </div>
      </div>
    </article>
  );
}
