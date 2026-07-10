import type { AchievementProgressSnapshot } from "@/lib/learn/achievements-state";
import {
  bumpLegacyStat,
  getLocalWallet,
  saveLocalWallet,
  type LocalWallet,
} from "@/lib/learn/achievements-state";
import {
  QUESTS_CATALOG,
  type QuestDefinition,
  type QuestPeriod,
} from "@/lib/learn/quests-catalog";

export const QUEST_DAY_STORE_KEY = "learn.questDayStore";

export type QuestDayStore = {
  dateKey: string;
  weekKey: string;
  monthKey: string;
  baselines: Partial<AchievementProgressSnapshot>;
  weekBaselines?: Partial<AchievementProgressSnapshot>;
  monthBaselines?: Partial<AchievementProgressSnapshot>;
  claimed: Record<QuestPeriod, string[]>;
};

export type EvaluatedQuest = QuestDefinition & {
  current: number;
  unlocked: boolean;
  claimed: boolean;
  readyToClaim: boolean;
  progressPercent: number;
};

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getWeekKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export function getMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function getMsUntilDailyReset(date = new Date()): number {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, next.getTime() - date.getTime());
}

export function formatQuestCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

function readStore(): QuestDayStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUEST_DAY_STORE_KEY);
    return raw ? (JSON.parse(raw) as QuestDayStore) : null;
  } catch {
    return null;
  }
}

function writeStore(store: QuestDayStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEST_DAY_STORE_KEY, JSON.stringify(store));
}

function emptyBaselinesFrom(
  snapshot: AchievementProgressSnapshot,
): Partial<AchievementProgressSnapshot> {
  return {
    dailyXp: snapshotMetric(snapshot, "dailyXp"),
    completedLadderSteps: snapshotMetric(snapshot, "completedLadderSteps"),
    quizAttempts: snapshotMetric(snapshot, "quizAttempts"),
    slidesViewedSession: snapshotMetric(snapshot, "slidesViewedSession"),
    highScoreQuizzes: snapshotMetric(snapshot, "highScoreQuizzes"),
    perfectQuizCount: snapshotMetric(snapshot, "perfectQuizCount"),
    claimedAchievements: snapshotMetric(snapshot, "claimedAchievements"),
    sectionPercent: snapshotMetric(snapshot, "sectionPercent"),
    streakDays: snapshotMetric(snapshot, "streakDays"),
  };
}

function defaultQuestStore(snapshot: AchievementProgressSnapshot): QuestDayStore {
  return {
    dateKey: getTodayKey(),
    weekKey: getWeekKey(),
    monthKey: getMonthKey(),
    baselines: emptyBaselinesFrom(snapshot),
    claimed: { daily: [], weekly: [], monthly: [] },
  };
}

function snapshotMetric(
  snapshot: AchievementProgressSnapshot,
  metric: keyof AchievementProgressSnapshot,
): number {
  const v = snapshot[metric];
  return typeof v === "number" ? v : v ? 1 : 0;
}

/** Ensures day/week/month buckets exist; resets baselines when a period rolls over. */
export function ensureQuestStore(
  snapshot: AchievementProgressSnapshot,
): QuestDayStore {
  if (typeof window === "undefined") {
    return defaultQuestStore(snapshot);
  }

  const today = getTodayKey();
  const week = getWeekKey();
  const month = getMonthKey();
  const prev = readStore();

  const emptyBaselines = () => emptyBaselinesFrom(snapshot);

  if (!prev) {
    const next: QuestDayStore = {
      dateKey: today,
      weekKey: week,
      monthKey: month,
      baselines: emptyBaselines(),
      claimed: { daily: [], weekly: [], monthly: [] },
    };
    writeStore(next);
    return next;
  }

  const next: QuestDayStore = {
    ...prev,
    claimed: prev.claimed ?? { daily: [], weekly: [], monthly: [] },
  };

  if (prev.dateKey !== today) {
    next.dateKey = today;
    next.baselines = emptyBaselines();
    next.claimed.daily = [];
    const legacy = readLegacyForReset();
    window.localStorage.setItem(
      "learn.achievementStats",
      JSON.stringify({ ...legacy, dailyXp: 0, dailyMissions: 0 }),
    );
  }

  if (prev.weekKey !== week) {
    next.weekKey = week;
    next.weekBaselines = emptyBaselines();
    next.claimed.weekly = [];
  }

  if (prev.monthKey !== month) {
    next.monthKey = month;
    next.monthBaselines = emptyBaselines();
    next.claimed.monthly = [];
  }

  writeStore(next);
  return next;
}

