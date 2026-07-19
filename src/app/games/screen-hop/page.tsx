import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe2, Play, Sparkles } from "lucide-react";

import { getGameById } from "@/data/games/catalog";

import styles from "../jurassic-journey/landing.module.css";

export const metadata = {
  title: "Screen Hop 3D | Futuria World",
  description:
    "An Academic Adventure inside Futuria World — cross 8 neon sectors, solve learning checkpoints, and out-think The Glitcher.",
};

export default function ScreenHopLandingPage() {
  const game = getGameById("screen-hop");
  if (!game || !game.available) notFound();
  const world = game.world;

  return (
    <div className={styles.page}>
      <div className={styles.hero} aria-hidden>
        <Image
          src="/games/screen-hop/assets/titlecard.png"
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
        <p className={styles.tagline}>Inside the Program · v22</p>
        <p className={styles.desc}>
          {game.description} This game is part of the {world?.name ?? "adventure"} world on the
          globe — not the arcade vault.
        </p>

        <ul className={styles.facts}>
          <li>
            <Sparkles size={14} aria-hidden />
            Grades {game.gradeLevels.join(", ")} — Math, ELA, Science &amp; Social Studies checkpoints
          </li>
          <li>
            <Sparkles size={14} aria-hidden />
            Academic game — correct answers build mastery, gems become real store points
          </li>
          <li>
            <Sparkles size={14} aria-hidden />
            8 sectors · S.P.A.R.K. hints · a final duel with The Glitcher
          </li>
        </ul>

        <div className={styles.actions}>
          <Link href="/games/play/screen-hop" className={styles.playBtn}>
            <Play size={18} aria-hidden />
            Play Screen Hop 3D
          </Link>
          {world && (
            <Link href={`/worlds/${world.slug}`} className={styles.worldLink}>
              <Globe2 size={16} aria-hidden />
              Explore {world.name}
            </Link>
          )}
        </div>

        <p className={styles.note}>
          Progress and points save when your child is signed in as a student.
        </p>
      </div>
    </div>
  );
}
