import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getHomeFeaturedProducts } from "@/lib/data/products";
import type { Product } from "@/lib/data/products";

type FeaturedGroupProps = {
  title: string;
  href: "/parts/brake-components" | "/parts/cooling-parts";
  moreLabel: string;
  products: Product[];
};

function FeaturedGroup({ title, href, moreLabel, products }: FeaturedGroupProps) {
  if (products.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-headline-md text-on-surface">{title}</h3>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-technical-data tracking-wide text-primary uppercase hover:underline"
        >
          {moreLabel}
          <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}

export async function HomeFeaturedProducts() {
  const t = await getTranslations("home");
  const { brakeDiscs, radiators } = getHomeFeaturedProducts();

  return (
    <section className="bg-surface px-margin-mobile py-8 md:px-margin-desktop md:py-16">
      <div className="mx-auto max-w-container-max">
        <h2 className="mb-6 border-s-4 border-primary ps-4 text-headline-lg-mobile text-on-surface md:mb-10 md:text-headline-lg">
          {t("featuredTitle")}
        </h2>
        <div className="space-y-12">
          <FeaturedGroup
            title={t("featuredBrake")}
            href="/parts/brake-components"
            moreLabel={t("featuredMore")}
            products={brakeDiscs}
          />
          <FeaturedGroup
            title={t("featuredRadiator")}
            href="/parts/cooling-parts"
            moreLabel={t("featuredMore")}
            products={radiators}
          />
        </div>
      </div>
    </section>
  );
}
