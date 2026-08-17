"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = [
    { href: "/", label: t("home"), icon: "home", match: (p: string) => p === "/" },
    {
      href: "/parts/transmission-systems",
      label: t("catalog"),
      icon: "settings_input_component",
      match: (p: string) => p.startsWith("/parts"),
    },
    {
      href: "/request-quote",
      label: t("quotes"),
      icon: "request_quote",
      match: (p: string) => p === "/request-quote",
    },
    {
      href: "/quality-logistics",
      label: t("inquiry"),
      icon: "contact_support",
      match: (p: string) => p === "/quality-logistics",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant bg-surface-container-highest px-4 pt-2 pb-4 lg:hidden">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex w-16 flex-col items-center justify-center rounded-xl p-1 transition-colors",
              active
                ? "scale-95 bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            <MaterialIcon name={item.icon} filled={active} className="text-[24px]" />
            <span className="mt-1 text-[10px] font-bold uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
