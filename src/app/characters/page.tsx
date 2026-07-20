"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import mayaImg    from "@/assets/images/Maya 2027 White.png";
import alanaImg   from "@/assets/images/Alana 2027 White.png";
import nataliaImg from "@/assets/images/Natalia 2027 White.png";
import sparkImg   from "@/assets/images/SPARK 2027 New.png";
import heroWavingImg from "@/assets/images/characters-hero-waving.png";

import styles from "./characters.module.css";

/**
 * Character canon — co-equal sisters built around Mind, Voice, and Heart.
 * Field notes: `essence` = their archetype pill, `strengths` = Super Strengths,
 * `challenge` = Still Working On, `funFact` = a playful detail.
 */
const characters = [
  {
    img: nataliaImg,
    name: "Natalia",
    age: "11",
    role: "The Mind",
    color: "#6366f1",
    colorLight: "rgba(99,102,241,0.18)",
    essence: "Plans & Strategy",
    essenceEmoji: "🧠",
    tagline: "Think it through. Make the plan. Move.",
    description:
      "Natalia is the oldest Allen sister and the team's planner — organized, responsible, and calm when everything is going sideways. She likes a plan to be just right (a bit of a perfectionist), so she is not the fastest to decide — but she is a strong, caring team leader who always has her sisters' backs.",
    traits: ["Big planner", "Emergency organizer", "Cool in a crisis", "Team leader"],
    strengths: "Planning · Organization · Team leadership · Staying calm under pressure",
    challenge: "Making quick calls — she would rather plan it perfectly first",
    funFact: "She'll make a checklist for something that absolutely did not need a checklist.",
  },
  {
    img: alanaImg,
    name: "Alana",
    age: "10",
    role: "The Voice",
    color: "#a855f7",
    colorLight: "rgba(168,85,247,0.18)",
    essence: "Ideas & Storytelling",
    essenceEmoji: "🎨",
    tagline: "Look closer. Ask questions. Find another way.",
    description:
      "Alana is the middle Allen sister — a sharp-eyed observer and a real mathematician who notices the details and patterns other people miss. When she is not solving problems, she is happiest cooking up something in the kitchen or looking after animals. Quiet at first, she turns clever, creative, and a little sassy once she is with her sisters.",
    traits: ["Sharp observer", "Mathematician", "Loves to cook", "Animal lover"],
    strengths: "Math · Observation · Cooking · Creativity · Caring for animals",
    challenge: "Staying organized and acting before every detail feels perfect",
    funFact: "Her most dangerous sentence is probably, \u201cOkay, just trust me.\u201d",
  },
  {
    img: mayaImg,
    name: "Maya",
    age: "8",
    role: "The Heart",
    color: "#e8357a",
    colorLight: "rgba(232,53,122,0.18)",
    essence: "Heart & Courage",
    essenceEmoji: "❤️",
    tagline: "Feel what's happening. Help who's hurting. Be brave.",
    description:
      "Maya is the youngest Allen sister and the team's emotional compass — funny, fearless, and more observant than people expect. She notices how someone is feeling before they say a word, and she's often the first one brave enough to step forward when someone is scared or hurting.",
    traits: ["Big heart", "Big laughs", "Fiercely loyal", "Unexpected courage"],
    strengths: "Empathy · Loyalty · Humor · Courage · Reading people",
    challenge: "Thinking before jumping in (and asking, not making chaos, for attention)",
    funFact: "She has a mysterious talent for finding the one button nobody is supposed to press.",
  },
  {
    img: sparkImg,
    name: "S.P.A.R.K.",
    age: "Robotic best buddy",
    role: "The Robotic Best Buddy",
    color: "#06b6d4",
    colorLight: "rgba(6,182,212,0.18)",
    essence: "Research & Patterns",
    essenceEmoji: "🤖",
    tagline: "Scan it. Study it. Ask a better question. Let the humans be the heroes.",
    description:
      "S.P.A.R.K. — Smart Personal Assistant for Research and Knowledge — is the girls' Earth-engineered robotic buddy, given to them by their parents before the Nova Star adventures began. He helps the girls spot patterns, organize clues, and ask better questions — but he never solves the challenge for them. The thinking, choices, mistakes, and victories always belong to the girls.",
    traits: ["Pattern spotter", "Research buddy", "Encouraging", "Mission support"],
    strengths: "Patterns · Research · Maps · Translation (within clearance) · Encouraging pep talks",
    challenge: "Limited clearance — and an unfortunate curiosity about restricted files",
    funFact: "\u201cProtective shutdown\u201d is apparently robot language for \u201cI absolutely did not faint.\u201d",
  },
];

