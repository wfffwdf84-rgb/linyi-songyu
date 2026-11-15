import { NextResponse } from "next/server";
import { getAdminSession, requireRole, type AdminSession } from "@/lib/admin-auth";

/**
 * Sales may read enquiries, never the catalogue editor. The navigation hiding
 * the section is convenience; this guard is the access control, and every
 * product write route calls it before reading the request body.
 */
export type EditorGuard =
  | { session: AdminSession; response: null }
  | { session: null; response: NextResponse };

export async function editorOnly(): Promise<EditorGuard> {
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }),
    };
  }
  if (!requireRole(session, ["owner", "editor"])) {
    return {
      session: null,
      response: NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }),
    };
  }
  return { session, response: null };
}
