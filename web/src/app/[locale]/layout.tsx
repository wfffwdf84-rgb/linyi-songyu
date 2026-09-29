import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";
import {
  isAppLocale,
  languageAlternateHrefs,
  localeFontClass,
  localeHtmlLang,
  localeOg,
  rtlLocales,
} from "@/lib/locales";
import { QuoteListProvider } from "@/components/quote/QuoteListProvider";
import { ScrollMemory } from "@/components/layout/ScrollMemory";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-ibm-plex",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const isZh = locale === "zh";
  const ogLocale = isAppLocale(locale) ? localeOg[locale] : "en_US";

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    icons: {
      icon: siteConfig.logo,
      apple: siteConfig.logo,
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: isZh ? siteConfig.shortNameZh : siteConfig.shortName,
      title: isZh ? siteConfig.nameZh : siteConfig.name,
      description: t("description"),
      images: [{ url: siteConfig.logo, alt: isZh ? siteConfig.shortNameZh : siteConfig.shortName }],
    },
    alternates: {
      languages: languageAlternateHrefs("/"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const htmlLang = isAppLocale(locale) ? localeHtmlLang[locale] : "en";
  const dir = rtlLocales.has(locale) ? "rtl" : "ltr";
  const fontClass = localeFontClass(locale);

  return (
    <html
      lang={htmlLang}
      dir={dir}
      className={`${inter.variable} ${ibmPlexSans.variable} h-full ${fontClass}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-background antialiased">
        <NextIntlClientProvider messages={messages}>
          <QuoteListProvider>
            <ScrollMemory />
            {children}
          </QuoteListProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
