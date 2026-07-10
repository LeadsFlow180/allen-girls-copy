/**
 * POST /api/teacher/link-student
 * Teacher enters a student's approval code to link them to the classroom.
 * Body: { code: string }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const bodySchema = z.object({
  code: z.string().min(1).max(20),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  let json: unknown;
  try { json = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: result } = await supabase.rpc("link_student_to_teacher", {
    p_code: parsed.data.code,
  });

  const res = result as { ok: boolean; error?: string; student_user_id?: string } | null;
  if (!res?.ok) {
    const msg = res?.error === "not_teacher"
      ? "Only teacher accounts can link students."
      : res?.error === "invalid_code"
        ? "That code doesn't match any student. Double-check and try again."
        : "Could not link student.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true, studentUserId: res.student_user_id });
}
