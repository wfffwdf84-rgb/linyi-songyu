import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActions } from "@/components/layout/FloatingActions";

type SiteShellProps = {
  children: React.ReactNode;
  showFloatingActions?: boolean;
  hideFooter?: boolean;
};

export function SiteShell({
  children,
  showFloatingActions = true,
  hideFooter = false,
}: SiteShellProps) {
  return (
    <>
      <SiteHeader />
      {children}
      {!hideFooter && <SiteFooter />}
      <BottomNav />
      {showFloatingActions && <FloatingActions />}
    </>
  );
}
