import type { LearnQuizStats } from "@/lib/learn/quiz-stats";
import type { MappedUnitPlayback } from "@/lib/learn/playback-progress";
import {
  ACHIEVEMENTS_CATALOG,
  scaledAchievementReward,
  type AchievementDefinition,
} from "@/lib/learn/achievements-catalog";

export const CLAIMED_ACHIEVEMENTS_KEY = "learn.claimedAchievements";
export const LOCAL_WALLET_KEY = "learn.localWallet";
export const LEGACY_STATS_KEY = "learn.achievementStats";

export type AchievementProgressSnapshot = {
  completedLadderSteps: number;
  unitPercent: number;
  sectionPercent: number;
  slidePercent: number;
  sceneDepth: number;
  unitCompleteFlag: number;
  playbackCompletedFlag: number;
  quizAttempts: number;
  bestQuizPercent: number;
  highScoreQuizzes: number;
  perfectQuizCount: number;
  streakDays: number;
  dailyXp: number;
  dailyMissions: number;
  slidesViewedSession: number;
  hasResumed: boolean;
  classroomLaunches: number;
  languagesStarted: number;
  claimedAchievements: number;
  walletXp: number;
};

export type SnapshotExtras = {
  claimedCount?: number;
  walletXp?: number;
};

export type BuildProgressSnapshotOptions = {
  /** False during SSR / pre-hydration to avoid localStorage mismatch. */
  includeLegacy?: boolean;
};

export type EvaluatedAchievement = AchievementDefinition & {
  current: number;
  unlocked: boolean;
  claimed: boolean;
  readyToClaim: boolean;
  progressPercent: number;
};

export type LocalWallet = {
  xp: number;
  gems: number;
};

function readLegacyStats(): Partial<AchievementProgressSnapshot> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LEGACY_STATS_KEY);
    return raw ? (JSON.parse(raw) as Partial<AchievementProgressSnapshot>) : {};
  } catch {
    return {};
  }
}

export function buildProgressSnapshot(
  playback: MappedUnitPlayback | null,
  quizStats: LearnQuizStats | null,
  streakDays: number,
  extras?: SnapshotExtras,
  options?: BuildProgressSnapshotOptions,
): AchievementProgressSnapshot {
  const includeLegacy = options?.includeLegacy !== false;
  const legacy =
    includeLegacy && typeof window !== "undefined" ? readLegacyStats() : {};

  const sceneIndex = playback?.sceneIndex ?? 0;
  const slidesViewed = Math.max(
    legacy.slidesViewedSession ?? 0,
    sceneIndex + 1,
  );

  const recent = quizStats?.recentAttempts ?? [];
  const highScoreQuizzes = Math.max(
    legacy.highScoreQuizzes ?? 0,
    recent.filter((a) => a.percent >= 80).length,
    quizStats?.lastQuiz && quizStats.lastQuiz.percent >= 80 ? 1 : 0,
  );
  const perfectQuizCount = Math.max(
    legacy.perfectQuizCount ?? 0,
    recent.filter((a) => a.percent >= 100).length,
    quizStats?.lastQuiz?.percent === 100 ? 1 : 0,
  );

  return {
    completedLadderSteps: playback?.completedLadderSteps ?? 0,
    unitPercent: playback?.unitPercent ?? 0,
    sectionPercent: playback?.sectionPercent ?? 0,
    slidePercent: playback?.slidePercent ?? 0,
    sceneDepth: Math.max(legacy.sceneDepth ?? 0, sceneIndex + 1),
    unitCompleteFlag: playback?.unitComplete ? 1 : 0,
    playbackCompletedFlag: playback?.missionComplete ? 1 : 0,
    quizAttempts: Math.max(
      quizStats?.attemptsCount ?? 0,
      legacy.quizAttempts ?? 0,
    ),
    bestQuizPercent: Math.max(
      quizStats?.lastQuiz?.percent ?? 0,
      legacy.bestQuizPercent ?? 0,
    ),
    highScoreQuizzes,
    perfectQuizCount,
    streakDays: Math.max(streakDays, legacy.streakDays ?? 0),
    dailyXp: legacy.dailyXp ?? 0,
    dailyMissions: Math.max(
      playback?.completedLadderSteps ?? 0,
      legacy.dailyMissions ?? 0,
    ),
    slidesViewedSession: slidesViewed,
    hasResumed: Boolean(
      legacy.hasResumed ||
        (playback?.sceneIndex != null && playback.sceneIndex > 0),
    ),
    classroomLaunches: legacy.classroomLaunches ?? 0,
    languagesStarted: legacy.languagesStarted ?? 1,
    claimedAchievements: extras?.claimedCount ?? legacy.claimedAchievements ?? 0,
    walletXp: extras?.walletXp ?? legacy.walletXp ?? 0,
  };
}

function metricValue(
  snapshot: AchievementProgressSnapshot,
  metric: string,
): number {
  const v = snapshot[metric as keyof AchievementProgressSnapshot];
  return typeof v === "number" ? v : v ? 1 : 0;
}

export function getClaimedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CLAIMED_ACHIEVEMENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function getLocalWallet(): LocalWallet {
  if (typeof window === "undefined") return { xp: 0, gems: 500 };
  try {
    const raw = window.localStorage.getItem(LOCAL_WALLET_KEY);
    if (!raw) return { xp: 0, gems: 500 };
    const w = JSON.parse(raw) as LocalWallet;
    return {
      xp: Number(w.xp) || 0,
      gems: Number(w.gems) || 500,
    };
  } catch {
    return { xp: 0, gems: 500 };
  }
}

export function saveLocalWallet(wallet: LocalWallet) {
  window.localStorage.setItem(LOCAL_WALLET_KEY, JSON.stringify(wallet));
}

export function saveClaimedIds(ids: string[]) {
  window.localStorage.setItem(CLAIMED_ACHIEVEMENTS_KEY, JSON.stringify(ids));
}

export function evaluateAchievements(
  snapshot: AchievementProgressSnapshot,
  claimedIds: string[],
): EvaluatedAchievement[] {
  const claimed = new Set(claimedIds);

  return ACHIEVEMENTS_CATALOG.map((def) => {
    const current = metricValue(snapshot, def.metric);
    const unlocked = current >= def.target;
    const isClaimed = claimed.has(def.id);
    const progressPercent = Math.min(
      100,
      Math.round((current / def.target) * 100),
    );

    return {
      ...def,
      reward: scaledAchievementReward(def.reward),
      current: Math.min(current, def.target),
      unlocked,
      claimed: isClaimed,
      readyToClaim: unlocked && !isClaimed,
      progressPercent,
    };
  });
}

export function bumpLegacyStat(
  key: keyof AchievementProgressSnapshot,
  delta = 1,
) {
  if (typeof window === "undefined") return;
  const prev = readLegacyStats();
  const current = prev[key];
  const next =
    typeof current === "number"
      ? current + delta
      : delta;
  window.localStorage.setItem(
    LEGACY_STATS_KEY,
    JSON.stringify({ ...prev, [key]: next }),
  );
}
