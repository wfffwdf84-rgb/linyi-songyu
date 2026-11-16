import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
  /**
   * The logo file to draw. Server shells pass the replaceable slot value here;
   * omitting it keeps the shipped file, which is what the metadata and the
   * structured data use. Client components must not import the storage layer,
   * so the value always arrives as a prop.
   */
  src?: string;
};

const sizes = {
  sm: { box: "h-9 w-9", px: 36 },
  md: { box: "h-12 w-12", px: 48 },
  lg: { box: "h-24 w-24", px: 96 },
} as const;

export function BrandLogo({ size = "md", className, priority = false, src }: Props) {
  const spec = sizes[size];
  return (
    <Image
      src={src || siteConfig.logo}
      alt=""
      width={spec.px}
      height={spec.px}
      priority={priority}
      className={cn("shrink-0 rounded-full object-cover", spec.box, className)}
    />
  );
}
