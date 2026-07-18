"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Globe2, Lock, MapPin, Play } from "lucide-react";

import type { GameCatalogEntry } from "@/data/games/catalog";

import styles from "@/app/games/games-page.module.css";

type GameZoneCardProps = {
  game: GameCatalogEntry;
  index: number;
  featured?: boolean;
};

export function GameZoneCard({ game, index, featured }: GameZoneCardProps) {
  const isPlayable = game.available;
  const isAcademicWorld = game.gameClass === "academic" && Boolean(game.world);

  const cardContent = (
    <div
      className={`${styles.card} ${isPlayable ? styles.cardAvailable : styles.cardLocked}`}
      style={
        isPlayable
          ? ({ "--card-accent": game.accent, borderColor: `${game.accent}55` } as React.CSSProperties)
          : undefined
      }
    >
      <div className={styles.cardArt} style={{ background: game.gradient }}>
        <div className={styles.cardShine} aria-hidden />
        <span className={styles.cardBadge}>{game.badge}</span>
        {!isPlayable && <span className={styles.cardSoon}>Coming soon</span>}
        <span className={styles.cardEmoji} role="img" aria-hidden>
          {game.emoji}
        </span>
        {featured && isPlayable && (
          <div className={styles.featuredRibbon}>
            {isAcademicWorld
              ? `${game.world!.emoji} Find it in ${game.world!.name}`
              : "✨ New — Play now!"}
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{game.title}</h3>
        <p className={styles.cardDesc}>{game.description}</p>

        {game.world && (
          <p className={styles.worldNotice}>
            <MapPin size={13} aria-hidden />
            <span>
              Lives on the globe in{" "}
              <strong>
                {game.world.emoji} {game.world.name}
              </strong>
            </span>
          </p>
        )}

        <span
          className={`${styles.cardCta} ${isPlayable ? styles.cardCtaPlay : styles.cardCtaSoon}`}
        >
          {isPlayable ? (
            isAcademicWorld ? (
              <>
                <Globe2 size={14} aria-hidden />
                Go to {game.world!.name}
              </>
            ) : (
              <>
                <Play size={14} aria-hidden />
                Play now
              </>
            )
          ) : (
            <>
              <Lock size={13} aria-hidden />
              Coming soon
            </>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.07, duration: 0.45 }}
    >
      {isPlayable ? (
        <Link href={game.href} className={styles.cardLink}>
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </motion.div>
  );
}

type SectionEyebrowProps = {
  variant: "arcade" | "creative" | "academic";
  children: React.ReactNode;
};

export function GameSectionEyebrow({ variant, children }: SectionEyebrowProps) {
  const className =
    variant === "arcade"
      ? styles.sectionEyebrowArcade
      : variant === "academic"
        ? styles.sectionEyebrowAcademic
        : styles.sectionEyebrowCreative;

  return (
    <span className={`${styles.sectionEyebrow} ${className}`}>
      {variant === "arcade" && <Gamepad2 size={13} aria-hidden />}
      {variant === "academic" && <Globe2 size={13} aria-hidden />}
      {children}
    </span>
  );
}
