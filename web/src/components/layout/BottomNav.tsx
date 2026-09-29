"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = [
    { href: "/", label: t("home"), icon: "home", match: pathname === "/" },
    {
      href: "/parts/transmission-systems",
      label: t("products"),
      icon: "inventory_2",
      match: pathname.startsWith("/parts"),
    },
    {
      href: "/contact",
      label: t("rfq"),
      icon: "request_quote",
      match: false,
    },
    {
      href: "/contact",
      label: t("contact"),
      icon: "call",
      match: pathname === "/contact" || pathname === "/about",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant bg-surface-container-highest px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      {items.map((item) => {
        return (
          <Link
            key={`${item.href}-${item.icon}`}
            href={item.href}
            className={cn(
              "flex w-16 flex-col items-center justify-center rounded-xl p-1 transition-colors",
              item.match
                ? "scale-95 bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            <MaterialIcon name={item.icon} filled={item.match} className="text-[24px]" />
            <span className="mt-1 text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
