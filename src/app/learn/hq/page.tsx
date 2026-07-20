"use client";

import { useRouter } from "next/navigation";
import { LearnPageFrame } from "@/components/learn-page-frame";
import { LearnStatsBar } from "@/components/learn/learn-stats-bar";
import { ExplorerHqHub } from "@/components/learn/explorer-hq-hub";
import { useLearnProgress } from "@/lib/learn/use-learn-progress";
import styles from "@/app/learn/shop/page.module.css";

export default function ExplorerHqPage() {
  const router = useRouter();
  const { streakDays, wallet } = useLearnProgress();

  return (
    <LearnPageFrame activeTab="hq">
      <div className={styles.shell}>
        <header className={`${styles.header} font-nunito`}>
          <button
            type="button"
            onClick={() => router.push("/learn/explore")}
            className={styles.mapBtn}
          >
            ← Map
          </button>
          <LearnStatsBar
            streakDays={streakDays}
            gems={wallet.gems}
            onStreakViewMore={() => router.push("/learn/quests")}
          />
        </header>

        <ExplorerHqHub />
      </div>
    </LearnPageFrame>
  );
}
