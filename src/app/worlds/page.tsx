"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Compass, Map, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

// Load WorldGlobe only on the client — it uses WebGL / Three.js
const WorldGlobe = dynamic(() => import("@/components/WorldGlobe"), { ssr: false });

export default function WorldsPage() {
  const [showWorlds, setShowWorlds] = useState(true);
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(to right, #7c22c5, #e8357a, #7c22c5)" }}
      >
        <div className="container mx-auto px-4 py-12 pt-28 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Chip */}
            <span
              className="inline-flex items-center gap-1.5 text-sm font-bold font-nunito px-4 py-1.5 rounded-full mb-4"
              style={{ background: "#f5c518", color: "#1a0a40" }}
            >
              <Compass className="w-4 h-4" /> CHOOSE YOUR WORLD
            </span>

            {/* Heading */}
            <h1 className="font-fredoka text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3" style={{ fontWeight: 400 }}>
              Let&apos;s Go! Your Adventure Awaits{" "}
              <Sparkles className="inline w-8 h-8" style={{ color: "#f5c518" }} />
            </h1>

            {/* Subtext */}
            <p className="text-lg font-nunito max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.82)" }}>
              Explore the galaxy map and pick a world to start your next adventure!
            </p>

          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
            <path
              d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,30 1440,30 L1440,60 L0,60 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ── Toggle strip — sits between hero and map, always fully visible ── */}
      <div style={{ background: "#fff", padding: "1.25rem 1rem 0.75rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowWorlds((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            borderRadius: "999px",
            background: showWorlds ? "#7c22c5" : "#f5c518",
            color: showWorlds ? "#fff" : "#1a0a40",
            fontFamily: "'Fredoka One', cursive",
            fontSize: "1.05rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          }}
        >
          {showWorlds
            ? <Map style={{ width: "1.15rem", height: "1.15rem" }} />
            : <Globe style={{ width: "1.15rem", height: "1.15rem" }} />}
          {showWorlds ? "Map only (hide worlds)" : "Show worlds"}
        </button>
      </div>

      {/* 3D Globe */}
      <section className="py-4 md:py-8">
        <div className="container mx-auto px-4">

          <Suspense
            fallback={
              <div
                className="flex items-center justify-center"
                style={{
                  height: "95vh",
                  minHeight: 720,
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                  backgroundImage: "url('/worlds-map.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="text-center">
                  <div
                    className="animate-spin w-10 h-10 border-4 rounded-full mx-auto mb-4"
                    style={{ borderColor: "rgba(168,85,247,0.6)", borderTopColor: "#f5c518" }}
                  />
                  <p className="font-nunito" style={{ color: "rgba(255,255,255,0.7)" }}>Loading your universe…</p>
                </div>
              </div>
            }
          >
            <WorldGlobe showWorlds={showWorlds} onShowWorldsChange={setShowWorlds} />
          </Suspense>

          <div className="text-center mt-8 mb-8">
            <Link href="/">
              <Button variant="outline" className="font-fredoka rounded-full px-8 py-5">
                ← Back to Home
              </Button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
