import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { readDocument, storageConfigured, writeDocument } from "@/lib/supabase";

/** Separate from the factory session, so signing in to one does not open the other. */
export const ADMIN_COOKIE = "songyu_admin";

/**
 * One encrypted document holds every operator account. This fixed pathname is
 * both the only copy and the only read: it is one row of `songyu_documents`,
 * read and replaced in place. Snapshots were removed when the store's list()
 * traffic exhausted the Vercel Blob quota, and the move to Supabase keeps that
 * rule: one key, one row, no copies.
 */
export const ADMIN_USERS_PATH = "admin/users.json";

/** Username the first login seeds the owner account with. */
export const ADMIN_BOOTSTRAP_USERNAME = "admin";

const SESSION_TTL_SEC = 60 * 60 * 12;
const SCRYPT_KEYLEN = 64;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
// Chinese names are what the team actually types, so Han characters are allowed.
// Two characters is the minimum because 张三 and 李四 are ordinary full names,
// and the password - not the username - is what protects the account.
const USERNAME_PATTERN = /^[\p{Script=Han}a-z0-9][\p{Script=Han}a-z0-9._-]{1,31}$/u;
const NAME_MAX = 40;

export const adminRoles = ["owner", "editor", "sales"] as const;

export type AdminRole = (typeof adminRoles)[number];

export const adminRoleLabels: Record<AdminRole, string> = {
  owner: "所有者",
  editor: "运营",
  sales: "业务员",
};

export type AdminUser = {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  salt: string;
  createdAt: string;
  disabled?: boolean;
};

/** The public shape of an account: hashes and salts never leave the server. */
export type AdminUserView = Pick<AdminUser, "id" | "username" | "name" | "role" | "createdAt" | "disabled">;

export type AdminSession = {
  userId: string;
  role: AdminRole;
  /** Unix seconds. */
  exp: number;
  /** Display name, filled in by getAdminSession; never part of the cookie. */
  name?: string;
};

/** Raised for request-level problems; the code becomes the API error string. */
export class AdminAuthError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "AdminAuthError";
  }
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (adminRoles as readonly string[]).includes(value);
}

/**
 * Signing key for the session cookie, and - through HKDF - the key that
 * encrypts the account document. The factory password is the fallback, the
 * same way inquiry encryption and the factory session already behave.
 */
function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.FACTORY_VIDEO_PASSWORD?.trim() ||
    ""
  );
}

/**
 * The password that seeds the first owner while no account list exists.
 *
 * It must stay something an operator can type, so it falls back to the factory
 * password and never to the session secret: once ADMIN_SESSION_SECRET is a
 * random 64-character value, deriving the bootstrap password from it would lock
 * everyone out of their own panel.
 */
function bootstrapPassword() {
  return (
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.FACTORY_VIDEO_PASSWORD?.trim() ||
    ""
  );
}

export function adminStorageConfigured() {
  return storageConfigured();
}

export function adminAuthConfigured() {
  return sessionSecret().length >= 8 && adminStorageConfigured();
}

function encryptionKey(): Buffer {
  const secret = sessionSecret();
  if (secret.length < 8) throw new AdminAuthError("not_configured");
  return Buffer.from(hkdfSync("sha256", secret, "songyu-admin-salt", "admin-users-v1", 32));
}

/**
 * The account document is ciphertext: iv | auth tag | ciphertext, base64-encoded
 * into the text body of its row. Only the deployment secret can read it, which
 * keeps password hashes and salts out of any database export.
 */
