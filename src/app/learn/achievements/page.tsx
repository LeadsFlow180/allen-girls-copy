"use client";

import { useRouter } from "next/navigation";
import { LearnPageFrame } from "@/components/learn-page-frame";
import { LearnStatsBar } from "@/components/learn/learn-stats-bar";
import { AchievementsHub } from "@/components/learn/achievements-hub";

export default function LearnAchievementsPage() {
  const router = useRouter();

  return (
    <LearnPageFrame activeTab="achievements">
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        <header
          className="font-nunito"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "0.5rem",
            position: "relative",
            zIndex: 3,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/learn/explore")}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "0.45rem 0.85rem",
              background: "linear-gradient(180deg,#fff,#f1f5f9)",
              boxShadow: "0 3px 0 #cbd5e1",
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            ← Map
          </button>
          <LearnStatsBar
            onStreakViewMore={() => router.push("/learn/quests")}
          />
        </header>

        <AchievementsHub />
      </div>
    </LearnPageFrame>
  );
}
