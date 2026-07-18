"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Calculator, Heart, Globe, Lightbulb, ChevronRight, Gamepad2 } from "lucide-react";
import { getWorldBySlug } from "@/lib/worlds";
import { getWorldContext } from "@/data/lms/worlds-context";
import { getAcademicGamesForWorld } from "@/data/games/catalog";

export default function WorldDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const world = getWorldBySlug(slug);
  const context = getWorldContext(slug);
  const academicGames = getAcademicGamesForWorld(slug);

  if (!world) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", padding: "2rem" }}>
        <p className="font-nunito" style={{ color: "#6b7280" }}>World not found.</p>
        <Link href="/worlds" className="font-fredoka" style={{ color: "var(--primary)" }}>← Back to Choose Your World</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f9ff" }}>
      {/* Back link */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        <Link
          href="/worlds"
          className="font-nunito"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#0369a1",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
          }}
        >
          <ArrowLeft style={{ width: "1.1rem", height: "1.1rem" }} />
          Back to all worlds
        </Link>
      </div>

      {/* Hero for this world */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: world.gradient,
            color: world.textColor,
            border: `3px solid ${world.borderColor}`,
            borderRadius: "1.5rem",
            padding: "2.5rem",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            {slug === "aqua-azul" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/aqua-azul-logo.png"
                alt="The Lost City of Aqua Azul logo"
                style={{
                  width: "clamp(120px, 20vw, 200px)",
                  height: "auto",
                  borderRadius: "1rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
              />
            ) : slug === "fossil-frontier" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/fossil-frontier-logo.png"
                alt="Fossil Frontier logo"
                style={{
                  width: "clamp(120px, 20vw, 200px)",
                  height: "auto",
                  borderRadius: "1rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
              />
            ) : slug === "crystal-tundra" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/crystal-tundra-logo.png"
                alt="The Crystal Tundra logo"
                style={{
                  width: "clamp(120px, 20vw, 200px)",
                  height: "auto",
                  borderRadius: "1rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <span style={{ fontSize: "4rem" }}>{world.emoji}</span>
            )}
            <div style={{ flex: 1, minWidth: "200px" }}>
              {world.isCentralHub && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.9)",
                    color: world.borderColor,
                    marginBottom: "0.75rem",
                  }}
                >
                  Central Hub
                </span>
              )}
              <h1 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 400, margin: "0 0 0.5rem", lineHeight: 1.2 }}>
                {world.name}
              </h1>
              <p style={{ fontSize: "1rem", opacity: 0.95, marginBottom: "1rem", fontWeight: 600 }}>
                {world.tagline}
              </p>
              <p className="font-nunito" style={{ fontSize: "1.05rem", lineHeight: 1.6, margin: 0, opacity: 0.95 }}>
                {world.description}
              </p>
            </div>
          </div>
        </div>

        {/* World video — when this world has a Vimeo video, show it here */}
        {world.vimeoId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              marginTop: "1.5rem",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              aspectRatio: "16/9",
              maxWidth: "100%",
              background: "#000",
            }}
          >
            <iframe
              src={`https://player.vimeo.com/video/${world.vimeoId}?badge=0&autopause=0&byline=0&portrait=0&title=0`}
              allow="autoplay; fullscreen; picture-in-picture"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title={world.name}
            />
          </motion.div>
        )}

        {/* ── Academic Adventures in this world ── */}
        {academicGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{
              background: "#fff",
              borderRadius: "1.25rem",
              border: "2px solid #0d6b73",
              boxShadow: "0 4px 24px rgba(13,107,115,0.12)",
              padding: "1.75rem",
              marginTop: "1.5rem",
            }}
          >
            <p
              className="font-nunito"
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#0d6b73",
                margin: "0 0 0.35rem",
              }}
            >
              Academic Adventures
            </p>
            <h2 className="font-fredoka" style={{ fontSize: "1.25rem", color: "#1a0a40", margin: "0 0 0.35rem" }}>
              Learn while you play in {world.name}
            </h2>
            <p className="font-nunito" style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0 0 1.1rem", lineHeight: 1.5 }}>
              These learning games belong to this world — real curriculum questions, real points.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {academicGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.9rem 1rem",
                    borderRadius: "0.9rem",
                    background: "linear-gradient(135deg, rgba(46,230,239,0.12), rgba(13,107,115,0.08))",
                    border: "1px solid rgba(13,107,115,0.25)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span style={{ fontSize: "1.75rem", lineHeight: 1 }} aria-hidden>
                    {game.emoji}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-fredoka" style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>
                      {game.title}
                    </p>
                    <p className="font-nunito" style={{ margin: "0.15rem 0 0", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.4 }}>
                      {game.description}
                    </p>
                  </div>
                  <span
                    className="font-nunito"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      flexShrink: 0,
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: "#0d6b73",
                    }}
                  >
                    <Gamepad2 style={{ width: "0.95rem", height: "0.95rem" }} />
                    Play
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Module 1 Mission Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "#fff",
            borderRadius: "1.25rem",
            border: "2px solid #a855f7",
            boxShadow: "0 4px 24px rgba(124,34,197,0.12)",
            padding: "2rem",
            marginTop: "1.5rem",
          }}
        >
          {/* Module header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ background: "linear-gradient(135deg,#7c22c5,#a855f7)", borderRadius: "0.75rem", padding: "0.55rem 1rem", flexShrink: 0 }}>
              <span className="font-fredoka" style={{ color: "#fff", fontSize: "0.9rem" }}>Module 1</span>
            </div>
            <div>
              <p className="font-nunito" style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a855f7", margin: 0 }}>
                Your Next Mission
              </p>
              <h2 className="font-fredoka" style={{ fontSize: "1.35rem", color: "#1a0a40", margin: 0 }}>
                {context?.missionTitle ?? "Begin Your Adventure"}
              </h2>
            </div>
          </div>

          {/* Skills breakdown */}
          {context && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.75rem" }}>
              <SkillRow icon={<Calculator style={{ width: "1rem", height: "1rem" }} />} label="STEM (40%) — Multiplication & Division" desc={context.stemContext} bg="#dcfce7" color="#15803d" />
              <SkillRow icon={<BookOpen style={{ width: "1rem", height: "1rem" }} />} label="ELA (20%) — Reading Comprehension" desc={context.elaContext} bg="#dbeafe" color="#1d4ed8" />
              <SkillRow icon={<Heart style={{ width: "1rem", height: "1rem" }} />} label="SEL (20%) — Overcoming Challenges" desc={context.selContext} bg="#fce7f3" color="#be185d" />
              <SkillRow icon={<Globe style={{ width: "1rem", height: "1rem" }} />} label="Culture (10%) — Building Community" desc={`Discover how people in ${world.name} create rules and work together.`} bg="#fef9c3" color="#854d0e" />
              <SkillRow icon={<Lightbulb style={{ width: "1rem", height: "1rem" }} />} label="Life Skills (10%) — Collaboration" desc={`Help the team of ${world.name} solve challenges by working as one.`} bg="#ede9fe" color="#6b21a8" />
            </div>
          )}

          {/* Start button */}
          <Link href={`/learn/module/1?world=${slug}`} style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%",
                padding: "1rem",
                background: "linear-gradient(135deg, #7c22c5, #a855f7)",
                color: "#fff",
                border: "none",
                borderRadius: "0.9rem",
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 20px rgba(124,34,197,0.35)",
              }}
            >
              Start Module 1 in {world.name} <ChevronRight style={{ width: "1.25rem", height: "1.25rem" }} />
            </motion.button>
          </Link>

          <p className="font-nunito" style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.82rem", marginTop: "0.85rem", marginBottom: 0 }}>
            🔄 Switch worlds anytime — your progress saves automatically.
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}

function SkillRow({ icon, label, desc, bg, color }: { icon: React.ReactNode; label: string; desc: string; bg: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", background: bg, borderRadius: "0.75rem", padding: "0.85rem 1rem" }}>
      <div style={{ color, marginTop: "0.1rem", flexShrink: 0 }}>{icon}</div>
      <div>
        <p className="font-nunito" style={{ fontSize: "0.75rem", fontWeight: 800, color, margin: "0 0 0.2rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p className="font-nunito" style={{ fontSize: "0.88rem", color: "#374151", margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}
