"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { worlds } from "@/lib/worlds";

// The Aqua Azul illustration image
import aquaAzulImg from "@/assets/images/The Lost Cit of Aqua Azul Icon.png";

// Vimeo video ID for each world (only Aqua Azul for now — add others later)
const worldVideos: Record<string, string> = {
  "aqua-azul": "1169180228",
};

export default function WorldsGrid() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {worlds.map((world, i) => {
        const isAqua = world.slug === "aqua-azul";
        const videoId = worldVideos[world.slug];
        const isHovered = hoveredSlug === world.slug;

        return (
          <motion.div
            key={world.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Link
              href={`/worlds/${world.slug}`}
              className="block h-full"
              onMouseEnter={() => setHoveredSlug(world.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
            >
              <div
                className="world-card relative rounded-2xl overflow-hidden border-2 h-full flex flex-col cursor-pointer transition-all"
                style={{
                  borderColor: world.borderColor,
                  borderWidth: world.isCentralHub ? 3 : 2,
                  minHeight: "260px",
                  boxShadow: world.isCentralHub
                    ? "0 12px 40px rgba(139, 92, 246, 0.35)"
                    : isHovered
                    ? "0 16px 48px rgba(0,0,0,0.25)"
                    : "0 8px 24px rgba(0,0,0,0.12)",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                {/* ── Background layer ── */}
                {isAqua ? (
                  <>
                    {/* Illustration image always visible */}
                    <Image
                      src={aquaAzulImg}
                      alt="The Lost City of Aqua Azul"
                      fill
                      className="object-cover object-center"
                      style={{
                        opacity: isHovered && videoId ? 0 : 1,
                        transition: "opacity 0.4s ease",
                        zIndex: 0,
                      }}
                    />
                    {/* Vimeo background video — only mounts when hovered */}
                    {isHovered && videoId && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          zIndex: 1,
                          pointerEvents: "none",
                          overflow: "hidden",
                        }}
                      >
                        <iframe
                          src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&byline=0&portrait=0&background=1&autoplay=1&loop=1&muted=1`}
                          allow="autoplay; fullscreen"
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "200%",
                            height: "200%",
                            transform: "translate(-50%, -50%)",
                            border: "none",
                          }}
                          title="The Lost City of Aqua Azul"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* All other worlds: gradient background */
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: world.gradient,
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Dark overlay for readability */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isAqua
                      ? "linear-gradient(to top, rgba(0,30,60,0.88) 0%, rgba(0,30,60,0.4) 50%, rgba(0,0,0,0.1) 100%)"
                      : "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)",
                    zIndex: 2,
                  }}
                />

                {/* ── Card content ── */}
                <div
                  className="relative flex flex-col p-5 h-full"
                  style={{ zIndex: 3, color: isAqua ? "#fff" : world.textColor }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-4xl">{world.emoji}</span>
                    {world.isCentralHub && (
                      <span
                        className="text-xs font-extrabold uppercase tracking-wider py-1.5 px-3 rounded-full"
                        style={{ background: "rgba(255,255,255,0.95)", color: "#5b21b6" }}
                      >
                        Central Hub
                      </span>
                    )}
                  </div>
                  <h2
                    className="font-fredoka text-xl mt-3 mb-1"
                    style={{ fontWeight: 400, color: isAqua ? "#fff" : world.textColor }}
                  >
                    {world.name}
                  </h2>
                  <p
                    className="text-sm font-semibold mb-2"
                    style={{ opacity: 0.9, color: isAqua ? "rgba(255,255,255,0.85)" : world.textColor }}
                  >
                    {world.tagline}
                  </p>
                  <p
                    className="font-nunito text-sm leading-relaxed mt-auto"
                    style={{ opacity: isAqua ? 0.9 : 0.95, color: isAqua ? "rgba(255,255,255,0.85)" : world.textColor }}
                  >
                    {world.description}
                  </p>

                  {/* Hover CTA */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      <span
                        className="inline-block font-fredoka text-sm px-4 py-1.5 rounded-full"
                        style={{
                          background: isAqua ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.35)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.4)",
                          color: isAqua ? "#fff" : world.textColor,
                        }}
                      >
                        Enter this world →
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
