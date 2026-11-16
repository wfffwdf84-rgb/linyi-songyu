import { createCipheriv, createDecipheriv, hkdfSync, randomBytes, randomUUID } from "node:crypto";
import {
  deleteDocument,
  listDocumentKeys,
  readDocument,
  readDocuments,
  storageConfigured,
  storageUnavailable,
  writeDocument,
} from "@/lib/supabase";

/** Keys under this prefix are the leads themselves; see inquiryPath(). */
const PREFIX = "inquiries/";

export type InquiryItem = {
  partNumber: string;
  qty: number;
};

/** Which form on the site produced the lead. Older records have no value. */
export type InquiryForm = "quote" | "messagebox";

export type StoredInquiry = {
  id: string;
  receivedAt: string;
  locale: string;
  page: string;
  /**
   * Origin form. Optional because every lead stored before this field existed
   * is a quote form and must keep reading back unchanged.
   */
  form?: InquiryForm;
  types: string[];
  urgent: boolean;
  company: string;
  contact: string;
  /**
   * Optional reply-to address. Leads stored before this field existed simply
   * have no key, so every reader must treat it as possibly undefined.
   */
  email?: string;
  vin: string;
  brand: string;
  message: string;
  /** Chinese rendering of message/notes, filled in after the lead is stored. */
  messageZh?: string;
  notesZh?: string;
  notes: string;
  photoName: string;
  /** Country/city/time zone Vercel derived from the visitor's IP. */
  ipCountry?: string;
  ipCity?: string;
  ipTimezone?: string;
  items: InquiryItem[];
};

export function inquiryStorageConfigured() {
  return storageConfigured();
}

/**
 * True when the write failed because the document store itself is unavailable -
 * missing credentials, unreachable, rate-limited or down - rather than because
 * the request was bad. The API turns this into `storage_unavailable`, which the
 * form uses to offer the WhatsApp/email hand-off instead of a dead end.
 */
export function inquiryStorageUnavailable(error: unknown): boolean {
  return storageUnavailable(error);
}

function encryptionKey(): Buffer | null {
  const secret =
    process.env.INQUIRY_ENCRYPTION_KEY?.trim() ||
    process.env.FACTORY_VIDEO_PASSWORD?.trim() ||
    "";
  if (secret.length < 8) return null;
  return Buffer.from(hkdfSync("sha256", secret, "songyu-inquiry-salt", "inquiry-v1", 32));
}

/**
 * A lead leaves the server encrypted: iv | auth tag | ciphertext. Without the
 * key from the environment the body is unreadable, which keeps customer phone
 * numbers safe even if the database row leaks. The encrypted bytes are stored
 * base64-encoded because the document body is a text column.
 */
function encrypt(value: unknown): string {
  const key = encryptionKey();
  if (!key) throw new Error("inquiry encryption is not configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

function decrypt(body: string): StoredInquiry {
  const key = encryptionKey();
  if (!key) throw new Error("inquiry encryption is not configured");
  const payload = Buffer.from(body, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  const json = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  return JSON.parse(json) as StoredInquiry;
}

/** The document key of one lead. Unchanged from the Blob pathname it replaces. */
export function inquiryPath(receivedAt: string, id: string) {
  return `${PREFIX}${receivedAt.replace(/[:.]/g, "-")}-${id}.json`;
}

export async function saveInquiry(
  input: Omit<StoredInquiry, "id" | "receivedAt">,
): Promise<{ id: string; receivedAt: string; record: StoredInquiry }> {
  const id = randomUUID();
  const receivedAt = new Date().toISOString();
  const record: StoredInquiry = { id, receivedAt, ...input };
  await writeDocument(inquiryPath(receivedAt, id), encrypt(record));
  return { id, receivedAt, record };
}

/** Overwrites a stored lead in place, used to attach its Chinese rendering. */
export async function rewriteInquiry(record: StoredInquiry) {
  await writeDocument(inquiryPath(record.receivedAt, record.id), encrypt(record));
}

/** Removes one lead. The key embeds receivedAt, so both fields are required. */
export async function removeInquiry(receivedAt: string, id: string) {
  await deleteDocument(inquiryPath(receivedAt, id));
}

/**
 * Every lead, newest first.
 *
 * One query lists the keys and then bodies are fetched in batches: the inbox is
 * read on every panel visit, so it must not turn into one request per lead. A
 * body that is unreadable (written under a rotated key, or half written) is
 * skipped rather than failing the list.
 */
export async function listInquiries(): Promise<StoredInquiry[]> {
  const keys = await listDocumentKeys(PREFIX);
  if (keys.length === 0) return [];
  const bodies = await readDocuments(keys);
  const records: StoredInquiry[] = [];
  for (const key of keys) {
    const body = bodies.get(key);
    if (!body) continue;
    try {
      records.push(decrypt(body));
    } catch {
      // written under a different key, or a partial write: skip rather than fail
    }
  }
  return records.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/**
 * Watermark of the newest inquiry the operator has already looked at, kept
 * outside the inquiries/ prefix so listing leads never trips over it. It holds
 * only a timestamp, so it is stored unencrypted as plain JSON.
 */
const READ_STATE_PATH = "inquiry-state/read.json";

export async function inquiriesReadAt(): Promise<string> {
  try {
    const body = await readDocument(READ_STATE_PATH);
    if (!body) return "";
    const data = JSON.parse(body) as { lastReadAt?: unknown };
    return typeof data.lastReadAt === "string" ? data.lastReadAt : "";
  } catch {
    return "";
  }
}

export async function markInquiriesRead(upTo: string) {
  await writeDocument(READ_STATE_PATH, JSON.stringify({ lastReadAt: upTo }));
}
