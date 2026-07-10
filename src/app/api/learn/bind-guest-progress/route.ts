import { NextResponse } from "next/server";
import { z } from "zod";

import {
  mergeAllGuestPlaybackForLearner,
  mergeGuestProgressIntoLearner,
} from "@/lib/learn/merge-guest-progress";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  guestSessionId: z.string().uuid().optional(),
});

/** POST — attach browser guest learn rows to the signed-in student (for parent dashboard). */
export async function POST(request: Request) {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "service_role_required" }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  let json: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  let playbackMerged = 0;
  let quizzesMerged = 0;
  let questsMerged = 0;

  if (parsed.data.guestSessionId) {
    const result = await mergeGuestProgressIntoLearner(
      admin,
      user.id,
      parsed.data.guestSessionId,
    );
    playbackMerged += result.playbackMerged;
    quizzesMerged += result.quizzesMerged;
    questsMerged += result.questsMerged;
  }

  const allGuests = await mergeAllGuestPlaybackForLearner(admin, user.id);

  return NextResponse.json({
    ok: true,
    playbackMerged: playbackMerged + allGuests.playbackMerged,
    quizzesMerged,
    questsMerged,
    mergedGuestIds: allGuests.mergedGuestIds,
  });
}
