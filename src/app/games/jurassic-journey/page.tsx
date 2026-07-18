import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, Sparkles } from "lucide-react";

import coverImg from "@/assets/images/Jurassic-Journey-Cover.png";
import { getGameById } from "@/data/games/catalog";

import styles from "./landing.module.css";

export const metadata = {
  title: "Jurassic Journey | Game Zone",
  description:
    "Roll a gyrosphere through 8 volcanic levels — math checkpoints power the escape!",
};

export default function JurassicJourneyLandingPage() {
  const game = getGameById("jurassic-journey");
  if (!game || !game.available) notFound();

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
        <Link href="/games" className={styles.back}>
          <ArrowLeft size={16} aria-hidden />
          All games
        </Link>

        <p className={styles.badge}>{game.badge}</p>
        <h1 className={styles.title}>
          {game.emoji} {game.title}
        </h1>
        <p className={styles.tagline}>Volcanic Escape · v1.9</p>
        <p className={styles.desc}>{game.description}</p>

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
            Play now
          </Link>
          <p className={styles.note}>
            Best on a bigger screen. Click inside the game to start.
            {game.skillIds.length > 0 && (
              <> Practices skill <code>{game.skillIds[0]}</code>.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
