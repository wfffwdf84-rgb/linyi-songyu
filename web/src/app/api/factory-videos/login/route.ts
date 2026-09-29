import { NextResponse } from "next/server";
import {
  factoryAuthCookie,
  factoryPasswordMatches,
  factoryUploadConfigured,
  issueFactoryAuthToken,
} from "@/lib/factory-video-auth";
import { clientIp, rateLimit, rateLimitClear } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!factoryUploadConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const ipKey = `factory-login:${clientIp(request)}`;
  const limited = rateLimit(ipKey, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "too_many_attempts" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const value = typeof body?.password === "string" ? body.password.trim() : "";
  if (!factoryPasswordMatches(value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  rateLimitClear(ipKey);
  const token = issueFactoryAuthToken();
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", factoryAuthCookie(token));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