function readLegacyForReset(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("learn.achievementStats");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Guest / anonymous: count a visit today toward streak-style quests. */
export function touchDailyVisit(): number {
  if (typeof window === "undefined") return 0;
  const key = "learn.lastQuestVisit";
  const today = getTodayKey();
  window.localStorage.setItem(key, today);
  return 1;
}

export function getGuestVisitStreakBoost(): number {
  if (typeof window === "undefined") return 0;
  const key = "learn.lastQuestVisit";
  const today = getTodayKey();
  return window.localStorage.getItem(key) === today ? 1 : 0;
}

function questCurrent(
  def: QuestDefinition,
  snapshot: AchievementProgressSnapshot,
  store: QuestDayStore,
): number {
  const raw = snapshotMetric(snapshot, def.metric);

  if (def.metricMode === "absolute") {
    return Math.min(def.target, raw);
  }

  const baselines =
    def.period === "daily"
      ? store.baselines
      : def.period === "weekly"
        ? (store.weekBaselines ?? store.baselines)
        : (store.monthBaselines ?? store.baselines);

  const base = baselines[def.metric] ?? 0;
  return Math.min(def.target, Math.max(0, raw - (typeof base === "number" ? base : 0)));
}

export function evaluateQuests(
  snapshot: AchievementProgressSnapshot,
  store?: QuestDayStore,
): EvaluatedQuest[] {
  const activeStore = store ?? ensureQuestStore(snapshot);
  const claimedSets = activeStore.claimed ?? {
    daily: [],
    weekly: [],
    monthly: [],
  };

  return QUESTS_CATALOG.map((def) => {
    const current = questCurrent(def, snapshot, activeStore);
    const unlocked = current >= def.target;
    const claimed = (claimedSets[def.period] ?? []).includes(def.id);
    const progressPercent = Math.min(
      100,
      Math.round((current / def.target) * 100),
    );

    return {
      ...def,
      current,
      unlocked,
      claimed,
      readyToClaim: unlocked && !claimed,
      progressPercent,
    };
  });
}

export function claimQuest(questId: string, snapshot: AchievementProgressSnapshot): {
  ok: boolean;
  wallet?: LocalWallet;
  quest?: EvaluatedQuest;
} {
  if (typeof window === "undefined") return { ok: false };

  const store = ensureQuestStore(snapshot);
  const evaluated = evaluateQuests(snapshot, store);
  const quest = evaluated.find((q) => q.id === questId);
  if (!quest?.readyToClaim) return { ok: false };

  const wallet = getLocalWallet();
  const nextWallet: LocalWallet = {
    xp: wallet.xp + quest.reward.xp,
    gems: wallet.gems + quest.reward.gems,
  };
  saveLocalWallet(nextWallet);
  bumpLegacyStat("dailyXp", quest.reward.xp);

  const claimed = store.claimed ?? { daily: [], weekly: [], monthly: [] };
  claimed[quest.period] = [...(claimed[quest.period] ?? []), questId];
  writeStore({ ...store, claimed });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("learn:quests-updated"));
    window.dispatchEvent(new CustomEvent("learn:achievements-updated"));
  }

  return { ok: true, wallet: nextWallet, quest };
}

export function getDailyXpQuestProgress(
  evaluated: EvaluatedQuest[],
): { current: number; goal: number } {
  const xp = evaluated.find((q) => q.id === "daily-earn-xp");
  return {
    current: xp?.current ?? 0,
    goal: xp?.target ?? 10,
  };
}

export function getQuestPulse(evaluated: EvaluatedQuest[]): number {
  return evaluated.filter((q) => q.readyToClaim).length;
}
