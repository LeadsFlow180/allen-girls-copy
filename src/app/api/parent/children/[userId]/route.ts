import { NextResponse } from "next/server";

import { deleteChildAccountForParent } from "@/lib/parent/delete-child-account";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ userId: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** DELETE — remove a linked learner and all of their progress data. */
export async function DELETE(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return NextResponse.json(
      { error: "service_role_required", message: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local" },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { userId: childUserId } = await context.params;
  if (!childUserId || !UUID_RE.test(childUserId)) {
    return NextResponse.json({ error: "invalid_child_id" }, { status: 400 });
  }

  if (childUserId === user.id) {
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });
  }

  const result = await deleteChildAccountForParent(admin, user.id, childUserId);

  if (!result.ok) {
    const status =
      result.error === "not_parent" || result.error === "child_not_linked"
        ? 403
        : result.error === "not_a_student"
          ? 400
          : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    deletedUserId: result.childUserId,
    displayName: result.displayName,
  });
}