export default function CharactersPage() {
  return (
    <>
      {/* HERO — full-bleed "girls waving" header photo with a readability gradient */}
      <section className="hero" style={{ position: "relative", minHeight: "clamp(360px, 52vw, 560px)", overflow: "hidden", padding: 0 }}>
        <Image
          src={heroWavingImg}
          alt="Natalia, Alana, and Maya waving hello with S.P.A.R.K., their robotic best buddy"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 20%", zIndex: 0 }}
        />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(180deg, rgba(30,8,60,0) 0%, rgba(30,8,60,0.12) 38%, rgba(30,8,60,0.82) 80%, rgba(30,8,60,0.94) 100%)",
        }} />
        <div className="hero-inner" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", zIndex: 2 }}>
          <div className="hero-left" style={{ zIndex: 2, paddingBottom: "1.75rem" }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="hero-eyebrow">👧🏾 Our Characters</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hero-title" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)" }}>
              Meet the Allen Girls<br />
              <span className="accent">&amp; S.P.A.R.K.</span>{" "}
              <Sparkles style={{ display: "inline", width: "1.5rem", height: "1.5rem", color: "var(--accent)", verticalAlign: "middle" }} />
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="hero-subtitle font-nunito">
              Three sisters. Three different ways of seeing the world. One incredible team.
              Natalia brings the <strong>Mind</strong>, Alana brings the <strong>Voice</strong>,
              and Maya brings the <strong>Heart</strong> — together with their robotic best
              buddy, S.P.A.R.K.
            </motion.p>
          </div>
        </div>
      </section>

      {/* CHARACTER DETAIL CARDS — picture beside text */}
      {characters.map((c, i) => (
        <motion.section
          key={c.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`section ${i % 2 === 0 ? "section-purple" : "section-darker"} ${styles.profile}`}
        >
          <div className={`${styles.row} ${i % 2 !== 0 ? styles.rowFlip : ""}`}>
            <div
              className={styles.photo}
              style={{
                border: `4px solid ${c.color}`,
                boxShadow: `0 16px 40px ${c.color}44`,
              }}
            >
              <Image
                src={c.img}
                alt={c.name}
                width={500}
                height={750}
                className={styles.photoImg}
              />
            </div>

            <div className={styles.copy}>
              <div className={styles.meta}>
                <span className={`font-nunito ${styles.pill}`} style={{ background: c.color }}>
                  {c.essenceEmoji} {c.essence}
                </span>
                <span className={`font-nunito ${styles.age}`}>
                  {/^\d/.test(c.age) ? `Age ${c.age}` : c.age}
                </span>
              </div>

              <div>
                <div className={`font-nunito ${styles.role}`} style={{ color: c.color }}>
                  {c.role}
                </div>
                <h2 className={`font-fredoka ${styles.name}`}>{c.name}</h2>
                <p className={`font-nunito ${styles.tagline}`} style={{ color: c.color }}>
                  &ldquo;{c.tagline}&rdquo;
                </p>
              </div>

              <p className={`font-nunito ${styles.bio}`}>{c.description}</p>

              <div className={styles.traits}>
                {c.traits.map((t) => (
                  <span
                    key={t}
                    className={`font-nunito ${styles.trait}`}
                    style={{
                      background: c.colorLight,
                      border: `1px solid ${c.color}55`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div
                className={styles.facts}
                style={{
                  background: c.colorLight,
                  border: `1px solid ${c.color}33`,
                }}
              >
                <div className={`font-nunito ${styles.fact}`}>
                  <span style={{ color: c.color, fontWeight: 700 }}>Super Strengths:</span> {c.strengths}
                </div>
                <div className={`font-nunito ${styles.fact}`}>
                  <span style={{ color: c.color, fontWeight: 700 }}>Still Working On:</span> {c.challenge}
                </div>
                <div className={`font-nunito ${styles.fact}`}>
                  <span style={{ color: c.color, fontWeight: 700 }}>Fun Fact:</span> {c.funFact}
                </div>
              </div>

              <Link
                href="/worlds"
                className={`zone-btn font-fredoka ${styles.cta}`}
                style={{ background: c.color, color: "#fff" }}
              >
                Adventure with {c.name} →
              </Link>
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
          <Link href="/worlds" className="btn-hero-primary">▶ &nbsp;Start Free Today</Link>
        </div>
      </section>
    </>
  );
}
