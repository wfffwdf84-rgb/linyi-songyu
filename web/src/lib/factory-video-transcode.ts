import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { del, put } from "@vercel/blob";
import { FACTORY_VIDEO_TRANSCODE_MAX_BYTES, mp4LooksLikeHevc } from "@/lib/factory-videos";

function ffmpegBin() {
  return ffmpegPath && existsSync(ffmpegPath) ? ffmpegPath : "";
}

export async function bufferLooksLikeHevc(buf: Buffer) {
  const head = buf.subarray(0, Math.min(buf.length, 2_000_000));
  const tail = buf.subarray(Math.max(0, buf.length - 2_000_000));
  return mp4LooksLikeHevc(head) || mp4LooksLikeHevc(tail);
}

async function transcodeBufferToH264(input: Buffer) {
  const bin = ffmpegBin();
  if (!bin) throw new Error("ffmpeg_missing");
  const dir = await mkdtemp(path.join(tmpdir(), "lsy-h264-"));
  const inFile = path.join(dir, "in.mp4");
  const outFile = path.join(dir, "out.mp4");
  try {
    await writeFile(inFile, input);
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(bin, [
        "-y",
        "-i",
        inFile,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        outFile,
      ]);
      const timer = setTimeout(() => {
        proc.kill("SIGKILL");
        reject(new Error("ffmpeg_timeout"));
      }, 45000);
      proc.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      proc.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg_${code ?? "fail"}`));
      });
    });
    return await readFile(outFile);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function urlLooksLikeHevc(url: string) {
  const headRes = await fetch(url, { headers: { Range: "bytes=0-131071" }, cache: "no-store" });
  if (!headRes.ok && headRes.status !== 206) {
    const full = await fetch(url, { cache: "no-store" });
    if (!full.ok) return false;
    return bufferLooksLikeHevc(Buffer.from(await full.arrayBuffer()));
  }
  const headBuf = Buffer.from(await headRes.arrayBuffer());
  if (mp4LooksLikeHevc(headBuf)) return true;
  const range = headRes.headers.get("content-range");
  const size = Number(range?.split("/")[1] || headRes.headers.get("content-length") || 0);
  if (size <= headBuf.length) return false;
  const start = Math.max(0, size - 2_000_000);
  const tailRes = await fetch(url, { headers: { Range: `bytes=${start}-${size - 1}` }, cache: "no-store" });
  if (!tailRes.ok && tailRes.status !== 206) return false;
  return mp4LooksLikeHevc(Buffer.from(await tailRes.arrayBuffer()));
}

export async function ensureBrowserPlayableUrl(url: string) {
  if (!url.startsWith("https://") || !ffmpegBin()) return url;
  if (!(await urlLooksLikeHevc(url))) return url;
  const probe = await fetch(url, { cache: "no-store" });
  if (!probe.ok) return url;
  const buf = Buffer.from(await probe.arrayBuffer());
  if (!(await bufferLooksLikeHevc(buf))) return url;
  if (buf.length > FACTORY_VIDEO_TRANSCODE_MAX_BYTES) {
    throw new Error("hevc_too_large");
  }
  const converted = await transcodeBufferToH264(buf);
  const uploaded = await put(`factory/h264-${Date.now()}.mp4`, converted, {
    access: "public",
    addRandomSuffix: true,
    contentType: "video/mp4",
  });
  if (url.includes("blob.vercel-storage.com")) {
    try {
      await del(url);
    } catch {
      // keep the playable copy even if the original cannot be removed
    }
  }
  return uploaded.url;
}
