"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FactoryVideoPlayer } from "@/components/home/FactoryVideoPlayer";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";
import { displayFactoryVideoTitle, isPlayableFactoryVideoUrl, type FactoryVideo } from "@/lib/factory-videos";

export function HomeFactoryVideo() {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement>(null);
  const [videos, setVideos] = useState<FactoryVideo[] | null>(null);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/factory-videos", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { videos?: FactoryVideo[] }) => {
        if (cancelled) return;
        const list = (Array.isArray(data.videos) ? data.videos : []).filter((item) =>
          isPlayableFactoryVideoUrl(item.url),
        );
        setVideos(list);
        setIndex(0);
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [videos]);

  const count = videos?.length ?? 0;

  const go = useCallback(
    (dir: number) => {
      if (count < 2) return;
      setIndex((current) => (current + dir + count) % count);
    },
    [count],
  );

  if (!videos || videos.length === 0) return null;

  const current = videos[Math.min(index, videos.length - 1)];
  const showControls = videos.length > 1;

  return (
    <section ref={sectionRef} className="bg-on-secondary-fixed px-margin-mobile py-8 md:px-margin-desktop md:py-10">
      <div className="mx-auto max-w-container-max">
        <p className="mb-4 text-body-sm text-secondary-fixed-dim">{t("factoryVideoLead")}</p>
        <figure className="overflow-hidden rounded border border-white/10 bg-black shadow-sm">
          <div className="relative">
            <FactoryVideoPlayer
              video={current}
              autoPlay={inView}
              loop={videos.length === 1}
              onEnded={() => go(1)}
            />
            {showControls ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t("factoryVideoPrev")}
                  className="absolute top-1/2 start-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-white/30 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
                >
                  <MaterialIcon name="chevron_left" className="text-2xl rtl:-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t("factoryVideoNext")}
                  className="absolute top-1/2 end-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-white/30 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
                >
                  <MaterialIcon name="chevron_right" className="text-2xl rtl:-scale-x-100" />
                </button>
                <div
                  className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2"
                  role="tablist"
                  aria-label={t("factoryVideoSlides")}
                >
                  {videos.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`${i + 1} / ${videos.length}`}
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
          </div>
          <figcaption className="border-t border-white/10 px-4 py-3 text-technical-data text-white">
            {displayFactoryVideoTitle(current.title, t("factoryVideoTitle"))}
            {showControls ? (
              <span className="ms-2 text-white/50">
                {index + 1} / {videos.length}
              </span>
            ) : null}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
