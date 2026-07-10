import type { PlaybackProgressRow } from "@/lib/learn/playback-progress";

export type LastQuizSummary = {
  percent: number;
  score: number;
  totalPoints: number;
  correctCount: number;
  incorrectCount: number;
  questionCount: number;
  ladderStep: string | null;
  sceneId: string | null;
  submittedAt: string | null;
};

export type QuizAttemptSummary = {
  id: string;
  percent: number;
  score: number;
  totalPoints: number;
  correctCount: number;
  questionCount: number;
  ladderStep: string | null;
  sectionId: number | null;
  unitIndex: number | null;
  submittedAt: string;
};

export type LearnQuizStats = {
  attemptsCount: number;
  lastQuiz: LastQuizSummary | null;
  recentAttempts: QuizAttemptSummary[];
};

function parseJsonField(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function toLastQuizSummary(raw: Record<string, unknown> | null): LastQuizSummary | null {
  if (!raw) return null;
  const percent = Number(
    raw.percent ?? raw.percentage ?? raw.scorePercent ?? raw.score_percent,
  );
  const score = Number(raw.score ?? raw.points ?? raw.earned);
  const totalPoints = Number(
    raw.totalPoints ?? raw.total_points ?? raw.maxPoints ?? raw.max_points,
  );
  if (!Number.isFinite(percent) && !Number.isFinite(score)) return null;

  return {
    percent: Number.isFinite(percent) ? Math.round(percent) : 0,
    score: Number.isFinite(score) ? score : 0,
    totalPoints: Number.isFinite(totalPoints) ? totalPoints : 0,
    correctCount: Number(raw.correctCount) || 0,
    incorrectCount: Number(raw.incorrectCount) || 0,
    questionCount: Number(raw.questionCount) || 0,
    ladderStep:
      typeof raw.ladderStep === "string"
        ? raw.ladderStep
        : typeof raw.ladder_step === "string"
          ? raw.ladder_step
          : null,
    sceneId:
      typeof raw.sceneId === "string"
        ? raw.sceneId
        : typeof raw.scene_id === "string"
          ? raw.scene_id
          : null,
    submittedAt:
      typeof raw.submittedAt === "string"
        ? raw.submittedAt
        : typeof raw.submitted_at === "string"
          ? raw.submitted_at
          : null,
  };
}

/** Read lastQuiz from playback row (`details` + `quiz` column). */
export function extractLastQuizFromProgressRow(
  row: PlaybackProgressRow | null | undefined,
): LastQuizSummary | null {
  if (!row) return null;
  const details = parseJsonField(row.details);
  const lastQuizRaw = parseJsonField(details?.lastQuiz);
  const quizCol = parseJsonField(row.quiz);
  return toLastQuizSummary(lastQuizRaw) ?? toLastQuizSummary(quizCol);
}

export function mapSubmissionRowToAttempt(row: {
  id: string;
  ladder_step?: string | null;
  submitted_at: string;
  quiz: unknown;
  section_id?: number | null;
  unit_index?: number | null;
}): QuizAttemptSummary | null {
  const quiz = parseJsonField(row.quiz);
  if (!quiz) return null;
  const last = toLastQuizSummary(quiz);
  if (!last) return null;
  const sectionId =
    row.section_id != null && Number.isFinite(Number(row.section_id))
      ? Number(row.section_id)
      : null;
  const unitIndex =
    row.unit_index != null && Number.isFinite(Number(row.unit_index))
      ? Number(row.unit_index)
      : null;
  return {
    id: row.id,
    percent: last.percent,
    score: last.score,
    totalPoints: last.totalPoints,
    correctCount: last.correctCount,
    questionCount: last.questionCount,
    ladderStep: row.ladder_step ?? last.ladderStep,
    sectionId,
    unitIndex,
    submittedAt: row.submitted_at,
  };
}

export function filterQuizStatsForUnit(
  stats: LearnQuizStats,
  sectionId: number | null,
  unitIndex: number | null,
): LearnQuizStats {
  if (sectionId == null || unitIndex == null) return stats;

  const recentAttempts = stats.recentAttempts.filter(
    (a) => a.sectionId === sectionId && a.unitIndex === unitIndex,
  );
  const lastQuiz = recentAttempts[0]
    ? {
        percent: recentAttempts[0].percent,
        score: recentAttempts[0].score,
        totalPoints: recentAttempts[0].totalPoints,
        correctCount: recentAttempts[0].correctCount,
        incorrectCount: 0,
        questionCount: recentAttempts[0].questionCount,
        ladderStep: recentAttempts[0].ladderStep,
        sceneId: null,
        submittedAt: recentAttempts[0].submittedAt,
      }
    : null;

  return {
    attemptsCount: recentAttempts.length,
    lastQuiz,
    recentAttempts,
  };
}

function attemptToLastQuiz(attempt: QuizAttemptSummary): LastQuizSummary {
  return {
    percent: attempt.percent,
    score: attempt.score,
    totalPoints: attempt.totalPoints,
    correctCount: attempt.correctCount,
    incorrectCount: 0,
    questionCount: attempt.questionCount,
    ladderStep: attempt.ladderStep,
    sceneId: null,
    submittedAt: attempt.submittedAt,
  };
}

/** Group quiz rows by unit; unattributed attempts go on `fallbackUnitIndex`. */
export function groupQuizStatsByUnit(
  attempts: QuizAttemptSummary[],
  options?: {
    sectionId?: number;
    fallbackUnitIndex?: number;
    playbackLastQuiz?: LastQuizSummary | null;
    playbackUnitIndex?: number | null;
  },
): Record<number, LearnQuizStats> {
  const sectionId = options?.sectionId;
  const fallbackUnit = Math.max(0, options?.fallbackUnitIndex ?? 0);
  const byUnit: Record<number, QuizAttemptSummary[]> = {};

  for (const attempt of attempts) {
    const matchesSection =
      sectionId == null ||
      attempt.sectionId == null ||
      attempt.sectionId === sectionId;
    if (!matchesSection) continue;

    const unitKey =
      attempt.unitIndex != null && Number.isFinite(attempt.unitIndex)
        ? attempt.unitIndex
        : fallbackUnit;
    if (!byUnit[unitKey]) byUnit[unitKey] = [];
    byUnit[unitKey].push(attempt);
  }

  const result: Record<number, LearnQuizStats> = {};
  for (const [unitKey, unitAttempts] of Object.entries(byUnit)) {
    const unitIndex = Number(unitKey);
    result[unitIndex] = buildLearnQuizStats(
      unitAttempts.length,
      unitAttempts[0] ? attemptToLastQuiz(unitAttempts[0]) : null,
      unitAttempts,
    );
  }

  const playbackUnit = options?.playbackUnitIndex;
  const playbackLast = options?.playbackLastQuiz;
  if (
    playbackLast &&
    playbackUnit != null &&
    Number.isFinite(playbackUnit) &&
    !result[playbackUnit]
  ) {
    result[playbackUnit] = buildLearnQuizStats(1, playbackLast, []);
  } else if (
    playbackLast &&
    playbackUnit != null &&
    Number.isFinite(playbackUnit) &&
    result[playbackUnit] &&
    !result[playbackUnit].lastQuiz
  ) {
    result[playbackUnit] = {
      ...result[playbackUnit],
      lastQuiz: playbackLast,
      attemptsCount: Math.max(1, result[playbackUnit].attemptsCount),
    };
  }

  return result;
}

export function buildLearnQuizStats(
  attemptsCount: number,
  lastQuiz: LastQuizSummary | null,
  recentAttempts: QuizAttemptSummary[],
): LearnQuizStats {
  return {
    attemptsCount,
    lastQuiz,
    recentAttempts,
  };
}
