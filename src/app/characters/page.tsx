"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import mayaImg    from "@/assets/images/Maya 2027.png";
import alanaImg   from "@/assets/images/Alana 2027.png";
import nataliaImg from "@/assets/images/Natalia 2027.png";
import sparkImg   from "@/assets/images/SPARK the robot.png";
import heroImg    from "@/assets/images/AGA_action_pose.png";

const characters = [
  {
    img: mayaImg,
    name: "Maya",
    age: "12",
    role: "The Leader",
    color: "#e8357a",
    colorLight: "rgba(232,53,122,0.18)",
    subject: "Social Studies & History",
    subjectEmoji: "🌍",
    tagline: "Bold, creative, and always thinking three steps ahead.",
    description:
      "Maya is the oldest Allen sister — fearless, charismatic, and fiercely protective of her crew. She's the one who spots the mission before anyone else does and rallies everyone together. Her love of history and world cultures fuels every adventure. When Maya leads, every quest becomes a lesson in leadership, empathy, and global thinking.",
    traits: ["Natural leader", "Creative thinker", "History buff", "Culturally curious"],
    skill: "Speaks Spanish & loves world geography",
    favoriteAdventure: "The Ancient Library — uncovering lost civilizations",
    style: "Purple headband, lavender sweater, cargo jeans",
  },
  {
    img: alanaImg,
    name: "Alana",
    age: "10",
    role: "The Brain",
    color: "#f5c518",
    colorLight: "rgba(245,197,24,0.18)",
    subject: "Math & Problem Solving",
    subjectEmoji: "🔢",
    tagline: "Numbers come alive when Alana's on the case.",
    description:
      "Alana is the crew's mathematician — logical, precise, and obsessed with patterns. She can find the solution to any problem if given enough time and data. Don't let her quiet confidence fool you — Alana is often the one who saves the whole mission with one perfectly calculated move. She's also learning Mandarin because she likes how its structure mirrors math.",
    traits: ["Logical thinker", "Puzzle master", "Detail-oriented", "Calm under pressure"],
    skill: "Learning Mandarin; loves code-breaking",
    favoriteAdventure: "Zero-Gravity Problem — calculating orbital paths",
    style: "Purple puff buns, white cupcake tee, jeans",
  },
  {
    img: nataliaImg,
    name: "Natalia",
    age: "9",
    role: "The Storyteller",
    color: "#a855f7",
    colorLight: "rgba(168,85,247,0.18)",
    subject: "Language Arts & Reading",
    subjectEmoji: "📚",
    tagline: "Words are Natalia's superpower.",
    description:
      "Natalia is the youngest Allen sister — imaginative, empathetic, and the heart of the crew. She sees stories everywhere and has an uncanny ability to communicate with anyone, even across language barriers. Her love of reading means she always has a piece of wisdom or a just-right word when the team needs it most. Natalia turns every reading lesson into an epic tale worth telling.",
    traits: ["Imaginative", "Empathetic listener", "Bookworm", "Communication superstar"],
    skill: "Reads at a 7th-grade level; writes her own stories",
    favoriteAdventure: "Story of the Lost Island — communicating with ancient peoples",
    style: "Pink glasses, yellow heart tee, jeans, pink hair accessories",
  },
  {
    img: sparkImg,
    name: "S.P.A.R.K.",
    age: "Unknown (AI)",
    role: "The Robot AI",
    color: "#06b6d4",
    colorLight: "rgba(6,182,212,0.18)",
    subject: "Science & Discovery",
    subjectEmoji: "🔬",
    tagline: "S.P.A.R.K. knows everything — almost.",
    description:
      "S.P.A.R.K. (Smart Portable Adventure Research & Knowledge unit) is the crew's AI companion and science guide. It projects holograms, runs real-time experiments, and asks the best questions at the best moments. S.P.A.R.K. doesn't just tell the girls the answer — it guides them to find it themselves. On the platform, S.P.A.R.K. is the invisible engine that personalizes every child's experience.",
    traits: ["Encyclopedic knowledge", "Question-asker", "Hologram projector", "Safe AI guide"],
    skill: "Projects 3D holograms; speaks every known language",
    favoriteAdventure: "Deep Ocean Rescue — tracking bioluminescent creatures",
    style: "Compact robot companion with glowing cyan display",
  },
];