function encode(users: AdminUser[]) {
  const key = encryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify({ users }), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

function decode(payload: Buffer): AdminUser[] {
  const key = encryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  const json = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  const data = JSON.parse(json) as { users?: unknown };
  if (!Array.isArray(data.users)) throw new Error("admin accounts are malformed");
  // A role that no longer exists falls back to the least privilege, never higher.
  return (data.users as AdminUser[]).map((user) => ({
    ...user,
    role: isAdminRole(user.role) ? user.role : "sales",
  }));
}

/**
 * Returns null only when no account document exists yet, which is what lets the
 * first login seed an owner. A document that exists but cannot be read or
 * decrypted throws instead: silently falling back to bootstrap would overwrite
 * every account after a secret rotation.
 *
 * One row read, straight after the write, so a just-created account is visible
 * at once: there is no CDN in front of the table to serve a stale copy.
 */
async function readUsers(): Promise<AdminUser[] | null> {
  const body = await readDocument(ADMIN_USERS_PATH);
  if (body === null) return null;
  return decode(Buffer.from(body, "base64"));
}

async function writeUsers(users: AdminUser[]) {
  await writeDocument(ADMIN_USERS_PATH, encode(users));
}

/**
 * Read, change, write the whole document; the account list is the only object
 * this panel rewrites, and it is small enough to replace wholesale.
 *
 * A read that fails must not be treated as an empty list: that would let a
 * bootstrap or a rename replace every account. It surfaces as `unavailable`
 * instead, which the admin API answers with 503.
 */
async function mutateUsers(apply: (users: AdminUser[]) => AdminUser[]): Promise<AdminUser[]> {
  let current: AdminUser[] | null;
  try {
    current = await readUsers();
  } catch (error) {
    console.error("admin accounts could not be read before writing", error);
    throw new AdminAuthError("unavailable");
  }
  const next = apply(current ?? []);
  await writeUsers(next);
  return next;
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
}

function newSalt() {
  return randomBytes(16).toString("hex");
}

function passwordMatches(user: AdminUser, password: string) {
  const expected = Buffer.from(user.passwordHash, "hex");
  if (expected.length === 0) return false;
  const actual = scryptSync(password, user.salt, expected.length);
  return timingSafeEqual(expected, actual);
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function toView(user: AdminUser): AdminUserView {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    disabled: Boolean(user.disabled),
  };
}

export function normalizeUsername(value: unknown) {
  // NFKC folds the full-width forms a Chinese IME produces (ＡＢＣ / １) onto the
  // plain ones, so a name typed on two machines still matches one account.
  return typeof value === "string" ? value.normalize("NFKC").trim().toLowerCase() : "";
}

export function normalizeAdminName(value: unknown, fallback: string) {
  const name =
    typeof value === "string" ? value.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, NAME_MAX) : "";
  return name || fallback;
}

export function isValidAdminUsername(value: string) {
  return USERNAME_PATTERN.test(value);
}

export function isValidAdminPassword(value: string) {
  return value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX;
}

/* ------------------------------------------------------------------ sessions */

function hmac(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function cookieSecurity(maxAge: number) {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** 12-hour signed cookie: payload { userId, role, exp } plus its HMAC. */
export function createSessionCookie(userId: string, role: AdminRole): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const payload = Buffer.from(JSON.stringify({ userId, role, exp }), "utf8").toString("base64url");
  return `${ADMIN_COOKIE}=${payload}.${hmac(payload)}; ${cookieSecurity(SESSION_TTL_SEC)}`;
}

export function clearSessionCookie(): string {
  return `${ADMIN_COOKIE}=; ${cookieSecurity(0)}`;
}

/** Verifies the signature and the expiry, without touching the database. */
export function readAdminSession(token: string | undefined | null): AdminSession | null {
  if (!token || !adminAuthConfigured()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, hmac(payload))) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const { userId, role, exp } = parsed as Record<string, unknown>;
  if (typeof userId !== "string" || !userId) return null;
  if (!isAdminRole(role)) return null;
  if (typeof exp !== "number" || !Number.isFinite(exp) || exp * 1000 <= Date.now()) return null;
  return { userId, role, exp };
}

/**
 * Reads the session cookie and then re-checks the account in the database, so a
 * disabled account or a changed role takes effect at once instead of when the
 * cookie happens to expire. Fails closed when the account list is unreadable.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const session = readAdminSession(jar.get(ADMIN_COOKIE)?.value);
  if (!session) return null;
  try {
    const users = await readUsers();
    const user = users?.find((item) => item.id === session.userId);
    if (!user || user.disabled) return null;
    return { userId: user.id, role: user.role, exp: session.exp, name: user.name };
  } catch (error) {
    console.error("admin session lookup failed", error);
    return null;
  }
}

export function requireRole(
  session: AdminSession | null,
  roles: readonly AdminRole[],
): session is AdminSession {
  return Boolean(session) && roles.includes((session as AdminSession).role);
}

/* -------------------------------------------------------------- accounts */

/**
 * Fail-open list for the account page: an unavailable store shows "no accounts"
 * rather than a 500. Contrast mutateUsers, which refuses to write over a
 * document it could not read.
 */
export async function listAdminUsers(): Promise<AdminUserView[]> {
  try {
    const users = await readUsers();
    if (!users) return [];
    return users
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(toView);
  } catch (error) {
    console.error("admin accounts could not be listed", error);
    return [];
  }
}

export async function getAdminUser(userId: string): Promise<AdminUserView | null> {
  try {
    const users = await readUsers();
    const user = users?.find((item) => item.id === userId);
    return user ? toView(user) : null;
  } catch (error) {
    console.error("admin account could not be read", error);
    return null;
  }
}

