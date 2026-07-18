/**
 * Weekly games report — aggregates game_sessions + game skill_attempts
 * for a date window. Used by parent & teacher report APIs.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { getGameById } from "@/data/games/catalog";

export type WeeklyReportLearner = {
  studentId: string;
  displayName: string;
  sessions: number;
  playSeconds: number;
  questionsAsked: number;
  questionsCorrect: number;
  accuracyPercent: number | null;
  gamePoints: number;
  topGame: string | null;
  strongestSkill: string | null;
  weakestSkill: string | null;
  perGame: Array<{
    gameTitle: string;
    gameSlug: string;
    sessions: number;
    playSeconds: number;
    questionsAsked: number;
    questionsCorrect: number;
  }>;
};

export type WeeklyGamesReport = {
  rangeDays: number;
  since: string;
  until: string;
  totals: {
    sessions: number;
    playSeconds: number;
    questionsAsked: number;
    questionsCorrect: number;
    accuracyPercent: number | null;
    gamePoints: number;
  };
  learners: WeeklyReportLearner[];
};

export function emptyWeeklyReport(rangeDays = 7): WeeklyGamesReport {
  const until = new Date();
  const since = new Date(until.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  return {
    rangeDays,
    since: since.toISOString(),
    until: until.toISOString(),
    totals: {
      sessions: 0,
      playSeconds: 0,
      questionsAsked: 0,
      questionsCorrect: 0,
      accuracyPercent: null,
      gamePoints: 0,
    },
    learners: [],
  };
}

type SessionRow = {
  student_user_id: string;
  game_slug: string;
  duration_seconds: number | null;
  questions_asked: number | null;
  questions_correct: number | null;
  points_awarded: number | null;
};

type AttemptRow = {
  student_user_id: string;
  skill_id: string;
  correct: boolean;
};

export async function buildWeeklyGamesReport(
  db: SupabaseClient,
  studentIds: string[],
  nameById: Map<string, string>,
  rangeDays = 7,
): Promise<WeeklyGamesReport> {
  const report = emptyWeeklyReport(rangeDays);
  if (studentIds.length === 0) return report;

  const sinceIso = report.since;

  const [sessionsRes, attemptsRes] = await Promise.all([
    db
      .from("game_sessions")
      .select(
        "student_user_id, game_slug, duration_seconds, questions_asked, questions_correct, points_awarded",
      )
      .in("student_user_id", studentIds)
      .gte("started_at", sinceIso),
    db
      .from("skill_attempts")
      .select("student_user_id, skill_id, correct")
      .eq("source", "game")
      .in("student_user_id", studentIds)
      .gte("created_at", sinceIso),
  ]);

  if (sessionsRes.error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[buildWeeklyGamesReport] game_sessions:", sessionsRes.error.message);
    }
    // Still list learners with zeros so the UI isn't blank
    report.learners = studentIds.map((id) => learnerShell(id, nameById.get(id) ?? "Learner"));
    return report;
  }

  type Acc = {
    sessions: number;
    playSeconds: number;
    questionsAsked: number;
    questionsCorrect: number;
    gamePoints: number;
    perGame: Map<
      string,
      { sessions: number; playSeconds: number; questionsAsked: number; questionsCorrect: number }
    >;
  };

  const byStudent = new Map<string, Acc>();
  for (const id of studentIds) {
    byStudent.set(id, {
      sessions: 0,
      playSeconds: 0,
      questionsAsked: 0,
      questionsCorrect: 0,
      gamePoints: 0,
      perGame: new Map(),
    });
  }

  for (const row of (sessionsRes.data ?? []) as SessionRow[]) {
    const acc = byStudent.get(row.student_user_id);
    if (!acc) continue;
    acc.sessions += 1;
    acc.playSeconds += row.duration_seconds ?? 0;
    acc.questionsAsked += row.questions_asked ?? 0;
    acc.questionsCorrect += row.questions_correct ?? 0;
    acc.gamePoints += row.points_awarded ?? 0;

    const g = acc.perGame.get(row.game_slug) ?? {
      sessions: 0,
      playSeconds: 0,
      questionsAsked: 0,
      questionsCorrect: 0,
    };
    g.sessions += 1;
    g.playSeconds += row.duration_seconds ?? 0;
    g.questionsAsked += row.questions_asked ?? 0;
    g.questionsCorrect += row.questions_correct ?? 0;
    acc.perGame.set(row.game_slug, g);
  }

  const skillByStudent = new Map<string, Map<string, { total: number; correct: number }>>();
  for (const id of studentIds) skillByStudent.set(id, new Map());

  if (!attemptsRes.error) {
    for (const row of (attemptsRes.data ?? []) as AttemptRow[]) {
      const map = skillByStudent.get(row.student_user_id);
      if (!map) continue;
      const t = map.get(row.skill_id) ?? { total: 0, correct: 0 };
      t.total += 1;
      if (row.correct) t.correct += 1;
      map.set(row.skill_id, t);
    }
  }

  const learners: WeeklyReportLearner[] = [];

  for (const id of studentIds) {
    const acc = byStudent.get(id)!;
    const perGameList = [...acc.perGame.entries()]
      .map(([slug, g]) => ({
        gameSlug: slug,
        gameTitle: getGameById(slug)?.title ?? slug,
        ...g,
      }))
      .sort((a, b) => b.playSeconds - a.playSeconds);

    const skillStats = [...(skillByStudent.get(id)?.entries() ?? [])].map(([skillId, t]) => ({
      skillId,
      accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
      attempts: t.total,
    }));
    skillStats.sort((a, b) => b.accuracy - a.accuracy);

    const accuracyPercent =
      acc.questionsAsked > 0
        ? Math.round((acc.questionsCorrect / acc.questionsAsked) * 100)
        : null;

    learners.push({
      studentId: id,
      displayName: nameById.get(id) ?? "Learner",
      sessions: acc.sessions,
      playSeconds: acc.playSeconds,
      questionsAsked: acc.questionsAsked,
      questionsCorrect: acc.questionsCorrect,
      accuracyPercent,
      gamePoints: acc.gamePoints,
      topGame: perGameList[0]?.gameTitle ?? null,
      strongestSkill: skillStats[0]?.skillId ?? null,
      weakestSkill: skillStats.length > 0 ? skillStats[skillStats.length - 1]!.skillId : null,
      perGame: perGameList,
    });

    report.totals.sessions += acc.sessions;
    report.totals.playSeconds += acc.playSeconds;
    report.totals.questionsAsked += acc.questionsAsked;
    report.totals.questionsCorrect += acc.questionsCorrect;
    report.totals.gamePoints += acc.gamePoints;
  }

  report.totals.accuracyPercent =
    report.totals.questionsAsked > 0
      ? Math.round((report.totals.questionsCorrect / report.totals.questionsAsked) * 100)
      : null;

  // Active first, then alpha
  learners.sort((a, b) => {
    if (b.sessions !== a.sessions) return b.sessions - a.sessions;
    return a.displayName.localeCompare(b.displayName);
  });
  report.learners = learners;
  return report;
}

function learnerShell(studentId: string, displayName: string): WeeklyReportLearner {
  return {
    studentId,
    displayName,
    sessions: 0,
    playSeconds: 0,
    questionsAsked: 0,
    questionsCorrect: 0,
    accuracyPercent: null,
    gamePoints: 0,
    topGame: null,
    strongestSkill: null,
    weakestSkill: null,
    perGame: [],
  };
}

export function formatPlayMinutes(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

/** Build a CSV string suitable for browser download. */
export function weeklyReportToCsv(report: WeeklyGamesReport): string {
  const header = [
    "Learner",
    "Sessions",
    "Play seconds",
    "Questions asked",
    "Questions correct",
    "Accuracy %",
    "Game points",
    "Top game",
    "Strongest skill",
    "Weakest skill",
  ];
  const lines = [header.join(",")];
  for (const l of report.learners) {
    lines.push(
      [
        csvEscape(l.displayName),
        l.sessions,
        l.playSeconds,
        l.questionsAsked,
        l.questionsCorrect,
        l.accuracyPercent ?? "",
        l.gamePoints,
        csvEscape(l.topGame ?? ""),
        csvEscape(l.strongestSkill ?? ""),
        csvEscape(l.weakestSkill ?? ""),
      ].join(","),
    );
  }
  lines.push("");
  lines.push(
    [
      "TOTALS",
      report.totals.sessions,
      report.totals.playSeconds,
      report.totals.questionsAsked,
      report.totals.questionsCorrect,
      report.totals.accuracyPercent ?? "",
      report.totals.gamePoints,
      "",
      "",
      "",
    ].join(","),
  );
  lines.push(`Range days,${report.rangeDays}`);
  lines.push(`Since,${report.since}`);
  lines.push(`Until,${report.until}`);
  return lines.join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
