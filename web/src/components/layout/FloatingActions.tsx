import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { siteConfig } from "@/lib/site";

export async function FloatingActions() {
  const t = await getTranslations("nav");

  return (
    <div className="fixed end-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 flex flex-col gap-2 md:end-4 md:bottom-8 md:gap-3">
      <Link
        href="/contact"
        className="hidden h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-surface-container-highest text-primary shadow-lg hover:bg-surface-container-high md:flex"
        aria-label={t("rfq")}
      >
        <MaterialIcon name="request_quote" className="text-2xl" />
      </Link>
      <a
        href={siteConfig.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:brightness-110 md:h-14 md:w-14"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon className="h-6 w-6 md:h-8 md:w-8" />
      </a>
    </div>
  );
}