export default function CharactersPage() {
  return (
    <>
      {/* HERO — match home purple gradient + overlay */}
      <section className="hero" style={{ minHeight: "420px" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #7c22c5 0%, #5a18a0 50%, #e8357a 100%)",
          zIndex: 0,
        }} />
        <div style={{
          position: "absolute", right: 0, bottom: 0, width: "50%", maxWidth: "500px", zIndex: 1, opacity: 0.4,
          pointerEvents: "none",
        }}>
          <Image src={heroImg} alt="" width={900} height={600} style={{ width: "100%", height: "auto" }} />
        </div>
        <div className="hero-inner" style={{ minHeight: "420px" }}>
          <div className="hero-left" style={{ zIndex: 2 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="hero-eyebrow">👧🏾 Our Characters</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hero-title" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)" }}>
              Meet the Allen Girls<br />
              <span className="accent">&amp; S.P.A.R.K.</span>{" "}
              <Sparkles style={{ display: "inline", width: "1.5rem", height: "1.5rem", color: "var(--accent)", verticalAlign: "middle" }} />
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="hero-subtitle font-nunito">
              Four adventurers. Four subjects. One mission — to show every child
              that bold, curious girls change the world.
            </motion.p>
          </div>
        </div>
      </section>

      {/* CHARACTER DETAIL CARDS — motion + font-fredoka */}
      {characters.map((c, i) => (
        <motion.section
          key={c.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`section ${i % 2 === 0 ? "section-purple" : "section-darker"}`}
        >
          <div className="section-inner">
            <div className="zone-row" style={{ gap: "4rem", alignItems: "flex-start" }}>

              <div className={i % 2 !== 0 ? "zone-row flip" : ""} style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div className="zone-img-wrap" style={{
                  border: `4px solid ${c.color}`,
                  boxShadow: `0 20px 50px ${c.color}44`,
                }}>
                  <Image src={c.img} alt={c.name} width={500} height={600}
                    style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              </div>

              <div style={{ order: i % 2 === 0 ? 1 : 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <span className="font-nunito" style={{
                    padding: "0.35rem 1rem", borderRadius: "999px",
                    background: c.color, color: "#fff",
                    fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    {c.subjectEmoji} {c.subject}
                  </span>
                  <span className="font-nunito" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Age {c.age}</span>
                </div>

                <div>
                  <div className="font-nunito" style={{ fontSize: "0.85rem", fontWeight: 700, color: c.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {c.role}
                  </div>
                  <h2 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#fff", lineHeight: 1.1, marginTop: "0.25rem" }}>
                    {c.name}
                  </h2>
                  <p className="font-nunito" style={{ fontSize: "1.05rem", color: c.color, fontWeight: 700, marginTop: "0.3rem", fontStyle: "italic" }}>
                    &ldquo;{c.tagline}&rdquo;
                  </p>
                </div>

                <p className="font-nunito" style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.75 }}>{c.description}</p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {c.traits.map((t) => (
                    <span key={t} className="font-nunito" style={{
                      padding: "0.3rem 0.9rem", borderRadius: "999px",
                      background: c.colorLight, border: `1px solid ${c.color}55`,
                      color: "#e0e7ff", fontSize: "0.8rem", fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>

                <div style={{
                  borderRadius: "1rem", padding: "1.25rem 1.5rem",
                  background: c.colorLight, border: `1px solid ${c.color}33`,
                  display: "flex", flexDirection: "column", gap: "0.6rem",
                }}>
                  <div className="font-nunito" style={{ fontSize: "0.82rem", color: "#e0e7ff" }}>
                    <span style={{ color: c.color, fontWeight: 700 }}>Special Skill:</span> {c.skill}
                  </div>
                  <div className="font-nunito" style={{ fontSize: "0.82rem", color: "#e0e7ff" }}>
                    <span style={{ color: c.color, fontWeight: 700 }}>Fave Adventure:</span> {c.favoriteAdventure}
                  </div>
                  <div className="font-nunito" style={{ fontSize: "0.82rem", color: "#e0e7ff" }}>
                    <span style={{ color: c.color, fontWeight: 700 }}>Style:</span> {c.style}
                  </div>
                </div>

                <Link href="/learn" className="zone-btn font-fredoka" style={{ background: c.color, color: i === 1 ? "#1a0a40" : "#fff", width: "fit-content" }}>
                  Adventure with {c.name} →
                </Link>
              </div>

            </div>
          </div>
        </motion.section>
      ))}

      {/* BOTTOM CTA — match home */}
      <section className="cta-strip">
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#fff", lineHeight: 1.2, marginBottom: "0.75rem" }}>
            Ready to Join the Adventure?
          </h2>
          <p className="font-nunito" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem" }}>
            Start free and let your child discover which Allen Girl is their perfect guide.
          </p>
          <Link href="/learn" className="btn-hero-primary">▶ &nbsp;Start Free Today</Link>
        </div>
      </section>
    </>
  );
}
