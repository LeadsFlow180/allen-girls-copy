"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import styles from "./page.module.css";

const episodes = [
  { emoji: "🦕", tag: "Science",       tagColor: "#06b6d4", title: "Jungle Time Compass",       desc: "The girls travel back to the age of dinosaurs and discover how ecosystems work — and how to survive in them.",        guide: "S.P.A.R.K.", ep: "S1 · E1" },
  { emoji: "🚀", tag: "Math",          tagColor: "#f5c518", title: "Zero-Gravity Problem",       desc: "Alana must calculate orbital paths to bring the crew safely back to Earth after their rocket drifts off course.",     guide: "Alana",      ep: "S1 · E2" },
  { emoji: "📜", tag: "Social Studies", tagColor: "#e8357a", title: "The Ancient Library",        desc: "Maya uncovers a hidden scroll in the ruins of an ancient city that rewrites what we know about early civilizations.", guide: "Maya",       ep: "S1 · E3" },
  { emoji: "🌊", tag: "Science",       tagColor: "#06b6d4", title: "Deep Ocean Rescue",          desc: "S.P.A.R.K. leads the mission to rescue bioluminescent sea creatures trapped by an underwater storm.",               guide: "S.P.A.R.K.", ep: "S1 · E4" },
  { emoji: "📖", tag: "Language Arts", tagColor: "#a855f7", title: "Story of the Lost Island",   desc: "Natalia discovers that the only way to communicate with the island's people is through their ancient storytelling tradition.", guide: "Natalia", ep: "S1 · E5" },
  { emoji: "🏔️", tag: "Math",          tagColor: "#f5c518", title: "Summit Probability",         desc: "To find the safest path up the mountain, Alana must calculate probability maps before the storm hits.",             guide: "Alana",      ep: "S1 · E6" },
  { emoji: "🌿", tag: "Science",       tagColor: "#06b6d4", title: "The Living Jungle",          desc: "The crew discovers a rainforest ecosystem unlike any on Earth — and must protect it from an incoming threat.",       guide: "S.P.A.R.K.", ep: "S1 · E7" },
  { emoji: "🗺️", tag: "Social Studies", tagColor: "#e8357a", title: "Across Seven Continents",   desc: "Maya leads a round-the-world tour teaching geography, cultures, and what connects communities across the globe.",   guide: "Maya",       ep: "S1 · E8" },
];

const themes = ["All", "Science", "Math", "Language Arts", "Social Studies", "History"];

export default function EpisodesPage() {
  return (
    <div className={styles.page}>
      {/* HERO — match home purple gradient */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="hero-eyebrow" style={{ margin: "0 auto 1rem", display: "inline-flex" }}>
            🎬 Season 1 Now Available
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-fredoka" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", lineHeight: 1.15, marginBottom: "0.75rem" }}>
            Adventure Episodes{" "}
            <Sparkles style={{ display: "inline", width: "1.5rem", height: "1.5rem", color: "var(--accent)", verticalAlign: "middle" }} />
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-nunito" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.65, marginBottom: "2rem" }}>
            Every episode is a quest that connects to real learning activities on the platform.
            Watch, then play — reinforcing what your child just discovered.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {themes.map((t, i) => (
              <span key={t} className="font-nunito" style={{
                padding: "0.5rem 1.1rem", borderRadius: "999px",
                background: i === 0 ? "var(--accent)" : "rgba(255,255,255,0.2)",
                color: i === 0 ? "var(--accent-fg)" : "#fff",
                fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                border: "2px solid " + (i === 0 ? "transparent" : "rgba(255,255,255,0.35)"),
              }}>
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* EPISODE GRID — cards match home adventure card feel */}
      <section className={`section section-dark ${styles.gridSection}`}>
        <div className="section-inner">
          <div className="ep-grid">
            {episodes.map((ep, i) => (
              <motion.div
                key={ep.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="ep-card"
              >
                <div className="ep-card-thumb" style={{
                  fontSize: "4rem",
                  background: `linear-gradient(135deg, ${ep.tagColor}22 0%, ${ep.tagColor}08 100%)`,
                  border: `2px solid ${ep.tagColor}44`,
                }}>
                  {ep.emoji}
                </div>
                <div className="ep-card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span className="ep-card-tag font-nunito" style={{ color: ep.tagColor }}>{ep.tag}</span>
                    <span className="font-nunito" style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }}>{ep.ep}</span>
                  </div>
                  <div className="ep-card-title">{ep.title}</div>
                  <p className="ep-card-desc font-nunito">{ep.desc}</p>
                  <div style={{ marginTop: "0.75rem" }}>
                    <span className="font-nunito" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Guide: <span style={{ color: ep.tagColor }}>{ep.guide}</span>
                     </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.comingSoonCard}
          >
            <div style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>🌟</div>
            <h3 className={`font-fredoka ${styles.comingSoonTitle}`}>
              Season 2 Coming Soon!
            </h3>
            <p className={`font-nunito ${styles.comingSoonText}`}>
              Space exploration, ancient wonders, deep-sea mysteries, and more — sign up to be first to know.
            </p>
            <Link href="/" className="btn-hero-primary">Get Notified →</Link>
          </motion.div>
        </div>
      </section>

      {/* CTA — match home newsletter strip gradient */}
      <section className={`cta-strip ${styles.ctaSection}`}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#fff", lineHeight: 1.2, marginBottom: "0.75rem" }}>
            Watch &amp; Learn Together
          </h2>
          <p className="font-nunito" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem" }}>
            Every episode unlocks activities, quizzes, and adventures on the platform.
          </p>
          <Link href="/learn" className="btn-hero-primary">▶ &nbsp;Start Learning Free</Link>
        </div>
      </section>
    </div>
  );
}
