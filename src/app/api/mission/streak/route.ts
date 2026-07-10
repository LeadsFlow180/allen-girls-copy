/**
 * GET /api/mission/streak
 * Returns current streak + completed module count for the signed-in student.
 */
import { NextResponse } from "next/server";

import { isSupabaseServerAuthEnabled } from "@/lib/supabase/env";
import {
  createServerSupabaseClient,
  safeServerAuthUser,
} from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseServerAuthEnabled()) {
    return NextResponse.json({ streak: 0, completedModules: 0 });
  }

  const user = await safeServerAuthUser();
  if (!user) return NextResponse.json({ streak: 0, completedModules: 0 });

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ streak: 0, completedModules: 0 });

  const [{ data: streakRow }, { count }] = await Promise.all([
    supabase
      .from("daily_streaks")
      .select("current_streak")
      .eq("student_user_id", user.id)
      .maybeSingle(),
    supabase
      .from("module_completions")
      .select("*", { count: "exact", head: true })
      .eq("student_user_id", user.id),
  ]);

  return NextResponse.json({
    streak: (streakRow?.current_streak as number) ?? 0,
    completedModules: count ?? 0,
  });
}
