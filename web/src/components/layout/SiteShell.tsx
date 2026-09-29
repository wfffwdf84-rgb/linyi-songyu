import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActions } from "@/components/layout/FloatingActions";

type SiteShellProps = {
  children: React.ReactNode;
  showFloatingActions?: boolean;
  hideFooter?: boolean;
  hideBottomNav?: boolean;
};

export function SiteShell({
  children,
  showFloatingActions = true,
  hideFooter = false,
  hideBottomNav = false,
}: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      {!hideFooter && <SiteFooter />}
      {!hideBottomNav && <BottomNav />}
      {showFloatingActions && <FloatingActions />}
    </div>
  );
}
