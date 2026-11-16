import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { AnnouncementStyle } from "@/lib/announcement-rules";
import { announcementIcon, announcementToneClass } from "@/lib/announcement-styles";
import { localePath, stripAnyLocalePrefix } from "@/lib/locales";
import { cn } from "@/lib/utils";

/**
 * The bar itself: markup only, no state. `AnnouncementBar` adds the dismissal
 * behaviour on top, and the panel reuses this exact component for its live
 * preview, so what an operator sees there is what a visitor gets.
 */

type AnnouncementBarViewProps = {
  style: AnnouncementStyle;
  text: string;
  href?: string;
  /** Locale of the page being rendered; resolves a site-relative href. */
  locale: string;
  dismissible: boolean;
  /** Omitted by the preview, which renders the ✕ as a non-interactive sample. */
  onDismiss?: () => void;
};

function resolveHref(href: string, locale: string) {
  if (href.startsWith("https://")) return { href, external: true as const };
  // A stored site path is resolved for the page the visitor is on, so a
  // `/parts` link clicked from `/zh/...` lands on `/zh/parts`. `stripAnyLocalePrefix`
  // first, otherwise an operator who pasted `/zh/parts` would get `/zh/zh/parts`.
  return {
    href: localePath(locale, stripAnyLocalePrefix(href)),
    external: false as const,
  };
}

export function AnnouncementBarView({
  style,
  text,
  href,
  locale,
  dismissible,
  onDismiss,
}: AnnouncementBarViewProps) {
  const link = href ? resolveHref(href, locale) : null;

  const content = (
    <span className="line-clamp-2 text-body-sm font-medium leading-5">{text}</span>
  );

  return (
    <div
      role="region"
      aria-label="公告 / Site announcement"
      data-announcement-bar={style}
      className={cn("w-full", announcementToneClass[style])}
    >
      <div className="mx-auto flex w-full max-w-container-max items-stretch gap-2 px-margin-mobile py-1.5 md:px-margin-desktop">
        <MaterialIcon
          name={announcementIcon[style]}
          className="mt-0.5 shrink-0 self-center text-[18px] md:mt-0"
        />
        {link ? (
          link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center hover:underline"
            >
              {content}
            </a>
          ) : (
            <Link href={link.href} className="flex min-w-0 flex-1 items-center hover:underline">
              {content}
            </Link>
          )
        ) : (
          <p className="flex min-w-0 flex-1 items-center">{content}</p>
        )}
        {dismissible ? (
          onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="关闭公告 / Close announcement"
              data-announcement-dismiss=""
              className="-me-1 flex shrink-0 items-center justify-center rounded p-1 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
            >
              <MaterialIcon name="close" className="text-[18px]" />
            </button>
          ) : (
            // Preview only: the same button shape, inert so it cannot be tabbed to.
            <span
              aria-hidden
              className="-me-1 flex shrink-0 items-center justify-center rounded p-1 opacity-60"
            >
              <MaterialIcon name="close" className="text-[18px]" />
            </span>
          )
        ) : null}
      </div>
    </div>
  );
}
