import { createHmac, timingSafeEqual } from "node:crypto";
import { FACTORY_VIDEO_COOKIE } from "@/lib/factory-videos";

const SESSION_TTL_SEC = 60 * 60 * 24 * 30;
const TITLE_MAX = 80;

function password() {
  return process.env.FACTORY_VIDEO_PASSWORD?.trim() ?? "";
}

export function factoryUploadConfigured() {
  return password().length >= 8;
}

function hmac(value: string) {
  return createHmac("sha256", password()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function issueFactoryAuthToken() {
  const secret = password();
  if (!secret) return "";
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  return `${exp}.${hmac(`factory-upload:${exp}`)}`;
}

export function isFactoryUploadAuthed(cookieHeader: string | null) {
  if (!factoryUploadConfigured()) return false;
  const match = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${FACTORY_VIDEO_COOKIE}=([^;]+)`));
  const value = match?.[1] ? decodeURIComponent(match[1]) : "";
  const [expRaw, sig] = value.split(".");
  const exp = Number(expRaw);
  if (!expRaw || !sig || !Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  return safeEqual(sig, hmac(`factory-upload:${expRaw}`));
}

export function factoryPasswordMatches(input: string) {
  const expected = password();
  if (!expected || input.length > 256) return false;
  const left = hmac(`factory-pw:${input}`);
  const right = hmac(`factory-pw:${expected}`);
  return safeEqual(left, right);
}

function cookieSecurity() {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SEC}${secure}`;
}

export function factoryAuthCookie(token: string) {
  return `${FACTORY_VIDEO_COOKIE}=${encodeURIComponent(token)}; ${cookieSecurity()}`;
}

export function factoryAuthClearCookie() {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1" ? "; Secure" : "";
  return `${FACTORY_VIDEO_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function sanitizeFactoryVideoTitle(input: string, fallback = "厂区视频") {
  const title = input.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, TITLE_MAX);
  return title || fallback;
}

export function isAllowedFactoryVideoUrl(url: string) {
  if (url.startsWith("/videos/factory/")) return true;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host.endsWith(".public.blob.vercel-storage.com") ||
      host.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}
