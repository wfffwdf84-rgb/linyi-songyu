import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { siteConfig } from "@/lib/site";

export function FloatingActions() {
  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-4 md:bottom-8">
      <Link
        href="/request-quote"
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-surface-container-highest text-primary shadow-lg hover:bg-surface-container-high"
        aria-label="Request quote"
      >
        <MaterialIcon name="request_quote" className="text-2xl" />
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-[10px] font-bold text-on-error">
          3
        </span>
      </Link>
      <a
        href={siteConfig.whatsapp}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1EBE5A]"
        aria-label="WhatsApp chat"
      >
        <MaterialIcon name="forum" filled className="text-2xl" />
      </a>
    </div>
  );
}
