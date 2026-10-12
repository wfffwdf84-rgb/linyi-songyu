import { createCipheriv, createDecipheriv, hkdfSync, randomBytes, randomUUID } from "node:crypto";
import { list, put } from "@vercel/blob";

const PREFIX = "inquiries/";

export type InquiryItem = {
  partNumber: string;
  qty: number;
};

export type StoredInquiry = {
  id: string;
  receivedAt: string;
  locale: string;
  page: string;
  types: string[];
  urgent: boolean;
  company: string;
  contact: string;
  vin: string;
  brand: string;
  message: string;
  notes: string;
  photoName: string;
  items: InquiryItem[];
};

export function inquiryStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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
 * The Blob store backing this project is public, so a lead leaves the server
 * encrypted: iv | auth tag | ciphertext. Without the key from the environment
 * the object is unreadable, which keeps customer phone numbers safe even if a
 * blob URL leaks.
 */
function encrypt(value: unknown): Buffer {
  const key = encryptionKey();
  if (!key) throw new Error("inquiry encryption is not configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]);
}

function decrypt(payload: Buffer): StoredInquiry {
  const key = encryptionKey();
  if (!key) throw new Error("inquiry encryption is not configured");
  const decipher = createDecipheriv("aes-256-gcm", key, payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  const json = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  return JSON.parse(json) as StoredInquiry;
}

export async function saveInquiry(
  input: Omit<StoredInquiry, "id" | "receivedAt">,
): Promise<{ id: string; receivedAt: string }> {
  const id = randomUUID();
  const receivedAt = new Date().toISOString();
  const record: StoredInquiry = { id, receivedAt, ...input };
  const stamp = receivedAt.replace(/[:.]/g, "-");
  // A Buffer's ArrayBufferLike does not satisfy BlobPart, so copy into a plain view.
  const bytes = new Uint8Array(encrypt(record));
  await put(`${PREFIX}${stamp}-${id}.json`, new Blob([bytes]), {
    access: "public", // the object itself is ciphertext; the store is public
    contentType: "application/octet-stream",
    addRandomSuffix: false,
  });
  return { id, receivedAt };
}

export async function listInquiries(): Promise<StoredInquiry[]> {
  const { blobs } = await list({ prefix: PREFIX });
  const records: StoredInquiry[] = [];
  for (const blob of blobs) {
    try {
      const response = await fetch(blob.url, { cache: "no-store" });
      if (!response.ok) continue;
      records.push(decrypt(Buffer.from(await response.arrayBuffer())));
    } catch {
      // written under a different key, or a partial write: skip rather than fail
    }
  }
  return records.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/**
 * Watermark of the newest inquiry the operator has already looked at, kept
 * outside the inquiries/ prefix so listing leads never trips over it. It holds
 * only a timestamp, so it is stored unencrypted.
 */
const READ_STATE_PATH = "inquiry-state/read.json";

export async function inquiriesReadAt(): Promise<string> {
  try {
    const { blobs } = await list({ prefix: READ_STATE_PATH, limit: 1 });
    const found = blobs.find((blob) => blob.pathname === READ_STATE_PATH);
    if (!found) return "";
    const response = await fetch(found.url, { cache: "no-store" });
    if (!response.ok) return "";
    const data = (await response.json()) as { lastReadAt?: unknown };
    return typeof data.lastReadAt === "string" ? data.lastReadAt : "";
  } catch {
    return "";
  }
}

export async function markInquiriesRead(upTo: string) {
  await put(READ_STATE_PATH, JSON.stringify({ lastReadAt: upTo }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    // Blob caches for a month by default, which would serve a stale watermark.
    cacheControlMaxAge: 0,
  });
}
