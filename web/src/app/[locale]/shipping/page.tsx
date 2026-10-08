import type { Metadata } from "next";
import { PolicyDoc, policyMetadata, policyStaticParams } from "@/components/layout/PolicyDoc";
import { pageAlternates } from "@/lib/locales";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return policyStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...(await policyMetadata(locale, "shipping")),
    alternates: pageAlternates(locale, "/shipping"),
  };
}

export default async function ShippingPolicyPage({ params }: Props) {
  const { locale } = await params;
  return <PolicyDoc locale={locale} slug="shipping" />;
}
