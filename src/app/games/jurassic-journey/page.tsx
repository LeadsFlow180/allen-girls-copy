import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe2, Play, Sparkles } from "lucide-react";

import coverImg from "@/assets/images/Jurassic-Journey-Cover.png";
import { getGameById } from "@/data/games/catalog";

import styles from "./landing.module.css";

export const metadata = {
  title: "Jurassic Journey | Fossil Frontier",
  description:
    "An Academic Adventure inside Fossil Frontier — roll a gyrosphere through volcanic levels with math checkpoints.",
};

export default function JurassicJourneyLandingPage() {
  const game = getGameById("jurassic-journey");
  if (!game || !game.available) notFound();
  const world = game.world;

  return (
    <div className={styles.page}>
      <div className={styles.hero} aria-hidden>
        <Image
          src={coverImg}
          alt=""
          fill
          priority
          className={styles.heroImg}
          sizes="100vw"
        />
        <div className={styles.heroScrim} />
      </div>

      <div className={styles.content}>
        <Link href={world ? `/worlds/${world.slug}` : "/worlds"} className={styles.back}>
          <ArrowLeft size={16} aria-hidden />
          {world ? `Back to ${world.name}` : "Back to worlds"}
        </Link>

        <p className={styles.badge}>{game.badge}</p>
        {world && (
          <p className={styles.worldChip}>
            <Globe2 size={14} aria-hidden />
            Academic Adventure in {world.emoji} {world.name}
          </p>
        )}
        <h1 className={styles.title}>
          {game.emoji} {game.title}
        </h1>
        <p className={styles.tagline}>Volcanic Escape · v1.9</p>
        <p className={styles.desc}>
          {game.description} This game is part of the {world?.name ?? "adventure"} world on the
          globe — not the arcade vault.
        </p>

        <ul className={styles.facts}>
          <li>
            <Sparkles size={14} aria-hidden />
            Grades {game.gradeLevels.join(", ")} math at checkpoints
          </li>
          <li>
            <Sparkles size={14} aria-hidden />
            Academic game — correct answers earn real store points
          </li>
          <li>
            <Sparkles size={14} aria-hidden />
            8 levels · S.P.A.R.K. hints · The Astral Realm Stone
          </li>
        </ul>

        <div className={styles.actions}>
          <Link href="/games/play/jurassic-journey" className={styles.playBtn}>
            <Play size={18} aria-hidden />
            Play Jurassic Journey
          </Link>
          {world && (
            <Link href={`/worlds/${world.slug}`} className={styles.worldLink}>
              <Globe2 size={16} aria-hidden />
              Open {world.name} on the globe
            </Link>
          )}
          <p className={styles.note}>
            Best on a bigger screen. Click inside the game to start.
          </p>
        </div>
      </div>
    </div>
  );
}
