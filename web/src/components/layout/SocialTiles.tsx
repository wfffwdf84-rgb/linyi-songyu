import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { siteConfig } from "@/lib/site";

const tileClass =
  "flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center gap-1.5 rounded border border-white/20 bg-white/5 text-white transition-colors hover:border-primary hover:bg-white/10";

export function SocialTiles() {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <a
        href={siteConfig.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={tileClass}
      >
        <WhatsAppIcon className="h-9 w-9" />
        <span className="text-xs font-medium">WhatsApp</span>
      </a>
      <a
        href={siteConfig.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={tileClass}
      >
        <FacebookIcon className="h-9 w-9" />
        <span className="text-xs font-medium">Facebook</span>
      </a>
      <a
        href={siteConfig.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className={tileClass}
      >
        <TikTokIcon className="h-9 w-9" />
        <span className="text-xs font-medium">TikTok</span>
      </a>
      <a
        href={siteConfig.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={tileClass}
      >
        <InstagramIcon className="h-9 w-9" />
        <span className="text-xs font-medium">Instagram</span>
      </a>
    </div>
  );
}
