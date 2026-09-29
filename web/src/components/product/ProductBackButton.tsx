"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { canGoBackInSite } from "@/lib/scroll-memory";
import { cn } from "@/lib/utils";

type Props = {
  fallbackHref: string;
  variant?: "text" | "icon";
  className?: string;
};

export function ProductBackButton({ fallbackHref, variant = "text", className }: Props) {
  const t = useTranslations("product");
  const router = useRouter();

  function onBack() {
    if (canGoBackInSite()) {
      window.history.back();
      return;
    }
    router.push(fallbackHref);
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onBack}
        aria-label={t("back")}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface",
          className,
        )}
      >
        <MaterialIcon name="arrow_back" className="text-[22px] rtl:-scale-x-100" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onBack}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-technical-data font-semibold text-on-surface hover:border-primary hover:text-primary",
        className,
      )}
    >
      <MaterialIcon name="arrow_back" className="text-[18px] rtl:-scale-x-100" />
      {t("back")}
    </button>
  );
}