export async function createAdminUser(input: {
  username: string;
  name: string;
  role: AdminRole;
  password: string;
}): Promise<AdminUserView> {
  const username = normalizeUsername(input.username);
  if (!isValidAdminUsername(username)) throw new AdminAuthError("invalid_username");
  if (!isValidAdminPassword(input.password)) throw new AdminAuthError("invalid_password");
  if (!isAdminRole(input.role)) throw new AdminAuthError("invalid_role");
  const salt = newSalt();
  const user: AdminUser = {
    id: randomUUID(),
    username,
    name: normalizeAdminName(input.name, username),
    role: input.role,
    passwordHash: hashPassword(input.password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };
  const users = await mutateUsers((current) => {
    if (current.some((item) => item.username === username)) {
      throw new AdminAuthError("username_taken");
    }
    return [...current, user];
  });
  return toView(users.find((item) => item.id === user.id) ?? user);
}

export async function updateAdminUser(
  id: string,
  patch: {
    disabled?: boolean;
    password?: string;
    name?: string;
    role?: AdminRole;
    username?: string;
  },
): Promise<AdminUserView> {
  const nextUsername =
    typeof patch.username === "string" ? normalizeUsername(patch.username) : undefined;
  if (nextUsername !== undefined && !isValidAdminUsername(nextUsername)) {
    throw new AdminAuthError("invalid_username");
  }
  if (patch.role !== undefined && !isAdminRole(patch.role)) {
    throw new AdminAuthError("invalid_role");
  }

  const users = await mutateUsers((current) => {
    const index = current.findIndex((user) => user.id === id);
    if (index === -1) throw new AdminAuthError("not_found");
    const found = current[index];
    const next: AdminUser = { ...found };

    if (typeof patch.disabled === "boolean") next.disabled = patch.disabled;
    if (nextUsername !== undefined && nextUsername !== found.username) {
      if (current.some((user) => user.id !== id && user.username === nextUsername)) {
        throw new AdminAuthError("username_taken");
      }
      next.username = nextUsername;
    }
    if (typeof patch.name === "string") {
      next.name = normalizeAdminName(patch.name, found.name || found.username);
    }
    if (patch.role !== undefined) next.role = patch.role;
    if (typeof patch.password === "string") {
      if (!isValidAdminPassword(patch.password)) throw new AdminAuthError("invalid_password");
      next.salt = newSalt();
      next.passwordHash = hashPassword(patch.password, next.salt);
    }

    // Disabling or demoting every owner would lock the deployment out of account
    // management, so the last enabled owner always stays. An account list that
    // somehow has no enabled owner already is left alone rather than frozen.
    const ownersBefore = current.filter((user) => user.role === "owner" && !user.disabled).length;
    const ownersAfter = current
      .map((user, position) => (position === index ? next : user))
      .filter((user) => user.role === "owner" && !user.disabled).length;
    if (ownersBefore > 0 && ownersAfter === 0) throw new AdminAuthError("last_owner");

    return current.map((user, position) => (position === index ? next : user));
  });
  const updated = users.find((item) => item.id === id);
  if (!updated) throw new AdminAuthError("not_found");
  return toView(updated);
}

/**
 * Checks a username and password. While the account document does not exist yet
 * this is also the bootstrap: username `admin` plus ADMIN_PASSWORD (or the
 * factory password) creates the first owner and stores it.
 */
export async function verifyAdminLogin(rawUsername: string, password: string): Promise<AdminUserView | null> {
  const username = normalizeUsername(rawUsername);
  if (!username || !password || password.length > 256) return null;
  let users: AdminUser[] | null;
  try {
    users = await readUsers();
  } catch (error) {
    // Never fall through to bootstrap here: "unreadable" is not "empty", and
    // seeding an owner over an unreadable document would wipe the accounts.
    console.error("admin accounts could not be read for login", error);
    throw new AdminAuthError("unavailable");
  }
  if (!users || users.length === 0) {
    const seed = bootstrapPassword();
    if (username !== ADMIN_BOOTSTRAP_USERNAME || seed.length < PASSWORD_MIN) return null;
    if (!safeEqual(hashPassword(password, "bootstrap"), hashPassword(seed, "bootstrap"))) return null;
    return createAdminUser({ username, name: "管理员", role: "owner", password });
  }
  const user = users.find((item) => item.username === username);
  if (!user || user.disabled) return null;
  if (!passwordMatches(user, password)) return null;
  return toView(user);
}
