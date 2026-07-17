/**
 * First-time cadet gate for the galaxy map.
 * Tracks: intro video watched once + placement assessment completed.
 * Local first (works offline / guest). Cloud sync can layer on later.
 */

const STORAGE_KEY = "aga_cadet_onboarding_v1";

export type CadetOnboardingProgress = {
  version: 1;
  /** Cadet watched (or skipped) the intro cinematic once. */
  introVideoSeen: boolean;
  introVideoSeenAt: string | null;
  /** Placement / Signal Clarity Scan completed once. */
  assessmentComplete: boolean;
  assessmentCompletedAt: string | null;
  /** Last world the student intended to enter. */
  pendingWorldSlug: string | null;
};

const EMPTY: CadetOnboardingProgress = {
  version: 1,
  introVideoSeen: false,
  introVideoSeenAt: null,
  assessmentComplete: false,
  assessmentCompletedAt: null,
  pendingWorldSlug: null,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function loadCadetProgress(): CadetOnboardingProgress {
  if (!canUseStorage()) return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<CadetOnboardingProgress>;
    if (parsed?.version !== 1) return { ...EMPTY };
    return {
      ...EMPTY,
      ...parsed,
      version: 1,
    };
  } catch {
    return { ...EMPTY };
  }
}

function saveCadetProgress(next: CadetOnboardingProgress): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}

export function markCadetIntroVideoSeen(): CadetOnboardingProgress {
  const prev = loadCadetProgress();
  const next: CadetOnboardingProgress = {
    ...prev,
    introVideoSeen: true,
    introVideoSeenAt: prev.introVideoSeenAt ?? new Date().toISOString(),
  };
  saveCadetProgress(next);
  return next;
}

export function markCadetAssessmentComplete(): CadetOnboardingProgress {
  const prev = loadCadetProgress();
  const next: CadetOnboardingProgress = {
    ...prev,
    assessmentComplete: true,
    assessmentCompletedAt: prev.assessmentCompletedAt ?? new Date().toISOString(),
  };
  saveCadetProgress(next);
  return next;
}

export function setPendingWorldSlug(slug: string | null): CadetOnboardingProgress {
  const prev = loadCadetProgress();
  const next: CadetOnboardingProgress = {
    ...prev,
    pendingWorldSlug: slug,
  };
  saveCadetProgress(next);
  return next;
}

/**
 * What should happen when a student activates a world on the galaxy map.
 * - Need intro → play cinematic
 * - Need assessment → open placement (command deck)
 * - Ready → enter the world
 */
export type WorldEntryAction =
  | { kind: "play_intro"; worldSlug: string }
  | { kind: "go_assessment"; worldSlug: string }
  | { kind: "enter_world"; worldSlug: string };

export function resolveWorldEntryAction(worldSlug: string): WorldEntryAction {
  const progress = loadCadetProgress();
  if (!progress.introVideoSeen) {
    return { kind: "play_intro", worldSlug };
  }
  if (!progress.assessmentComplete) {
    return { kind: "go_assessment", worldSlug };
  }
  return { kind: "enter_world", worldSlug };
}

export function placementNextPathForWorld(worldSlug: string): string {
  return `/learn/placement?next=${encodeURIComponent(`/worlds/${worldSlug}`)}`;
}

/** Dev / owner reset — clears onboarding checkmarks only. */
export function clearCadetProgress(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* empty */
  }
}
