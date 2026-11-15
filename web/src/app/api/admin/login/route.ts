import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
  createSessionCookie,
  verifyAdminLogin,
  type AdminUserView,
} from "@/lib/admin-auth";
import { clientIp, rateLimit, rateLimitClear } from "@/lib/rate-limit";

/** Eight attempts per address per ten minutes, counted before any Blob read. */
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const ipKey = `admin-login:${clientIp(request)}`;
  const limited = rateLimit(ipKey, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "too_many_attempts" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { username?: unknown; password?: unknown }
    | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  let user: AdminUserView | null;
  try {
    user = await verifyAdminLogin(username, password);
  } catch (error) {
    console.error("admin login failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }

  // One answer for a wrong username and a wrong password: nothing to enumerate.
  if (!user) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  rateLimitClear(ipKey);
  const response = NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
  response.headers.set("Set-Cookie", createSessionCookie(user.id, user.role));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
