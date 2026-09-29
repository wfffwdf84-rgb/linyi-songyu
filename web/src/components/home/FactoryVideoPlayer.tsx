"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { factoryVideoPreviewSrc, type FactoryVideo } from "@/lib/factory-videos";

type Props = {
  video: FactoryVideo;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  onEnded?: () => void;
};

export function FactoryVideoPlayer({ video, className = "", autoPlay = false, loop = false, onEnded }: Props) {
  const t = useTranslations("home");
  const playerRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setReady(false);
    setFailed(false);
    const timer = window.setTimeout(() => setFailed(true), 12000);
    return () => window.clearTimeout(timer);
  }, [video.url]);

  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    if (!autoPlay) {
      el.pause();
      return;
    }
    el.muted = true;
    setMuted(true);
    const start = () => {
      void el.play().catch(() => {
        el.muted = true;
        void el.play().catch(() => undefined);
      });
    };
    if (el.readyState >= 2) start();
    else el.addEventListener("canplay", start, { once: true });
    return () => el.removeEventListener("canplay", start);
  }, [video.url, autoPlay]);

  function showFrame(el: HTMLVideoElement) {
    setReady(true);
    setFailed(false);
    if (autoPlay) return;
    if (el.duration > 1.5 && el.currentTime < 0.2) {
      el.currentTime = Math.min(1, el.duration * 0.12);
    }
  }

  function unmute() {
    const el = playerRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1;
    setMuted(false);
    void el.play().catch(() => undefined);
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
      <video
        ref={playerRef}
        key={video.url}
        src={autoPlay ? video.url.split("#")[0] : factoryVideoPreviewSrc(video.url)}
        controls
        playsInline
        muted={muted}
        loop={loop}
        autoPlay={autoPlay}
        preload="auto"
        className="h-full w-full object-contain"
        onLoadedData={(e) => showFrame(e.currentTarget)}
        onCanPlay={(e) => showFrame(e.currentTarget)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted || e.currentTarget.volume === 0)}
        onError={() => setFailed(true)}
        onEnded={onEnded}
      />
      {autoPlay && muted && ready ? (
        <button
          type="button"
          onClick={unmute}
          className="absolute bottom-14 start-3 z-20 rounded bg-black/55 px-3 py-2 text-technical-data text-white backdrop-blur-sm hover:bg-black/70"
        >
          {t("factoryVideoUnmute")}
        </button>
      ) : null}
      {failed && !ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/85 p-6 text-center">
          <p className="max-w-md text-body-sm text-secondary-fixed-dim">{t("factoryVideoError")}</p>
        </div>
      ) : null}
    </div>
  );
}
