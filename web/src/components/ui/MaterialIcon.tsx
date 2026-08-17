import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  filled?: boolean;
  className?: string;
};

export function MaterialIcon({ name, filled, className }: MaterialIconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined",
        filled && "fill",
        className,
      )}
      aria-hidden
    >
      {name}
    </span>
  );
}
