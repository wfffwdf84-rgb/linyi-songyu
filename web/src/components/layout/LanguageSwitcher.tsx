"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { appLocales, localeNames, type AppLocale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  compact?: boolean;
  tone?: "light" | "dark";
};

export function LanguageSwitcher({ compact, tone = "light" }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dark = tone === "dark";

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function switchLocale(next: AppLocale) {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Language"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex items-center gap-1 rounded border text-label-caps",
          compact ? "px-2 py-1" : "px-3 py-2",
          dark
            ? "border-white/20 text-white/90 hover:bg-white/10"
            : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high",
        )}
      >
        {localeNames[locale] ?? locale.toUpperCase()}
        <MaterialIcon name="expand_more" className="text-[16px]" />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-1 max-h-72 w-44 overflow-y-auto rounded border border-outline-variant bg-surface py-1 shadow-lg"
        >
          {appLocales.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={item === locale}
                onClick={() => switchLocale(item)}
                className={cn(
                  "flex w-full px-3 py-2 text-start text-sm",
                  item === locale
                    ? "bg-primary-container/30 font-bold text-primary"
                    : "text-on-surface hover:bg-surface-container-high",
                )}
              >
                {localeNames[item]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
