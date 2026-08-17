import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: isZh
        ? "临沂松宇国际贸易有限公司 | OEM 工程机械配件供应商"
        : `${siteConfig.name} | OEM Spare Parts Supplier`,
      template: isZh ? `%s | 临沂松宇` : `%s | Linyi Songyu`,
    },
    description: isZh
      ? "OEM 兼容重型机械配件供应商。变速箱总成、制动件、润滑设备，临沂仓 24-48 小时发货。"
      : siteConfig.description,
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      siteName: siteConfig.shortName,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    alternates: {
      languages: {
        en: "/",
        "zh-CN": "/zh",
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${inter.variable} ${ibmPlexSans.variable} h-full ${locale === "zh" ? "font-zh" : ""}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-background antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
