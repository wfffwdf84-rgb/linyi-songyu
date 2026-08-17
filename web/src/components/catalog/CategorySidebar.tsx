"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/data/categories";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { loc } from "@/lib/locale";
import { cn } from "@/lib/utils";

type CategorySidebarProps = {
  activeSlug: string;
};

export function CategorySidebar({ activeSlug }: CategorySidebarProps) {
  const locale = useLocale();
  const t = useTranslations("catalog");

  return (
    <aside className="fixed top-20 left-0 z-40 hidden h-[calc(100vh-80px)] w-80 flex-col rounded-r-xl border-r border-outline-variant bg-surface shadow-sm lg:flex">
      <div className="p-6">
        <h2 className="mb-6 text-headline-md text-primary">{t("categories")}</h2>
        <nav className="flex flex-col gap-2">
          {categories.map((cat) => {
            const active = cat.slug === activeSlug;
            return (
              <Link
                key={cat.slug}
                href={`/parts/${cat.slug}`}
                className={cn(
                  "flex items-center gap-3 rounded p-3 transition-colors",
                  active
                    ? "translate-x-1 bg-primary-container font-bold text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                <MaterialIcon name={cat.icon} />
                <span className="text-label-caps">
                  {loc(locale, cat.name.en, cat.name.zh)}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
