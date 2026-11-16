import type { AnnouncementStyle } from "@/lib/announcement-rules";

/**
 * The three presentation values of an announcement, kept in one place so the
 * public bar and the panel's live preview can never drift apart.
 *
 * The tones use the existing Material tokens: the brand brown for a plain
 * notice, the error container for something that needs attention, and the gold
 * primary container for a promotion (it reads as a sale without a new colour).
 */
export const announcementToneClass: Record<AnnouncementStyle, string> = {
  info: "bg-primary text-on-primary",
  warning: "bg-error-container text-on-error-container",
  promo: "bg-primary-container text-on-primary-container",
};

export const announcementIcon: Record<AnnouncementStyle, string> = {
  info: "campaign",
  warning: "warning",
  promo: "sell",
};

export const announcementStyleLabels: Record<AnnouncementStyle, string> = {
  info: "通知",
  warning: "警示",
  promo: "促销",
};

/** One-line description shown next to the style picker in the panel. */
export const announcementStyleHints: Record<AnnouncementStyle, string> = {
  info: "深色品牌底色，适合发货通知、新政策",
  warning: "浅红底色，适合放假、延期等需要留意的情况",
  promo: "金色底色，适合促销、展会、限时活动",
};
