"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildProgressSnapshot,
  getClaimedIds,
  getLocalWallet,
  type AchievementProgressSnapshot,
  type LocalWallet,
} from "@/lib/learn/achievements-state";
import {
  DEFAULT_LEARN_CLASSROOM_ID,
  LEARN_GUEST_SESSION_STORAGE_KEY,
} from "@/lib/learn/constants";
import { safeGetSessionAuthUser } from "@/lib/supabase/client";
import {
  ensureQuestStore,
  evaluateQuests,
  getGuestVisitStreakBoost,
  touchDailyVisit,
  type EvaluatedQuest,
} from "@/lib/learn/quests-state";
import type { MappedUnitPlayback } from "@/lib/learn/playback-progress";
import type { LearnQuizStats } from "@/lib/learn/quiz-stats";

export type LearnProgressState = {
  loading: boolean;
  hydrated: boolean;
  playback: MappedUnitPlayback | null;
  quizStats: LearnQuizStats | null;
  streakDays: number;
  wallet: LocalWallet;
  claimedIds: string[];
  snapshot: AchievementProgressSnapshot;
  quests: EvaluatedQuest[];
  refresh: () => Promise<void>;
};

export function useLearnProgress(): LearnProgressState {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playback, setPlayback] = useState<MappedUnitPlayback | null>(null);
  const [quizStats, setQuizStats] = useState<LearnQuizStats | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [wallet, setWallet] = useState<LocalWallet>({ xp: 0, gems: 500 });
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    setLoading(true);
    touchDailyVisit();
    setWallet(getLocalWallet());
    setClaimedIds(getClaimedIds());

    try {
      const params = new URLSearchParams({
        classroomId: DEFAULT_LEARN_CLASSROOM_ID,
        unitsInSection: "10",
      });
      const user = await safeGetSessionAuthUser();
      if (!user) {
        const guestSessionId = window.localStorage.getItem(
          LEARN_GUEST_SESSION_STORAGE_KEY,
        );
        if (!guestSessionId) {
          setLoading(false);
          return;
        }
        params.set("guestSessionId", guestSessionId);
      }

      const res = await fetch(`/api/learn/playback-progress?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = (await res.json()) as {
          mapped?: MappedUnitPlayback | null;
          quizStats?: LearnQuizStats | null;
        };
        setPlayback(json.mapped ?? null);
        setQuizStats(json.quizStats ?? null);
      }
    } catch {
      /* offline */
    }

    try {
      const streakRes = await fetch("/api/mission/streak");
      if (streakRes.ok) {
        const data = (await streakRes.json()) as { streak?: number };
        setStreakDays(data.streak ?? 0);
      }
    } catch {
      /* ignore */
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    window.addEventListener("learn:quests-updated", onUpdate);
    window.addEventListener("learn:achievements-updated", onUpdate);
    window.addEventListener("learn:wallet-updated", onUpdate);
    window.addEventListener("learn:shop-updated", onUpdate);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
      window.removeEventListener("learn:quests-updated", onUpdate);
      window.removeEventListener("learn:achievements-updated", onUpdate);
      window.removeEventListener("learn:wallet-updated", onUpdate);
      window.removeEventListener("learn:shop-updated", onUpdate);
    };
  }, [refresh]);

  const snapshot = useMemo(() => {
    const guestStreak = mounted ? getGuestVisitStreakBoost() : 0;
    const effectiveStreak = Math.max(streakDays, guestStreak);
    return buildProgressSnapshot(
      playback,
      quizStats,
      effectiveStreak,
      {
        claimedCount: mounted ? claimedIds.length : 0,
        walletXp: mounted ? wallet.xp : 0,
      },
      { includeLegacy: mounted },
    );
  }, [playback, quizStats, streakDays, claimedIds.length, wallet.xp, mounted]);

  const quests = useMemo(() => {
    if (!mounted) return [];
    const store = ensureQuestStore(snapshot);
    return evaluateQuests(snapshot, store);
  }, [snapshot, mounted]);

  const displayStreak = mounted
    ? Math.max(streakDays, getGuestVisitStreakBoost())
    : streakDays;

  return {
    loading,
    hydrated: mounted,
    playback,
    quizStats,
    streakDays: displayStreak,
    wallet: mounted ? wallet : { xp: 0, gems: 500 },
    claimedIds: mounted ? claimedIds : [],
    snapshot,
    quests,
    refresh,
  };
}
