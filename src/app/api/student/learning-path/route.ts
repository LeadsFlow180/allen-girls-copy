import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/student/learning-path
 * Returns domain tiers + cached learning path for the signed-in student.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (!profile || profile.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  const { data: path, error: pathError } = await supabase
    .from("student_learning_path")
    .select("*")
    .eq("student_user_id", user.id)
    .maybeSingle();

  const { data: tiers, error: tiersError } = await supabase
    .from("student_domain_tiers")
    .select("domain, tier, percent, updated_at")
    .eq("student_user_id", user.id);

  if (pathError) {
    console.error("learning-path fetch", pathError);
  }
  if (tiersError) {
    console.error("domain tiers fetch", tiersError);
  }

  return NextResponse.json({
    learningPath: path ?? null,
    domainTiers: tiers ?? [],
  });
}
