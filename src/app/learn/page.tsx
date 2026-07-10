"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

import mayaImg    from "@/assets/images/Maya 2027.png";
import alanaImg   from "@/assets/images/Alana 2027.png";
import nataliaImg from "@/assets/images/Natalia 2027.png";
import sparkImg   from "@/assets/images/SPARK the robot.png";

type HudData = { balance: number; streak: number; completedModules: number };

function useHudData(): HudData {
  const [hud, setHud] = useState<HudData>({ balance: 0, streak: 0, completedModules: 0 });
  useEffect(() => {
    const load = async () => {
      try {
        const [pointsRes, streakRes] = await Promise.all([
          fetch("/api/rewards/points"),
          fetch("/api/mission/streak"),
        ]);
        const pts = pointsRes.ok ? await pointsRes.json() as { balance: number } : null;
        const sk  = streakRes.ok ? await streakRes.json() as { streak: number; completedModules: number } : null;
        setHud({
          balance:          pts?.balance ?? 0,
          streak:           sk?.streak ?? 0,
          completedModules: sk?.completedModules ?? 0,
        });
      } catch { /* not signed in — keep defaults */ }
    };
    void load();
  }, []);
  return hud;
}

export default function LearnDashboard() {
  const hud = useHudData();
  return (
    <div className={styles.page}>
      <div className={styles.worldLayer} aria-hidden>
        <span className={`${styles.floatCloud} ${styles.cloudOne}`} />
        <span className={`${styles.floatCloud} ${styles.cloudTwo}`} />
        <span className={`${styles.floatCloud} ${styles.cloudThree}`} />

        <span className={`${styles.floatBalloon} ${styles.balloonOne}`}>
          <span className={styles.balloonString} />
        </span>
        <span className={`${styles.floatBalloon} ${styles.balloonTwo}`}>
          <span className={styles.balloonString} />
        </span>
        <span className={`${styles.floatBalloon} ${styles.balloonThree}`}>
          <span className={styles.balloonString} />
        </span>

        <span className={`${styles.driveCar} ${styles.carOne}`} />
        <span className={`${styles.driveCar} ${styles.carTwo}`} />
        <span className={`${styles.driveCar} ${styles.carThree}`} />
      </div>
      {/* ══════════════════════════════════════════
          KID WORLD HEADER — match home purple gradient
      ══════════════════════════════════════════ */}
      <section className="strip strip-purple" style={{ paddingBottom: "0" }}>
        <div className="strip-inner" style={{ textAlign: "center" }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.9 }}
          >
            ⚡ Kid World
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="strip-heading font-fredoka"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.6rem)" }}
          >
            Pick Your Next Mission!{" "}
            <Sparkles style={{ display: "inline", width: "1.25rem", height: "1.25rem", color: "var(--accent)", verticalAlign: "middle" }} />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="strip-subheading font-nunito"
          >
            Choose a zone, earn S.P.A.R.K. bolts, and unlock new adventures as you learn.
          </motion.p>
        </div>

        {/* Wave into zone section */}
        <div style={{ lineHeight: 0, background: "linear-gradient(135deg, #7c22c5, #a855f7)" }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%" }}>
            <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="#f0f9ff"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TODAY'S MISSION HUD — match home feature strip style
      ══════════════════════════════════════════ */}
      <section className="strip strip-sky" style={{ padding: "2rem 2rem" }}>
        <div className="strip-inner">
          <div className="hud-grid">
            {[
              { icon: "⭐", label: "Points", value: `${hud.balance.toLocaleString()} pts`, bg: "linear-gradient(135deg,#fef9c3,#fef08a)", border: "#facc15", labelColor: "#92400e", valueColor: "#78350f", valueSize: "1.5rem" },
              { icon: "🎯", label: "Today's Mission", value: "Pick a world → start Module 1", bg: "linear-gradient(135deg,#dcfce7,#bbf7d0)", border: "#22c55e", labelColor: "#14532d", valueColor: "#15803d", valueSize: "0.95rem" },
              { icon: "🏆", label: "Modules Done", value: hud.completedModules > 0 ? `${hud.completedModules} complete` : "None yet", bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)", border: "#a855f7", labelColor: "#581c87", valueColor: "#6b21a8", valueSize: "0.95rem" },
              { icon: "🔥", label: "Streak", value: `${hud.streak} ${hud.streak === 1 ? "Day" : "Days"}`, bg: "linear-gradient(135deg,#fee2e2,#fecaca)", border: "#f87171", labelColor: "#7f1d1d", valueColor: "#991b1b", valueSize: "1.5rem" },
            ].map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className="hud-card"
                style={{ background: h.bg, border: `2px solid ${h.border}` }}
              >
                <div className="hud-icon">{h.icon}</div>
                <div>
                  <div className="hud-label font-nunito" style={{ color: h.labelColor }}>{h.label}</div>
                  <div className="hud-value font-fredoka" style={{ color: h.valueColor, fontSize: h.valueSize }}>{h.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ZONE CARDS — match home section + card style
      ══════════════════════════════════════════ */}
      <section className="strip strip-white" style={{ padding: "4rem 2rem" }}>
        <div className="strip-inner">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
          >
            <h2 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#111827", marginBottom: "0.5rem" }}>
              🗺️ Choose Your Zone
            </h2>
            <p className="font-nunito" style={{ color: "#6b7280", fontSize: "1rem", maxWidth: "32rem", margin: "0 auto" }}>
              Each zone is a different adventure. All of them teach real skills.
            </p>
          </motion.div>

          <div className="zones-grid" style={{ marginBottom: "2rem" }}>
            {[
              { href: "/learn/placement", emoji: "🧭", chip: "Start here", label: "Mission Ready Quiz", desc: "Short reading + math check so your missions match your level.", guideImg: sparkImg, guideName: "S.P.A.R.K.", cardClass: "zone-card-science" },
              { href: "/worlds", emoji: "🌍", chip: "LMS — Worlds", label: "Choose Your World", desc: "All 9 worlds unlocked! Pick any world — your module travels with you.", guideImg: sparkImg, guideName: "S.P.A.R.K.", cardClass: "zone-card-science" },
              { href: "/learn/path", emoji: "🏔️", chip: "Main Story", label: "Quest Path", desc: "Follow the structured learning path. Episodes and activities matched to your level.", guideImg: alanaImg, guideName: "Alana", cardClass: "zone-card-math" },
              { href: "/learn/gates", emoji: "🚪", chip: "Phase 4", label: "Mission Gates Lab", desc: "Run Crisis and Discovery gates and test checkpoint flow.", guideImg: sparkImg, guideName: "S.P.A.R.K.", cardClass: "zone-card-science" },
              { href: "/learn/library", emoji: "📖", chip: "Pick & Watch", label: "Adventure Library", desc: "Jump into episodes, comics, and printables tied to every story arc.", guideImg: nataliaImg, guideName: "Natalia", cardClass: "zone-card-reading" },
            ].map((z, i) => (
              <motion.div key={z.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}>
                <Link href={z.href} className={`zone-card ${z.cardClass}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="zone-emoji">{z.emoji}</div>
                    <span className="zone-chip">{z.chip}</span>
                  </div>
                  <div className="zone-label">{z.label}</div>
                  <p className="zone-desc">{z.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <Image src={z.guideImg} alt={z.guideName} width={40} height={40} style={{ borderRadius: "999px", border: "2px solid rgba(0,0,0,0.1)", objectFit: "cover" }} />
                    <span className="font-nunito" style={{ fontSize: "0.8rem", opacity: 0.9, fontWeight: 600 }}>Guided by {z.guideName}</span>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* COMING SOON — not a link */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="zone-card zone-card-coming"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="zone-emoji">🤝</div>
                <span className="zone-chip zone-chip-dark">Coming Soon</span>
              </div>
              <div className="zone-label" style={{ color: "#334155" }}>Clubs &amp; Challenges</div>
              <p className="zone-desc" style={{ color: "#64748b" }}>Safe study clubs and friend challenges — coming in a future phase.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
                <Image src={mayaImg} alt="Maya" width={40} height={40} style={{ borderRadius: "999px", border: "2px solid #cbd5e1", objectFit: "cover" }} />
                <span className="font-nunito" style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Guided by Maya</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MEET YOUR GUIDES — match home character vibe
      ══════════════════════════════════════════ */}
      <section className="strip strip-dark" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div className="strip-inner">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="strip-heading font-fredoka"
            style={{ marginBottom: "0.5rem" }}
          >
            Meet Your Adventure Guides
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-nunito"
            style={{ opacity: 0.9, marginBottom: "2.5rem", fontSize: "1rem" }}
          >
            Each guide appears when the content matches their zone — growing with your child over time.
          </motion.p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem" }}>
            {[
              { img: mayaImg, name: "Maya", role: "Social Studies & History", color: "#e8357a" },
              { img: alanaImg, name: "Alana", role: "Math & Problem Solving", color: "#f5c518" },
              { img: nataliaImg, name: "Natalia", role: "Language Arts & Reading", color: "#a855f7" },
              { img: sparkImg, name: "S.P.A.R.K.", role: "Science & Discovery", color: "#06b6d4" },
            ].map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
              >
                <div style={{
                  width: 120, height: 120,
                  borderRadius: "999px",
                  overflow: "hidden",
                  border: `4px solid ${g.color}`,
                  boxShadow: `0 8px 28px ${g.color}44`,
                }}>
                  <Image src={g.img} alt={g.name} width={120} height={120} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="font-fredoka" style={{ fontSize: "1.05rem", color: "#fff" }}>{g.name}</div>
                <div className="font-nunito" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{g.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
