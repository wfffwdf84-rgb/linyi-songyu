import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  listMedia,
  mediaPathFromUrl,
  mediaPublicUrl,
  readDocument,
  removeMedia,
  storageConfigured,
  writeDocument,
} from "@/lib/supabase";
import {
  FACTORY_MANIFEST_PATH,
  LOCAL_VIDEO_DIR,
  factoryVideoBlobKey,
  type FactoryVideo,
} from "@/lib/factory-videos";

/**
 * Factory videos are split in two, the way the Blob store used to hold them:
 * the clips are objects in the public `songyu-media` bucket under
 * `factory-videos/`, and the titles/order live in one JSON document at the same
 * key as before (`factory/videos.json`). A clip found in the bucket but missing
 * from the manifest is still listed, so a lost write never hides a video.
 */

/** Objects under this prefix are clips; the manifest document stays separate. */
const VIDEO_PREFIX = "factory-videos/";

function hasRemoteStorage() {
  return storageConfigured();
}

export function factoryVideoStorageReady() {
  // Outside Vercel the clips can always live on disk, which is what makes
  // `npm run dev` work without any credentials.
  return hasRemoteStorage() || process.env.VERCEL !== "1";
}

/** True when the upload may go straight to Supabase instead of the local disk. */
export function factoryVideoObjectStorageReady() {
  return hasRemoteStorage();
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

async function readRemoteManifest(): Promise<FactoryVideo[]> {
  try {
    const body = await readDocument(FACTORY_MANIFEST_PATH);
    return body ? parseVideos(body) : [];
  } catch {
    return [];
  }
}

async function listFactoryVideoFiles() {
  const objects = await listMedia(VIDEO_PREFIX, 200);
  return objects.map((object) => ({
    pathname: object.path,
    url: mediaPublicUrl(object.path),
    uploadedAt: new Date(object.createdAt),
  }));
}

function mergeManifestWithFiles(
  manifest: FactoryVideo[],
  files: Awaited<ReturnType<typeof listFactoryVideoFiles>>,
) {
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

async function writeRemoteManifest(videos: FactoryVideo[]) {
  await writeDocument(FACTORY_MANIFEST_PATH, JSON.stringify({ videos }));
}

export async function listFactoryVideos(): Promise<FactoryVideo[]> {
  if (hasRemoteStorage()) {
    try {
      const manifest = await readRemoteManifest();
      if (manifest.length > 0) return manifest;
      return mergeManifestWithFiles([], await listFactoryVideoFiles());
    } catch (error) {
      // The homepage must render without clips rather than fail: a clip is an
      // enhancement, and a storage outage should not take the page down.
      console.error("factory videos could not be read", error);
      return [];
    }
  }
  return readLocalManifest();
}

export async function getFactoryVideo(id: string) {
  if (!id || id.length > 80) return undefined;
  const videos = await listFactoryVideos();
  return videos.find((item) => item.id === id);
}

export async function saveFactoryVideos(videos: FactoryVideo[]) {
  if (hasRemoteStorage()) {
    await writeRemoteManifest(videos);
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
  // Only objects in our own bucket are deleted; an externally hosted URL is
  // dropped from the manifest and left where it is.
  const objectPath = mediaPathFromUrl(target.url);
  if (objectPath) {
    try {
      await removeMedia([objectPath]);
    } catch (error) {
      // keep removing from the list even if the file is already gone
      console.error("factory video file could not be removed", error);
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
