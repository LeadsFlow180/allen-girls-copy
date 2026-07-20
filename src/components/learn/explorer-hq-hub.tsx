"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";

import { useLearnProgress } from "@/lib/learn/use-learn-progress";
import { getCadetRank } from "@/lib/learn/cadet-rank";
import {
  evaluateAchievements,
  type EvaluatedAchievement,
} from "@/lib/learn/achievements-state";
import { SHOP_CATALOG } from "@/lib/learn/shop-catalog";
import { getShopOwned } from "@/lib/learn/shop-state";
import { worlds } from "@/lib/worlds";

import styles from "./explorer-hq-hub.module.css";

const TOTAL_BADGES = SHOP_CATALOG.filter((i) => i.kind === "badge").length;
const TOTAL_TROPHIES = evaluateAchievements(
  {
    completedLadderSteps: 0,
    unitPercent: 0,
    sectionPercent: 0,
    slidePercent: 0,
    sceneDepth: 0,
    unitCompleteFlag: 0,
    playbackCompletedFlag: 0,
    quizAttempts: 0,
    bestQuizPercent: 0,
    highScoreQuizzes: 0,
    perfectQuizCount: 0,
    streakDays: 0,
    dailyXp: 0,
    dailyMissions: 0,
    slidesViewedSession: 0,
    hasResumed: false,
    classroomLaunches: 0,
    languagesStarted: 0,
    claimedAchievements: 0,
    walletXp: 0,
  },
  [],
).length;

