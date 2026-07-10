"use client";

import { useCallback, useEffect, useState } from "react";

import {
  buildProgressSnapshot,
  evaluateAchievements,
  getClaimedIds,
  getLocalWallet,
} from "@/lib/learn/achievements-state";
import {
  DEFAULT_LEARN_CLASSROOM_ID,
  LEARN_GUEST_SESSION_STORAGE_KEY,
} from "@/lib/learn/constants";
import { safeGetSessionAuthUser } from "@/lib/supabase/client";
import type { MappedUnitPlayback } from "@/lib/learn/playback-progress";
import type { LearnQuizStats } from "@/lib/learn/quiz-stats";

export type AchievementPulse = {
  ready: number;
  unlocked: number;
  total: number;
};

const EMPTY: AchievementPulse = { ready: 0, unlocked: 0, total: 0 };

/** Lightweight badge counts for sidebar / nav highlights. */
export function useAchievementPulse(): AchievementPulse {
  const [pulse, setPulse] = useState<AchievementPulse>(EMPTY);

  const refresh = useCallback(async () => {
    const claimedIds = getClaimedIds();
    let playback: MappedUnitPlayback | null = null;
    let quizStats: LearnQuizStats | null = null;
    let streakDays = 0;

    try {
      const params = new URLSearchParams({
        classroomId: DEFAULT_LEARN_CLASSROOM_ID,
        unitsInSection: "10",
      });
      const sessionUser = await safeGetSessionAuthUser();
      if (!sessionUser) {
        const guestSessionId = window.localStorage.getItem(
          LEARN_GUEST_SESSION_STORAGE_KEY,
        );
        if (guestSessionId) params.set("guestSessionId", guestSessionId);
      }
      const res = await fetch(`/api/learn/playback-progress?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = (await res.json()) as {
          mapped?: MappedUnitPlayback | null;
          quizStats?: LearnQuizStats | null;
        };
        playback = json.mapped ?? null;
        quizStats = json.quizStats ?? null;
      }
    } catch {
      /* offline */
    }

    try {
      const streakRes = await fetch("/api/mission/streak");
      if (streakRes.ok) {
        const data = (await streakRes.json()) as { streak?: number };
        streakDays = data.streak ?? 0;
      }
    } catch {
      /* ignore */
    }

    const wallet = getLocalWallet();
    const snapshot = buildProgressSnapshot(
      playback,
      quizStats,
      streakDays,
      {
        claimedCount: claimedIds.length,
        walletXp: wallet.xp,
      },
      { includeLegacy: true },
    );
    const evaluated = evaluateAchievements(snapshot, claimedIds);
    setPulse({
      ready: evaluated.filter((a) => a.readyToClaim).length,
      unlocked: evaluated.filter((a) => a.unlocked).length,
      total: evaluated.length,
    });
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    window.addEventListener("learn:achievements-updated", onUpdate);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
      window.removeEventListener("learn:achievements-updated", onUpdate);
    };
  }, [refresh]);

  return pulse;
}
