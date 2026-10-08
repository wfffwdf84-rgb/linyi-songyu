import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { pageAlternates } from "@/lib/locales";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: pageAlternates(locale, "/request-quote"),
  };
}

export default async function RequestQuotePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const type = Array.isArray(query.type) ? query.type.filter(Boolean).join(",") : query.type;
  const href = type ? `/contact?type=${encodeURIComponent(type)}` : "/contact";
  redirect({ href, locale });
}
