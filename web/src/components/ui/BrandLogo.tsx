import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: { box: "h-9 w-9", px: 36 },
  md: { box: "h-12 w-12", px: 48 },
  lg: { box: "h-24 w-24", px: 96 },
} as const;

export function BrandLogo({ size = "md", className, priority = false }: Props) {
  const spec = sizes[size];
  return (
    <Image
      src={siteConfig.logo}
      alt=""
      width={spec.px}
      height={spec.px}
      priority={priority}
      className={cn("shrink-0 rounded-full object-cover", spec.box, className)}
    />
  );
}
