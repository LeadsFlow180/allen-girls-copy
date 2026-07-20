"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { GameSectionEyebrow, GameZoneCard } from "@/components/games/game-zone-card";
import { ACADEMIC_GAMES, ARCADE_GAMES, CREATIVE_GAMES } from "@/data/games/catalog";
import { getGameZoneHeroVideoSrc } from "@/lib/media/cdn-video";

import styles from "./games-page.module.css";

export default function GamesPage() {
  const heroVideoSrc = getGameZoneHeroVideoSrc();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    const play = () => {
      void el.play().catch(() => {
        /* autoplay blocked — still shows first frame */
      });
    };
    play();
    el.addEventListener("loadeddata", play);
    return () => el.removeEventListener("loadeddata", play);
  }, [heroVideoSrc]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden>
          <video
            ref={videoRef}
            className={styles.heroVideo}
            src={heroVideoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
          />
          <div className={styles.heroScrim} />
        </div>

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
            Jump into just-for-fun arcade games and creative color labs — then find learning
            adventures inside the worlds!
          </motion.p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <GameSectionEyebrow variant="arcade">Just for Fun</GameSectionEyebrow>
            <h2 className={styles.sectionTitle}>Arcade Vault</h2>
            <p className={styles.sectionDesc}>
              Fast-paced browser games — tap, fly, swim, and race without downloading anything.
            </p>
          </div>
          <div className={`${styles.grid} ${styles.gridArcade}`}>
            {ARCADE_GAMES.map((game, i) => (
              <GameZoneCard
                key={game.id}
                game={game}
                index={i}
                featured={
                  game.id === "morphfit" ||
                  game.id === "moto-rush" ||
                  game.id === "fin-feast"
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
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

      {ACADEMIC_GAMES.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <GameSectionEyebrow variant="academic">Learn in the Worlds</GameSectionEyebrow>
              <h2 className={styles.sectionTitle}>Academic Adventures</h2>
              <p className={styles.sectionDesc}>
                These games live inside adventure worlds on the globe — not the arcade vault. Tap a
                card to see which world it belongs to, then play it on your mission.
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
    </div>
  );
}
