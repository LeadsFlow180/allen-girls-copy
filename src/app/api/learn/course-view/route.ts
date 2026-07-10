import { NextResponse } from "next/server";
import { z } from "zod";

import { isSupabaseServerAuthEnabled } from "@/lib/supabase/env";
import {
  createServerSupabaseClient,
  safeServerAuthUser,
} from "@/lib/supabase/server";

const bodySchema = z.object({
  language: z.string().min(2).max(10),
  sectionId: z.number().int().min(1).max(200),
  unitIndex: z.number().int().min(0).max(200),
  step: z.enum(["start", "lesson", "chest", "practice", "review"]),
  dbSectionId: z.number().int().positive().optional(),
  dbUnitId: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const lastCourseView = {
    language: parsed.data.language,
    sectionId: parsed.data.sectionId,
    unitIndex: parsed.data.unitIndex,
    step: parsed.data.step,
    dbSectionId: parsed.data.dbSectionId ?? null,
    dbUnitId: parsed.data.dbUnitId ?? null,
    viewedAt: new Date().toISOString(),
  };

  if (!isSupabaseServerAuthEnabled()) {
    return NextResponse.json({ ok: true, persisted: false, lastCourseView });
  }

  const user = await safeServerAuthUser();
  if (!user) {
    return NextResponse.json({ ok: true, persisted: false, lastCourseView });
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, persisted: false, lastCourseView });
    }

    const existingMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...existingMeta,
        lastCourseView,
      },
    });

    if (!updateError) {
      return NextResponse.json({ ok: true, persisted: true, lastCourseView });
    }

    console.error("[learn/course-view]", updateError);
  } catch {
    /* Supabase unreachable */
  }

  return NextResponse.json({ ok: true, persisted: false, lastCourseView });
}
