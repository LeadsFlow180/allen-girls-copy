"use client";

import { useCallback, useEffect, useState } from "react";

import type { LeaderboardEntry, LeaderboardSnapshot } from "@/lib/learn/leaderboard";

const EMPTY: LeaderboardSnapshot = {
  unlockThreshold: 10,
  unlocked: false,
  myCompletedLessons: 0,
  lessonsUntilUnlock: 10,
  myRank: null,
  totalLearners: 0,
  entries: [],
};

export type LearnLeaderboardState = LeaderboardSnapshot & {
  loading: boolean;
  hydrated: boolean;
  refresh: () => Promise<void>;
};

export function useLearnLeaderboard(): LearnLeaderboardState {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<LeaderboardSnapshot>(EMPTY);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    setLoading(true);
    try {
      const res = await fetch("/api/learn/leaderboard", { credentials: "include" });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = (await res.json()) as LeaderboardSnapshot & { ok?: boolean };
      setSnapshot({
        unlockThreshold: json.unlockThreshold ?? EMPTY.unlockThreshold,
        unlocked: Boolean(json.unlocked),
        myCompletedLessons: json.myCompletedLessons ?? 0,
        lessonsUntilUnlock: json.lessonsUntilUnlock ?? EMPTY.lessonsUntilUnlock,
        myRank: json.myRank ?? null,
        totalLearners: json.totalLearners ?? 0,
        entries: Array.isArray(json.entries) ? (json.entries as LeaderboardEntry[]) : [],
      });
    } catch {
      /* offline */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("learn:playback-updated", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("learn:playback-updated", onFocus);
    };
  }, [mounted, refresh]);

  return {
    ...snapshot,
    loading,
    hydrated: mounted,
    refresh,
  };
}