export function ExplorerHqHub() {
  const { hydrated, wallet, streakDays, snapshot, claimedIds } =
    useLearnProgress();
  const [ownedBadges, setOwnedBadges] = useState(0);

  useEffect(() => {
    const readOwned = () => setOwnedBadges(getShopOwned().badges.length);
    readOwned();
    window.addEventListener("learn:shop-updated", readOwned);
    window.addEventListener("storage", readOwned);
    return () => {
      window.removeEventListener("learn:shop-updated", readOwned);
      window.removeEventListener("storage", readOwned);
    };
  }, []);

  const rank = getCadetRank(hydrated ? wallet.xp : 0);
  const trophies: EvaluatedAchievement[] = evaluateAchievements(
    snapshot,
    claimedIds,
  );
  const trophiesEarned = trophies.filter((t) => t.claimed).length;

  const rooms = [
    {
      key: "trophies",
      emoji: "🏆",
      name: "Trophy Hall",
      desc: "Achievements you've truly earned.",
      meta: `${trophiesEarned} of ${TOTAL_TROPHIES} earned`,
      href: "/learn/achievements",
      accent: "#f59e0b",
      soon: false,
    },
    {
      key: "bazaar",
      emoji: "💎",
      name: "Gem Bazaar",
      desc: "Spend gems on collectible treasures.",
      meta: `${ownedBadges} of ${TOTAL_BADGES} collected`,
      href: "/shop",
      accent: "#a855f7",
      soon: false,
    },
    {
      key: "vault",
      emoji: "🗝️",
      name: "Mystery Vault",
      desc: "Story relics & the Trinket mystery.",
      meta: "Discover it in missions",
      href: "#",
      accent: "#0ea5e9",
      soon: true,
    },
    {
      key: "archive",
      emoji: "🌎",
      name: "World Archive",
      desc: "Every world you can restore.",
      meta: `${worlds.length} worlds`,
      href: "/worlds",
      accent: "#22c55e",
      soon: false,
    },
    {
      key: "record",
      emoji: "⭐",
      name: "Cadet Record",
      desc: "Your rank & long-term journey.",
      meta: `Rank: ${rank.current.name}`,
      href: "#journey",
      accent: "#ec4899",
      soon: false,
    },
  ];

  const stats = [
    {
      key: "gems",
      icon: "💎",
      value: hydrated ? wallet.gems.toLocaleString() : "—",
      label: "Gems",
    },
    {
      key: "xp",
      icon: "⚡",
      value: hydrated ? wallet.xp.toLocaleString() : "—",
      label: "Mission Energy",
    },
    {
      key: "trophies",
      icon: "🏆",
      value: hydrated ? `${trophiesEarned}/${TOTAL_TROPHIES}` : "—",
      label: "Trophies",
    },
    {
      key: "collections",
      icon: "🧺",
      value: hydrated ? `${ownedBadges}/${TOTAL_BADGES}` : "—",
      label: "Collections",
    },
    {
      key: "streak",
      icon: "🔥",
      value: hydrated ? `${streakDays}` : "—",
      label: "Day Streak",
    },
    {
      key: "worlds",
      icon: "🧭",
      value: `${worlds.length}`,
      label: "Worlds to Explore",
    },
  ];

  return (
    <div className={`${styles.hub} font-nunito`}>
      {/* Sign board */}
      <div className={styles.sign}>
        <div className={styles.signMain}>
          <span className={styles.signEyebrow}>Nova Star Command</span>
          <h1 className={styles.signTitle}>Explorer HQ</h1>
          <p className={styles.signSub}>
            The record of everything you&apos;ve accomplished across the
            universe — your ranks, treasures, trophies, and the worlds you&apos;re
            restoring.
          </p>
        </div>
        <div className={styles.rankBadge}>
          <span className={styles.rankEmoji}>{rank.current.emoji}</span>
          <span className={styles.rankName}>{rank.current.name}</span>
          <span className={styles.rankClearance}>{rank.current.clearance}</span>
        </div>
      </div>

      {/* My Explorer Journey */}
      <section id="journey" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden>🧑‍🚀</span> My Explorer Journey
        </h2>

        {/* Cadet rank progress */}
        <div className={styles.rankCard}>
          <div className={styles.rankCardTop}>
            <span className={styles.rankCardEmoji} aria-hidden>
              {rank.current.emoji}
            </span>
            <div className={styles.rankCardText}>
              <span className={styles.rankCardName}>{rank.current.name}</span>
              <span className={styles.rankCardNext}>
                {rank.next
                  ? `${rank.next.minXp - (hydrated ? wallet.xp : 0)} energy to ${rank.next.name}`
                  : "Top rank reached — Guardian of the universe!"}
              </span>
            </div>
            <span className={styles.rankCardStep}>
              {rank.index + 1}/{rank.total}
            </span>
          </div>
          <div className={styles.bar}>
            <span
              className={styles.barFill}
              style={{ width: `${rank.percentToNext}%` }}
            />
          </div>
        </div>

        <div className={styles.journeyGrid}>
          {stats.map((s) => (
            <div className={styles.statCard} key={s.key}>
              <span className={styles.statIcon} aria-hidden>
                {s.icon}
              </span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Explorer HQ rooms */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden>🏛️</span> Explorer HQ
        </h2>
        <div className={styles.roomsGrid}>
          {rooms.map((room) => {
            const inner = (
              <>
                <span
                  className={styles.roomIcon}
                  style={{ "--accent": room.accent } as CSSProperties}
                  aria-hidden
                >
                  {room.emoji}
                </span>
                <span className={styles.roomName}>{room.name}</span>
                <span className={styles.roomDesc}>{room.desc}</span>
                <span className={styles.roomMeta}>
                  {room.soon ? (
                    <span className={styles.soonTag}>Coming soon</span>
                  ) : (
                    room.meta
                  )}
                </span>
              </>
            );

            if (room.soon) {
              return (
                <div
                  key={room.key}
                  className={`${styles.roomCard} ${styles.roomCardSoon}`}
                  aria-disabled
                >
                  {inner}
                </div>
              );
            }

            return (
              <Link key={room.key} href={room.href} className={styles.roomCard}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* World Restoration */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden>🌍</span> World Restoration
        </h2>
        <p className={styles.sectionNote}>
          Every mission you complete restores a piece of a world. Bars fill as
          you play.
        </p>
        <div className={styles.worldGrid}>
          {worlds.map((world) => (
            <Link
              key={world.id}
              href={`/worlds/${world.slug}`}
              className={styles.worldCard}
              style={{ "--world": world.borderColor } as CSSProperties}
            >
              <span className={styles.worldTop}>
                <span className={styles.worldEmoji} aria-hidden>
                  {world.emoji}
                </span>
                {world.isCentralHub ? (
                  <span className={styles.worldHub}>Hub</span>
                ) : null}
              </span>
              <span className={styles.worldName}>{world.name}</span>
              <div className={styles.worldBar}>
                <span className={styles.worldFill} style={{ width: "0%" }} />
              </div>
              <span className={styles.worldStatus}>Unexplored · Begin →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
