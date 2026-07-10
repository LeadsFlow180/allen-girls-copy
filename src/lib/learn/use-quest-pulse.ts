"use client";

import { useLearnProgress } from "@/lib/learn/use-learn-progress";
import { getQuestPulse } from "@/lib/learn/quests-state";

/** Ready-to-claim quest count for nav highlights. */
export function useQuestPulse(): number {
  const { quests } = useLearnProgress();
  return getQuestPulse(quests);
}
