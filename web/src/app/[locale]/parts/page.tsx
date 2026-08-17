import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PartsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/parts/transmission-systems", locale });
}
