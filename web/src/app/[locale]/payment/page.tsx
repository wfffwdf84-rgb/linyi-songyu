import type { Metadata } from "next";
import { PolicyDoc, policyMetadata, policyStaticParams } from "@/components/layout/PolicyDoc";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return policyStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return policyMetadata(locale, "payment");
}

export default async function PaymentPolicyPage({ params }: Props) {
  const { locale } = await params;
  return <PolicyDoc locale={locale} slug="payment" />;
}
