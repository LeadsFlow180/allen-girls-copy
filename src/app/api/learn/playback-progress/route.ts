import { NextResponse } from "next/server";

import { DEFAULT_LEARN_CLASSROOM_ID } from "@/lib/learn/constants";
import {
  getPlaybackSectionPercent,
  mapPlaybackRowToUnitProgress,
  mapSectionExploreProgress,
} from "@/lib/learn/playback-progress";
import { fetchPlaybackProgressRow } from "@/lib/learn/playback-progress-query";
import {
  buildLearnQuizStats,
  extractLastQuizFromProgressRow,
  filterQuizStatsForUnit,
  groupQuizStatsByUnit,
  mapSubmissionRowToAttempt,
} from "@/lib/learn/quiz-stats";
import { canPlayLearnAsRole, getProfileRoleForUser } from "@/lib/auth/learn-route-access";
import { mergeAllGuestPlaybackForLearner } from "@/lib/learn/merge-guest-progress";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient, safeServerAuthUser } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classroomId =
    searchParams.get("classroomId")?.trim() || DEFAULT_LEARN_CLASSROOM_ID;
  const guestSessionIdParam = searchParams.get("guestSessionId")?.trim() || null;
  const sectionIdParam = searchParams.get("sectionId");
  const unitIndexParam = searchParams.get("unitIndex");
  const sectionId =
    sectionIdParam != null && sectionIdParam !== ""
      ? Number(sectionIdParam)
      : null;
  const unitIndex =
    unitIndexParam != null && unitIndexParam !== ""
      ? Number(unitIndexParam)
      : null;

  const admin = createServiceRoleSupabaseClient();
  const supabase = await createServerSupabaseClient();
  const db = admin ?? supabase;

  if (!db) {
    return NextResponse.json({
      ok: true,
      progress: null,
      mapped: null,
      exploreProgress: null,
      quizStats: null,
      quizStatsByUnit: {},
    });
  }

  const sessionUser = await safeServerAuthUser();
  let learnerId: string | null = null;
  let guestSessionId: string | null = null;
  let profileRole: string | null = null;

  if (sessionUser) {
    profileRole =
      supabase != null
        ? await getProfileRoleForUser(supabase, sessionUser.id)
        : null;
    if (!canPlayLearnAsRole(profileRole)) {
      return NextResponse.json({
        ok: true,
        studentsOnly: true,
        progress: null,
        mapped: null,
        exploreProgress: null,
        sectionPercent: 0,
        quizStats: null,
        quizStatsByUnit: {},
      });
    }
    learnerId = sessionUser.id;
  } else {
    guestSessionId = guestSessionIdParam;
  }

  if (!learnerId && !guestSessionId) {
    return NextResponse.json({
      ok: true,
      progress: null,
      mapped: null,
      exploreProgress: null,
      sectionPercent: 0,
      quizStats: null,
      quizStatsByUnit: {},
    });
  }

  let { data, error } = await fetchPlaybackProgressRow(db, {
    classroomId,
    guestSessionId,
    learnerId,
  });

  if (!error && learnerId && admin && profileRole === "student") {
    const merged = await mergeAllGuestPlaybackForLearner(admin, learnerId, classroomId);
    if (merged.playbackMerged > 0) {
      const refetch = await fetchPlaybackProgressRow(db, {
        classroomId,
        learnerId,
      });
      data = refetch.data;
      error = refetch.error;
      if (process.env.NODE_ENV !== "production") {
        console.info("[api/learn/playback-progress] merged orphan guests into learner", {
          learnerId,
          mergedGuestIds: merged.mergedGuestIds,
          playbackMerged: merged.playbackMerged,
        });
      }
    }
  }

  if (error) {
    console.error("[api/learn/playback-progress]", error);
    return NextResponse.json({ error: "database_error" }, { status: 500 });
  }

  const unitsInSection = Number(searchParams.get("unitsInSection")) || undefined;
  const exploreProgress = mapSectionExploreProgress(data, { unitsInSection });
  const displayUnitIndex =
    unitIndex != null && Number.isFinite(unitIndex)
      ? unitIndex
      : exploreProgress?.currentUnit;
  const mapped = mapPlaybackRowToUnitProgress(data, {
    unitsInSection,
    unitIndex: displayUnitIndex,
  });
  const lastQuiz = extractLastQuizFromProgressRow(data);

  let attemptsCount = lastQuiz ? 1 : 0;
  const recentAttempts: NonNullable<
    ReturnType<typeof mapSubmissionRowToAttempt>
  >[] = [];

  const ownerFilter = guestSessionId
    ? { col: "guest_session_id" as const, val: guestSessionId }
    : learnerId
      ? { col: "learner_id" as const, val: learnerId }
      : data?.learner_id
        ? { col: "learner_id" as const, val: data.learner_id as string }
        : null;

  if (ownerFilter) {
    let countQuery = db
      .from("learn_quiz_submissions")
      .select("id", { count: "exact", head: true })
      .eq(ownerFilter.col, ownerFilter.val)
      .eq("classroom_id", classroomId);

    if (sectionId != null && Number.isFinite(sectionId)) {
      countQuery = countQuery.eq("section_id", sectionId);
    }
    if (unitIndex != null && Number.isFinite(unitIndex)) {
      countQuery = countQuery.eq("unit_index", unitIndex);
    }

    const { count, error: countError } = await countQuery;
    if (!countError && typeof count === "number") {
      attemptsCount = count;
    }

    let listQuery = db
      .from("learn_quiz_submissions")
      .select("id, ladder_step, submitted_at, quiz, section_id, unit_index")
      .eq(ownerFilter.col, ownerFilter.val)
      .eq("classroom_id", classroomId)
      .order("submitted_at", { ascending: false })
      .limit(40);

    if (sectionId != null && Number.isFinite(sectionId)) {
      listQuery = listQuery.eq("section_id", sectionId);
    }

    const { data: submissionRows, error: listError } = await listQuery;

    if (!listError && submissionRows?.length) {
      for (const row of submissionRows) {
        const attempt = mapSubmissionRowToAttempt({
          id: row.id,
          ladder_step: row.ladder_step,
          submitted_at: row.submitted_at,
          quiz: row.quiz,
          section_id: row.section_id,
          unit_index: row.unit_index,
        });
        if (attempt) recentAttempts.push(attempt);
      }
    }
  }

  const fallbackUnit =
    exploreProgress?.currentUnit ??
    (data?.db_unit_id != null && Number(data.db_unit_id) > 0
      ? Number(data.db_unit_id) - 1
      : 0);

  const quizStatsByUnit = groupQuizStatsByUnit(recentAttempts, {
    sectionId: sectionId ?? exploreProgress?.sectionId ?? undefined,
    fallbackUnitIndex: fallbackUnit,
    playbackLastQuiz: lastQuiz,
    playbackUnitIndex:
      lastQuiz && exploreProgress ? exploreProgress.currentUnit : fallbackUnit,
  });
  const scopedAttempts =
    sectionId != null &&
    unitIndex != null &&
    Number.isFinite(sectionId) &&
    Number.isFinite(unitIndex)
      ? recentAttempts.filter(
          (a) => a.sectionId === sectionId && a.unitIndex === unitIndex,
        )
      : recentAttempts;

  const quizStats = filterQuizStatsForUnit(
    buildLearnQuizStats(attemptsCount, lastQuiz, scopedAttempts),
    sectionId,
    unitIndex,
  );

  const sectionPercent = getPlaybackSectionPercent(data, { unitsInSection });

  const debug =
    process.env.NODE_ENV !== "production"
      ? {
          authUserId: sessionUser?.id ?? null,
          authEmail: sessionUser?.email ?? null,
          profileRole,
          ownerMode: learnerId
            ? ("learner_id" as const)
            : guestSessionId
              ? ("guest_session_id" as const)
              : ("none" as const),
          ownerId: learnerId ?? guestSessionId,
          guestParamIgnored: Boolean(sessionUser && guestSessionIdParam),
          rowLearnerId: (data?.learner_id as string | null) ?? null,
          rowGuestSessionId: (data?.guest_session_id as string | null) ?? null,
          sectionPercent,
          exploreProgress,
        }
      : undefined;

  if (debug) {
    console.info("[api/learn/playback-progress]", debug);
  }

  return NextResponse.json({
    ok: true,
    progress: data,
    mapped,
    exploreProgress,
    sectionPercent,
    quizStats,
    quizStatsByUnit,
    debug,
  });
}
