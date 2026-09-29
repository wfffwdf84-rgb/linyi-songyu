import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string | string[] }>;
};

export default async function RequestQuotePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const type = Array.isArray(query.type) ? query.type.filter(Boolean).join(",") : query.type;
  const href = type ? `/contact?type=${encodeURIComponent(type)}` : "/contact";
  redirect({ href, locale });
}
