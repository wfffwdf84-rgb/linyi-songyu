import { randomUUID } from "node:crypto";
import { cache } from "react";
import {
  ANNOUNCEMENTS_MAX,
  AnnouncementError,
  parseAnnouncements,
  resolveAnnouncement,
  sanitizeAnnouncementPatch,
  sanitizeNewAnnouncement,
  sortAnnouncementsByNewest,
  type Announcement,
  type AnnouncementDocument,
} from "@/lib/announcement-rules";
import { readDocument, storageConfigured, writeDocument } from "@/lib/supabase";

/**
 * Storage for the site-wide announcement banner.
 *
 * The document is one plain-text row of `songyu_documents`, at the same
 * key-shaped pathname the blob store used. It carries no secrets, so unlike the
 * product overlay it is not encrypted; the only guard is the admin API that
 * writes it.
 *
 * Reading is fail-open by design: an unconfigured store, a network failure or a
 * corrupt body all mean "no banner", because a marketing strip must never be
 * able to 500 a product page. Writing is fail-closed: a document that could not
 * be read is never replaced with an empty one.
 */

/** Fixed key: the only copy, read as one row and overwritten in place. */
export const ANNOUNCEMENTS_PATH = "content/announcements.json";

/** Why the last public read produced its list; the panel shows it, visitors never do. */
export type AnnouncementReadStatus = "" | "not_configured" | "unreadable";

export * from "@/lib/announcement-rules";

/**
 * One read per render pass, shared by the layout and (in the panel) the list.
 * `cache()` is request-scoped, so a revalidated page re-reads the row; the
 * layout of a prerendered page reads it once at build and again whenever that
 * page is regenerated, which is what the API's revalidatePath() triggers.
 */
const readAnnouncementsCached = cache(
  async (): Promise<{ announcements: Announcement[]; status: AnnouncementReadStatus }> => {
    if (!storageConfigured()) return { announcements: [], status: "not_configured" };
    try {
      const body = await readDocument(ANNOUNCEMENTS_PATH);
      if (body === null) return { announcements: [], status: "" };
      return { announcements: parseAnnouncements(body), status: "" };
    } catch (error) {
      console.error("announcements could not be read; rendering without a banner", error);
      return { announcements: [], status: "unreadable" };
    }
  },
);

/** Fail-open list used by the public layout. */
export async function readAnnouncements(): Promise<Announcement[]> {
  return (await readAnnouncementsCached()).announcements;
}

/**
 * Same read with the outcome kept, for the panel: "storage is down" and "there
 * are no announcements" look identical from the fail-open side.
 */
export async function readAnnouncementsReport(): Promise<{
  announcements: Announcement[];
  status: AnnouncementReadStatus;
}> {
  return readAnnouncementsCached();
}

/* --------------------------------------------------------------- transport */

/**
 * Reads the current document before any mutation. A read that fails throws
 * instead of writing: saving one banner must never replace the other twenty-
 * nine with an empty document.
 */
async function readForWrite(): Promise<Announcement[]> {
  if (!storageConfigured()) throw new AnnouncementError("not_configured");
  try {
    const body = await readDocument(ANNOUNCEMENTS_PATH);
    return body === null ? [] : parseAnnouncements(body);
  } catch (error) {
    console.error("announcements could not be read before writing", error);
    throw new AnnouncementError("unavailable");
  }
}

async function writeAnnouncements(list: readonly Announcement[]): Promise<void> {
  if (!storageConfigured()) throw new AnnouncementError("not_configured");
  const document: AnnouncementDocument = {
    version: 1,
    updatedAt: new Date().toISOString(),
    // Stored newest first: the panel and the public pick both read it that way,
    // and it keeps a hand-edited body consistent with what was saved.
    announcements: sortAnnouncementsByNewest(list),
  };
  try {
    await writeDocument(ANNOUNCEMENTS_PATH, `${JSON.stringify(document, null, 2)}\n`);
  } catch (error) {
    console.error("announcements could not be written", error);
    throw new AnnouncementError("unavailable");
  }
}

/* -------------------------------------------------------------- public API */

export async function createAnnouncement(input: unknown): Promise<Announcement> {
  // Validate before touching storage: a malformed form never costs a read.
  const draft = sanitizeNewAnnouncement(input);
  const current = await readForWrite();
  if (current.length >= ANNOUNCEMENTS_MAX) {
    throw new AnnouncementError("too_many_announcements");
  }
  const now = new Date().toISOString();
  const created: Announcement = {
    id: randomUUID(),
    ...draft,
    createdAt: now,
    updatedAt: now,
  };
  await writeAnnouncements([...current, created]);
  return created;
}

export async function updateAnnouncement(id: string, input: unknown): Promise<Announcement> {
  const patch = sanitizeAnnouncementPatch(input);
  const current = await readForWrite();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) throw new AnnouncementError("not_found");

  // Merged against the stored record, then validated as a whole, so a partial
  // patch (the list's enable/disable button) cannot save an invalid banner.
  const next = resolveAnnouncement(current[index], patch);
  const updated: Announcement = {
    id,
    ...next,
    createdAt: current[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  const list = current.map((item, position) => (position === index ? updated : item));
  await writeAnnouncements(list);
  return updated;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const current = await readForWrite();
  if (!current.some((item) => item.id === id)) throw new AnnouncementError("not_found");
  await writeAnnouncements(current.filter((item) => item.id !== id));
}
