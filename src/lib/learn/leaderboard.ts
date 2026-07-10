import {
  isStepMissionComplete,
  parseStepProgressMap,
  type StepProgressMap,
} from "@/lib/learn/playback-step-progress";

/** Lessons required before leaderboard unlocks (matches Explore side quest). */
export const LEADERBOARD_UNLOCK_LESSONS = 10;

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  completedLessons: number;
  isCurrentUser: boolean;
};

export type LeaderboardSnapshot = {
  unlockThreshold: number;
  unlocked: boolean;
  myCompletedLessons: number;
  lessonsUntilUnlock: number;
  myRank: number | null;
  totalLearners: number;
  entries: LeaderboardEntry[];
};

/** Count mission-complete ladder steps across a merged step map. */
export function countCompletedLessonsInStepMap(stepProgress: StepProgressMap): number {
  let count = 0;
  for (const state of Object.values(stepProgress)) {
    if (isStepMissionComplete(state)) count += 1;
  }
  return count;
}

/** Merge step progress from multiple playback rows (latest mission win per key). */
export function mergeStepProgressMaps(detailsList: unknown[]): StepProgressMap {
  const merged: StepProgressMap = {};

  for (const details of detailsList) {
    const map = parseStepProgressMap(details);
    for (const [key, state] of Object.entries(map)) {
      const existing = merged[key];
      if (!existing) {
        merged[key] = state;
        continue;
      }
      if (isStepMissionComplete(state)) {
        merged[key] = state;
        continue;
      }
      if (!isStepMissionComplete(existing) && state.sceneIndex > existing.sceneIndex) {
        merged[key] = state;
      }
    }
  }

  return merged;
}

export function countCompletedLessonsFromDetailsList(detailsList: unknown[]): number {
  return countCompletedLessonsInStepMap(mergeStepProgressMaps(detailsList));
}

export function isLeaderboardUnlocked(completedLessons: number): boolean {
  return completedLessons >= LEADERBOARD_UNLOCK_LESSONS;
}

export function lessonsUntilLeaderboardUnlock(completedLessons: number): number {
  return Math.max(0, LEADERBOARD_UNLOCK_LESSONS - completedLessons);
}

export function buildLeaderboardSnapshot(
  rows: { userId: string; displayName: string; completedLessons: number }[],
  currentUserId: string | null,
): LeaderboardSnapshot {
  const sorted = [...rows].sort((a, b) => {
    if (b.completedLessons !== a.completedLessons) {
      return b.completedLessons - a.completedLessons;
    }
    return a.displayName.localeCompare(b.displayName);
  });

  const myRow = currentUserId
    ? sorted.find((row) => row.userId === currentUserId)
    : undefined;
  const myCompletedLessons = myRow?.completedLessons ?? 0;
  const unlocked = isLeaderboardUnlocked(myCompletedLessons);

  let rank = 0;
  const entries: LeaderboardEntry[] = sorted.map((row, index) => {
    const entryRank = index + 1;
    if (row.userId === currentUserId) rank = entryRank;
    return {
      rank: entryRank,
      userId: row.userId,
      displayName: row.displayName,
      completedLessons: row.completedLessons,
      isCurrentUser: row.userId === currentUserId,
    };
  });

  return {
    unlockThreshold: LEADERBOARD_UNLOCK_LESSONS,
    unlocked,
    myCompletedLessons,
    lessonsUntilUnlock: lessonsUntilLeaderboardUnlock(myCompletedLessons),
    myRank: currentUserId ? rank || null : null,
    totalLearners: entries.length,
    entries,
  };
}

export function displayNameFromProfile(
  displayName: string | null | undefined,
  userId: string,
): string {
  const trimmed = displayName?.trim();
  if (trimmed) return trimmed.slice(0, 40);
  return `Learner ${userId.slice(0, 6)}`;
}

export function avatarInitial(displayName: string): string {
  const letter = displayName.trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
}

const AVATAR_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#db2777",
  "#4f46e5",
  "#0d9488",
];

export function avatarColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0]!;
}
