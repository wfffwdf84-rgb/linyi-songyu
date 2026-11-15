import { NextResponse } from "next/server";
import { pingDocuments, storageConfigured } from "@/lib/supabase";

/**
 * Cron wake-up call for the free Supabase plan, which pauses a project after a
 * week without activity. Vercel's scheduler hits this once a day, the handler
 * runs one trivial query, and the project stays awake.
 *
 * Public on purpose (the scheduler sends no credentials), so it must never leak
 * data: the body is a boolean and nothing else, and the query selects one key
 * without reading or logging it.
 */
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  if (!storageConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
  }
  const reachable = await pingDocuments();
  if (!reachable) {
    return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
