"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import gameZoneImg from "@/assets/images/AGA Game Card.png";
import { GameSectionEyebrow, GameZoneCard } from "@/components/games/game-zone-card";
import { ACADEMIC_GAMES, ARCADE_GAMES, CREATIVE_GAMES } from "@/data/games/catalog";

import styles from "./games-page.module.css";

export default function GamesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow1} aria-hidden />
        <div className={styles.heroGlow2} aria-hidden />
        <div className={styles.heroInner}>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={styles.heroBadge}
          >
            Game Zone
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styles.heroTitle}
          >
            Power Up &amp; Play!{" "}
            <Sparkles
              style={{
                display: "inline",
                width: "1.5rem",
                height: "1.5rem",
                color: "#f5c518",
                verticalAlign: "middle",
              }}
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={styles.heroSubtitle}
          >
            Academic missions, arcade adventures, and creative color labs — pick a game and jump
            right in!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className={styles.heroImageWrap}
          >
            <Image
              src={gameZoneImg}
              alt="Game Zone — Power Up & Play!"
              width={560}
              height={315}
              className={styles.heroImage}
              priority
            />
          </motion.div>
        </div>
      </section>

      {ACADEMIC_GAMES.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <GameSectionEyebrow variant="academic">Learn &amp; Earn</GameSectionEyebrow>
              <h2 className={styles.sectionTitle}>Academic Adventures</h2>
              <p className={styles.sectionDesc}>
                Real curriculum questions inside the game — correct answers earn store points.
              </p>
            </div>
            <div className={styles.grid}>
              {ACADEMIC_GAMES.map((game, i) => (
                <GameZoneCard key={game.id} game={game} index={i} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <GameSectionEyebrow variant="arcade">Arcade Adventures</GameSectionEyebrow>
            <h2 className={styles.sectionTitle}>Unity Arcade Vault</h2>
            <p className={styles.sectionDesc}>
              Fast-paced browser games — tap, fly, and race without downloading anything.
            </p>
          </div>
          <div className={`${styles.grid} ${styles.gridArcade}`}>
            {ARCADE_GAMES.map((game, i) => (
              <GameZoneCard key={game.id} game={game} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <GameSectionEyebrow variant="creative">Color &amp; Create</GameSectionEyebrow>
            <h2 className={styles.sectionTitle}>Creative Studio</h2>
            <p className={styles.sectionDesc}>
              Relax and express yourself — color by numbers and bring magical scenes to life.
            </p>
          </div>
          <div className={styles.grid}>
            {CREATIVE_GAMES.map((game, i) => (
              <GameZoneCard key={game.id} game={game} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
