import { NextResponse } from "next/server";
import {
  AdminAuthError,
  createAdminUser,
  getAdminSession,
  isAdminRole,
  normalizeUsername,
  requireRole,
  updateAdminUser,
  type AdminRole,
} from "@/lib/admin-auth";

const STATUS: Record<string, number> = {
  invalid_username: 400,
  invalid_password: 400,
  invalid_role: 400,
  username_taken: 409,
  last_owner: 409,
  not_found: 404,
  not_configured: 503,
  // The account document exists but the store could not be read: refuse the
  // write (never overwrite it with an empty list) and say so with a 503.
  unavailable: 503,
};

function failure(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json(
      { ok: false, error: error.code },
      { status: STATUS[error.code] ?? 400 },
    );
  }
  console.error("admin users request failed", error);
  return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
}

/** Every write here is owner-only; the UI hiding a control is not the guard. */
async function ownerOnly() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }
  if (!requireRole(session, ["owner"])) {
    return { session: null, response: NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function POST(request: Request) {
  const guard = await ownerOnly();
  if (guard.response) return guard.response;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const role = body?.role;
  if (!isAdminRole(role)) {
    return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
  }

  try {
    const user = await createAdminUser({
      username: normalizeUsername(body?.username),
      name: typeof body?.name === "string" ? body.name : "",
      role,
      password: typeof body?.password === "string" ? body.password : "",
    });
    return NextResponse.json({ ok: true, user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  const guard = await ownerOnly();
  if (guard.response) return guard.response;
  const session = guard.session;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const patch: {
    disabled?: boolean;
    password?: string;
    name?: string;
    role?: AdminRole;
    username?: string;
  } = {};
  if (typeof body?.disabled === "boolean") patch.disabled = body.disabled;
  if (typeof body?.password === "string") patch.password = body.password;
  if (typeof body?.name === "string") patch.name = body.name;
  if (typeof body?.username === "string") patch.username = body.username;
  if (isAdminRole(body?.role)) patch.role = body.role;
  // Renaming the account you are signed in as is allowed; the session keys on the
  // id, so the cookie keeps working afterwards.
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "invalid_password" }, { status: 400 });
  }
  // Locking yourself out mid-session is always a mistake; another owner must do it.
  if (patch.disabled === true && session && id === session.userId) {
    return NextResponse.json({ ok: false, error: "cannot_disable_self" }, { status: 400 });
  }

  try {
    const user = await updateAdminUser(id, patch);
    return NextResponse.json({ ok: true, user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}
