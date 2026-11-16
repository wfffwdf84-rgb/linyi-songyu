import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { readSiteImages } from "@/lib/site-images";
import { siteImageFrom } from "@/lib/site-image-slots";

type SiteShellProps = {
  children: React.ReactNode;
  showFloatingActions?: boolean;
  hideFooter?: boolean;
  hideBottomNav?: boolean;
};

/**
 * The chrome every public page shares. The replaceable logo is read here rather
 * than inside the header: `SiteHeader` and `SiteFooter` are client components, so
 * the value has to cross the server/client boundary as a prop.
 */
export async function SiteShell({
  children,
  showFloatingActions = true,
  hideFooter = false,
  hideBottomNav = false,
}: SiteShellProps) {
  const logo = await readSiteImages().then((images) => siteImageFrom(images, "site.logo"));
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader logo={logo} />
      <div className="flex-1">{children}</div>
      {!hideFooter && <SiteFooter logo={logo} />}
      {!hideBottomNav && <BottomNav />}
      {showFloatingActions && <FloatingActions />}
    </div>
  );
}
