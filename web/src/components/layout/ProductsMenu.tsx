"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { categories } from "@/lib/data/categories";
import { loc } from "@/lib/locale";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";
import { tr } from "@/lib/translated";

export function ProductsMenu() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const active = pathname.startsWith("/parts");
  const [openSub, setOpenSub] = useState<string | null>(null);

  return (
    <div className="group relative" onMouseLeave={() => setOpenSub(null)}>
      <Link
        href="/parts/transmission-systems"
        className={cn(
          "inline-flex items-center gap-0.5 border-b-2 py-1 text-[13px] font-medium tracking-wide transition-colors lg:text-sm",
          active
            ? "border-primary font-bold text-primary"
            : "border-transparent text-on-surface-variant hover:text-primary",
        )}
      >
        {t("products")}
        <MaterialIcon name="expand_more" className="text-[18px]" />
      </Link>
      <div className="invisible absolute top-full start-0 z-50 min-w-64 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded border border-outline-variant bg-surface py-2 shadow-lg">
          <Link
            href="/parts/transmission-systems"
            className="block px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-high hover:text-primary"
          >
            {t("allProducts")}
          </Link>
          {categories.map((category) => (
            <div key={category.slug}>
              <div
                className={cn(
                  "flex items-center text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary",
                  pathname.startsWith(`/parts/${category.slug}`) && "bg-primary-container/20 font-bold text-primary",
                )}
              >
                <Link
                  href={`/parts/${category.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2"
                >
                  <MaterialIcon name={category.icon} className="text-[18px]" />
                  <span>{tr(locale, category.name.en, category.name.zh)}</span>
                </Link>
                {category.brands?.length ? (
                  <button
                    type="button"
                    aria-expanded={openSub === category.slug}
                    className="flex h-9 w-9 shrink-0 items-center justify-center"
                    onClick={() =>
                      setOpenSub((current) => (current === category.slug ? null : category.slug))
                    }
                  >
                    <MaterialIcon
                      name={openSub === category.slug ? "expand_less" : "expand_more"}
                      className="text-[18px]"
                    />
                  </button>
                ) : null}
              </div>
              {openSub === category.slug
                ? category.brands?.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/parts/${category.slug}?brand=${brand.id}`}
                      className="block px-4 py-1.5 ps-10 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                    >
                      {loc(locale, brand.en, brand.zh)}
                    </Link>
                  ))
                : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
