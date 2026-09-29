"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 3000;

export type HeroSlide = {
  src: string;
  alt: string;
  objectPosition?: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  children: React.ReactNode;
  prevLabel: string;
  nextLabel: string;
};

export function HeroCarousel({
  slides,
  children,
  prevLabel,
  nextLabel,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: number) => {
      setIndex((current) => (current + dir + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const timer = window.setInterval(() => go(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, go, slides.length]);

  return (
    <section
      className="relative h-[calc(100svh-7rem)] overflow-hidden bg-surface-container md:h-[calc(100svh-6.75rem)]"
      aria-roledescription="carousel"
      aria-label="Hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 z-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            fill
            priority={i === 0}
            quality={100}
            unoptimized
            className={cn("object-cover", slide.objectPosition ?? "object-[72%_center]")}
            sizes="100vw"
          />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/35 via-black/20 to-black/10 md:bg-gradient-to-r md:from-black/50 md:via-black/20 md:to-transparent" />

      <div className="absolute inset-0 z-10 flex items-center">
        {children}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={prevLabel}
            className="absolute top-1/2 start-3 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-white/30 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 md:flex"
          >
            <MaterialIcon name="chevron_left" className="text-2xl rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={nextLabel}
            className="absolute top-1/2 end-3 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-white/30 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 md:flex"
          >
            <MaterialIcon name="chevron_right" className="text-2xl rtl:-scale-x-100" />
          </button>
          <div
            className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-6"
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1} / ${slides.length}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-sm transition-all",
                  i === index ? "w-8 bg-primary-container" : "w-3 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
