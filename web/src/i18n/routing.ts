import { defineRouting } from "next-intl/routing";
import { appLocales, defaultLocale } from "@/lib/locales";

export const routing = defineRouting({
  locales: appLocales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});

export type AppLocale = (typeof routing.locales)[number];
