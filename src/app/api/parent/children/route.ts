/**
 * GET  /api/parent/children — list linked learners (approved + pending)
 * POST /api/parent/children — guardian creates a pre-approved child account
 */
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createChildAccountForParent } from "@/lib/parent/create-child-account";

export type ParentChildListItem = {
  userId: string;
  displayName: string;
  email: string | null;
  approvedAt: string | null;
  guardianCreated: boolean;
  approvalCode: string | null;
  isApproved: boolean;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "parent") {
    return NextResponse.json({ error: "parents_only" }, { status: 403 });
  }

  const { data: links } = await supabase
    .from("student_profiles")
    .select("user_id, parent_approved_at, guardian_created, approval_code")
    .eq("parent_user_id", user.id);

  if (!links?.length) {
    return NextResponse.json({ children: [] as ParentChildListItem[] });
  }

  const ids = links.map((l) => l.user_id as string);
  const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", ids);

  const admin = createServiceRoleSupabaseClient();
  const emailById = new Map<string, string>();

  if (admin) {
    await Promise.all(
      ids.map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        if (data.user?.email) emailById.set(id, data.user.email);
      }),
    );
  }

  const children: ParentChildListItem[] = links.map((link) => {
    const prof = profiles?.find((p) => p.id === link.user_id);
    const approvedAt = (link.parent_approved_at as string | null) ?? null;
    return {
      userId: link.user_id as string,
      displayName: (prof?.display_name as string) || "Learner",
      email: emailById.get(link.user_id as string) ?? null,
      approvedAt,
      guardianCreated: Boolean(link.guardian_created),
      approvalCode: (link.approval_code as string) ?? null,
      isApproved: Boolean(approvedAt),
    };
  });

  children.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return NextResponse.json({ children });
}

export async function POST(request: Request) {
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

  let body: { displayName?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = await createChildAccountForParent(admin, user.id, {
    displayName: body.displayName ?? "",
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (!result.ok) {
    const err = result.error;
    const status =
      err === "not_parent"
        ? 403
        : err === "email_in_use" || err === "invalid_email" || err === "password_too_short"
          ? 400
          : 500;
    return NextResponse.json({ error: err }, { status });
  }

  return NextResponse.json({
    ok: true,
    child: {
      userId: result.childUserId,
      email: result.email,
      displayName: result.displayName,
    },
  });
}
