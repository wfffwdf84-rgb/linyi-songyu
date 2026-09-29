import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, list, put } from "@vercel/blob";
import {
  FACTORY_MANIFEST_PATH,
  LOCAL_VIDEO_DIR,
  factoryVideoBlobKey,
  type FactoryVideo,
} from "@/lib/factory-videos";

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function factoryVideoStorageReady() {
  return hasBlobToken() || process.env.VERCEL !== "1";
}

function localManifestFile() {
  return path.join(process.cwd(), "public", LOCAL_VIDEO_DIR, "manifest.json");
}

function idFromPathname(pathname: string) {
  return createHash("sha1").update(pathname).digest("hex").slice(0, 16);
}

function parseVideos(raw: string): FactoryVideo[] {
  try {
    const parsed = JSON.parse(raw) as { videos?: FactoryVideo[] };
    return Array.isArray(parsed.videos) ? parsed.videos : [];
  } catch {
    return [];
  }
}

function isFactoryVideoPath(pathname: string) {
  return pathname.startsWith("factory/") && /\.(mp4|webm|m4v|mov)$/i.test(pathname);
}

async function readLocalManifest(): Promise<FactoryVideo[]> {
  try {
    return parseVideos(await readFile(localManifestFile(), "utf8"));
  } catch {
    return [];
  }
}

async function writeLocalManifest(videos: FactoryVideo[]) {
  const file = localManifestFile();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify({ videos }, null, 2)}\n`, "utf8");
}

async function readBlobManifest(): Promise<FactoryVideo[]> {
  try {
    const result = await get(FACTORY_MANIFEST_PATH, { access: "public", useCache: false });
    if (!result || result.statusCode !== 200) return [];
    return parseVideos(await new Response(result.stream).text());
  } catch {
    return [];
  }
}

async function listFactoryVideoFiles() {
  const { blobs } = await list({ prefix: "factory/", limit: 200 });
  return blobs.filter((item) => item.pathname !== FACTORY_MANIFEST_PATH && isFactoryVideoPath(item.pathname));
}

function mergeManifestWithFiles(manifest: FactoryVideo[], files: Awaited<ReturnType<typeof listFactoryVideoFiles>>) {
  const byKey = new Map<string, FactoryVideo>();
  for (const video of manifest) {
    byKey.set(factoryVideoBlobKey(video.url), video);
  }
  for (const file of files) {
    const key = factoryVideoBlobKey(file.url) || file.pathname;
    if (byKey.has(key)) continue;
    byKey.set(key, {
      id: idFromPathname(file.pathname),
      url: file.url,
      title: "厂区视频",
      createdAt: file.uploadedAt.toISOString(),
    });
  }
  return [...byKey.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writeBlobManifest(videos: FactoryVideo[]) {
  await put(FACTORY_MANIFEST_PATH, JSON.stringify({ videos }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function listFactoryVideos(): Promise<FactoryVideo[]> {
  if (hasBlobToken()) {
    const manifest = await readBlobManifest();
    if (manifest.length > 0) return manifest;
    return mergeManifestWithFiles([], await listFactoryVideoFiles());
  }
  return readLocalManifest();
}

export async function getFactoryVideo(id: string) {
  if (!id || id.length > 80) return undefined;
  const videos = await listFactoryVideos();
  return videos.find((item) => item.id === id);
}

export async function saveFactoryVideos(videos: FactoryVideo[]) {
  if (hasBlobToken()) {
    await writeBlobManifest(videos);
    return;
  }
  await writeLocalManifest(videos);
}

export async function addFactoryVideo(video: FactoryVideo) {
  const { ensureBrowserPlayableUrl } = await import("@/lib/factory-video-transcode");
  const current = await listFactoryVideos();
  let url = video.url;
  try {
    url = await ensureBrowserPlayableUrl(video.url);
  } catch {
    if (current.length > 0) return current;
  }
  const playable = { ...video, url };
  const oldKey = factoryVideoBlobKey(video.url);
  const newKey = factoryVideoBlobKey(playable.url);
  const next = [
    playable,
    ...current.filter((item) => {
      const key = factoryVideoBlobKey(item.url);
      return key !== oldKey && key !== newKey && item.id !== playable.id;
    }),
  ];
  await saveFactoryVideos(next);
  return next;
}

export async function repairFactoryVideos() {
  const { ensureBrowserPlayableUrl } = await import("@/lib/factory-video-transcode");
  const current = await listFactoryVideos();
  for (let index = 0; index < current.length; index += 1) {
    const item = current[index];
    try {
      const url = await ensureBrowserPlayableUrl(item.url);
      if (url === item.url) continue;
      const next = current.map((video, videoIndex) => (videoIndex === index ? { ...video, url } : video));
      await saveFactoryVideos(next);
      return { videos: next, changed: 1 };
    } catch {
      // try the next clip
    }
  }
  return { videos: current, changed: 0 };
}

export async function renameFactoryVideo(id: string, title: string) {
  const current = await listFactoryVideos();
  const next = current.map((item) => (item.id === id ? { ...item, title } : item));
  await saveFactoryVideos(next);
  return next;
}

export async function removeFactoryVideo(id: string) {
  const current = await listFactoryVideos();
  const target = current.find((item) => item.id === id);
  if (!target) return current;
  if (hasBlobToken() && target.url.includes("blob.vercel-storage.com")) {
    try {
      await del(target.url);
    } catch {
      // keep removing from the list even if the file is already gone
    }
  }
  const next = current.filter((item) => item.id !== id);
  await saveFactoryVideos(next);
  return next;
}

export function localVideoPublicPath(id: string, ext: string) {
  return `/${LOCAL_VIDEO_DIR}/${id}${ext}`;
}

export function localVideoDiskPath(id: string, ext: string) {
  return path.join(process.cwd(), "public", LOCAL_VIDEO_DIR, `${id}${ext}`);
}
