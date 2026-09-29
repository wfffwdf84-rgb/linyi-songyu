import { cn } from "@/lib/utils";

export function addToQuoteButtonClass(kind: "primary" | "catalog" | "mobile") {
  return cn(
    "flex items-center justify-center gap-2 font-bold",
    kind === "catalog" &&
      "flex-1 rounded bg-primary py-2 text-[11px] text-on-primary hover:bg-surface-tint md:py-3 md:text-label-caps",
    kind === "primary" &&
      "w-full rounded-xl bg-primary-container py-4 text-headline-md text-on-primary-container shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:bg-[#e6a600]",
    kind === "mobile" &&
      "flex-[2] rounded-lg bg-primary-container py-3 text-[18px] text-headline-md text-on-primary-container",
  );
}
