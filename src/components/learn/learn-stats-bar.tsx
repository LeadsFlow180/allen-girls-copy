"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import streakIcon from "@/assets/images/learn/streak.svg";
import pointsIcon from "@/assets/images/learn/points.svg";
import lifeIcon from "@/assets/images/learn/life.svg";
import { EXPLORE, pill3D } from "@/app/learn/explore/explore-theme";
import { ExploreStreakPanel } from "@/components/learn/explore-streak-panel";
import styles from "./learn-stats-bar.module.css";

export type LearnStatsBarProps = {
  before?: ReactNode;
  streakDays?: number;
  gems?: number;
  lives?: number;
  onStreakViewMore?: () => void;
};

export function LearnStatsBar({
  before,
  streakDays = 0,
  gems = 500,
  lives = 5,
  onStreakViewMore,
}: LearnStatsBarProps) {
  const [showStreakCard, setShowStreakCard] = useState(false);

  return (
    <div className={styles.wrap}>
      {before ? <div className={styles.before}>{before}</div> : null}
      <div
        className={styles.stats}
        onMouseLeave={() => setShowStreakCard(false)}
      >
        <button
          type="button"
          className={`${styles.streakBtn} font-nunito`}
          onMouseEnter={() => setShowStreakCard(true)}
          onClick={() => setShowStreakCard((open) => !open)}
          style={pill3D(EXPLORE.streak, EXPLORE.streakDark)}
          aria-expanded={showStreakCard}
          aria-label="Streak"
        >
          <Image
            src={streakIcon}
            alt=""
            width={22}
            height={22}
            style={{ display: "block" }}
            aria-hidden
          />
          <span>{streakDays}</span>
        </button>

        <motion.div
          className={styles.statPill}
          style={pill3D(EXPLORE.sky, EXPLORE.skyDark)}
        >
          <Image
            src={pointsIcon}
            alt=""
            width={20}
            height={20}
            style={{ display: "block" }}
            aria-hidden
          />
          <span className={styles.statValue}>{gems}</span>
        </motion.div>

        <motion.div
          className={styles.statPill}
          style={pill3D(EXPLORE.heart, EXPLORE.heartDark)}
        >
          <Image
            src={lifeIcon}
            alt=""
            width={20}
            height={20}
            style={{ display: "block" }}
            aria-hidden
          />
          <span className={styles.statValue}>{lives}</span>
        </motion.div>

        {showStreakCard ? (
          <div
            className={styles.streakDropdown}
            onMouseEnter={() => setShowStreakCard(true)}
          >
            <ExploreStreakPanel
              streakDays={streakDays}
              onClose={() => setShowStreakCard(false)}
              onViewMore={
                onStreakViewMore
                  ? () => {
                      setShowStreakCard(false);
                      onStreakViewMore();
                    }
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
