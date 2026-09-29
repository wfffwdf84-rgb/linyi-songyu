export type FactoryVideo = {
  id: string;
  url: string;
  title: string;
  createdAt: string;
};

export const FACTORY_VIDEO_COOKIE = "lsy_factory_upload";
export const FACTORY_VIDEO_MAX_BYTES = 200 * 1024 * 1024;
export const FACTORY_VIDEO_TRANSCODE_MAX_BYTES = 40 * 1024 * 1024;
export const FACTORY_VIDEO_MAX_COUNT = 8;
export const FACTORY_VIDEO_TYPES = ["video/mp4", "video/webm", "video/x-m4v"] as const;

export function isPlayableFactoryVideoName(name: string) {
  return /\.(mp4|webm|m4v)$/i.test(name);
}

export function isPlayableFactoryVideoUrl(url: string) {
  return !/\.mov(\?|#|$)/i.test(url);
}

export function isMachineVideoTitle(title: string) {
  const value = title.trim();
  if (!value) return true;
  if (/^[a-f0-9]{16,}$/i.test(value)) return true;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return true;
  return false;
}

export function displayFactoryVideoTitle(title: string, fallback: string) {
  return isMachineVideoTitle(title) ? fallback : title.trim();
}

export function factoryVideoPublicSrc(id: string, storedUrl: string) {
  if (storedUrl.startsWith("/")) return storedUrl.split("#")[0];
  return `/api/factory-videos/media/${encodeURIComponent(id)}`;
}

export function factoryVideoPreviewSrc(url: string, seconds = 1) {
  const clean = url.split("#")[0];
  return `${clean}#t=${seconds}`;
}

export function factoryVideoBlobKey(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname).replace(/^\//, "");
  } catch {
    return url.split("#")[0].split("?")[0];
  }
}

export function mp4LooksLikeHevc(bytes: Uint8Array) {
  const text = new TextDecoder("latin1").decode(bytes);
  return /hvc1|hev1|dvh1|hvcC/i.test(text) && !/avc1|avcC/.test(text);
}

export async function blobLooksLikeHevc(file: Blob) {
  const headSize = Math.min(file.size, 2_000_000);
  const tailStart = Math.max(0, file.size - 2_000_000);
  const chunks = [file.slice(0, headSize)];
  if (tailStart > headSize) chunks.push(file.slice(tailStart));
  for (const chunk of chunks) {
    if (mp4LooksLikeHevc(new Uint8Array(await chunk.arrayBuffer()))) return true;
  }
  return false;
}

export const FACTORY_MANIFEST_PATH = "factory/videos.json";
export const LOCAL_VIDEO_DIR = "videos/factory";
