"use client";

import { useCallback, useSyncExternalStore } from "react";
import { AnnouncementBarView } from "@/components/layout/AnnouncementBarView";
import {
  announcementDismissKey,
  announcementLocaleText,
  announcementWindowState,
  type Announcement,
} from "@/lib/announcement-rules";

/**
 * The public banner. The server picks the announcement and renders the bar, so
 * there is no layout shift and no request of its own; this wrapper only decides
 * whether the visitor already closed it.
 *
 * Two client-only rules live here:
 * - `dismissed:<id>` in localStorage hides a dismissible banner for good;
 * - an expired window hides it even when the prerendered HTML still contains it
 *   (a static page is only rebuilt when an operator saves or the deployment
 *   regenerates it, and an expiry time has no save event of its own).
 *
 * Both are read through useSyncExternalStore rather than a mount effect: the
 * server snapshot is "visible" (it matches the HTML the server produced) and
 * the client snapshot is the visitor's own answer, which is exactly the
 * hydration-safe shape React asks for.
 */

/** Dismissed in this tab, kept even when localStorage refuses writes. */
const dismissedInMemory = new Set<string>();

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Honour a dismissal made in another tab of the same browser.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notifyDismissed() {
  for (const listener of listeners) listener();
}

/**
 * The client clock, captured once when the bundle loads. A static page can be
 * older than an announcement's `endAt`, and comparing against load time rather
 * than against render time keeps the snapshot stable - React calls the snapshot
 * function more than once per render and expects the same answer.
 */
const clientNow = Date.now();

function isVisible(announcement: Announcement) {
  if (announcementWindowState(announcement, clientNow) === "expired") return false;
  if (dismissedInMemory.has(announcement.id)) return false;
  if (!announcement.dismissible) return true;
  try {
    return window.localStorage.getItem(announcementDismissKey(announcement.id)) !== "1";
  } catch {
    // Private mode or blocked cookies: show the banner rather than hide it.
    return true;
  }
}

export function AnnouncementBar({ announcement, locale }: { announcement: Announcement; locale: string }) {
  const visible = useSyncExternalStore(
    subscribe,
    useCallback(() => isVisible(announcement), [announcement]),
    () => true,
  );

  const dismiss = useCallback(() => {
    dismissedInMemory.add(announcement.id);
    try {
      window.localStorage.setItem(announcementDismissKey(announcement.id), "1");
    } catch {
      // Best effort: the in-memory set keeps it closed for this page view.
    }
    notifyDismissed();
  }, [announcement.id]);

  if (!visible) return null;

  return (
    <AnnouncementBarView
      style={announcement.style}
      text={announcementLocaleText(announcement.text, locale)}
      href={announcement.href}
      locale={locale}
      dismissible={announcement.dismissible}
      onDismiss={announcement.dismissible ? dismiss : undefined}
    />
  );
}
