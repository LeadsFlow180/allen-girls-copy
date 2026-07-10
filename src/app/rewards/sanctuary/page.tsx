"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ButterflyDisplay = {
  key: string;
  label: string;
  emoji: string;
  domain: string;
  tier: string;
  earned: boolean;
};

type Stamp = {
  skill_id: string;
  domain: string;
  tier: string;
  earned_at: string;
};

type SanctuaryData = {
  butterflies: { species_key: string; label: string; earned_at: string }[];
  allSpecies: ButterflyDisplay[];
  stamps: Stamp[];
};

const DOMAIN_COLORS: Record<string, string> = {
  ela:  "#7c22c5",
  math: "#0ea5e9",
};

const TIER_LABELS: Record<string, string> = {
  emerging: "Emerging",
  on_track: "On Track",
  stretch:  "Stretch",
};

export default function SanctuaryPage() {
  const [data, setData] = useState<SanctuaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rewards/sanctuary");
        if (res.status === 401) { setError("Sign in to see your sanctuary."); return; }
        if (res.status === 403) { setError("Sanctuary is for students only."); return; }
        if (!res.ok) { setError("Could not load sanctuary."); return; }
        setData(await res.json() as SanctuaryData);
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const earned = data?.allSpecies.filter((s) => s.earned) ?? [];
  const locked = data?.allSpecies.filter((s) => !s.earned) ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0028 0%, #200040 60%, #001830 100%)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "3rem", margin: "0 0 0.5rem" }}>🦋</p>
          <h1 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#e9d5ff", margin: 0 }}>
            Butterfly Sanctuary
          </h1>
          <p className="font-nunito" style={{ color: "rgba(255,255,255,0.55)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
            Each butterfly you earn represents a skill domain you've mastered.
          </p>
        </div>

        {loading && (
          <p className="font-nunito" style={{ color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Loading…</p>
        )}

        {error && (
          <div style={{ background: "rgba(220,38,38,0.15)", borderRadius: "1rem", padding: "2rem", textAlign: "center" }}>
            <p className="font-nunito" style={{ color: "#fca5a5", marginBottom: "1rem" }}>{error}</p>
            <Link href="/account/login" style={{ color: "#c4b5fd", fontWeight: 700 }}>Sign in</Link>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Progress bar */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", marginBottom: "0.4rem",
              }}>
                <span className="font-nunito" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                  Species collected
                </span>
                <span className="font-nunito" style={{ color: "#c4b5fd", fontWeight: 700, fontSize: "0.85rem" }}>
                  {earned.length} / {data.allSpecies.length}
                </span>
              </div>
              <div style={{ height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${data.allSpecies.length ? (earned.length / data.allSpecies.length) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #7c22c5, #e8357a)",
                  borderRadius: "999px",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>

            {/* Earned butterflies */}
            {earned.length > 0 && (
              <section style={{ marginBottom: "2.5rem" }}>
                <h2 className="font-fredoka" style={{ color: "#c4b5fd", fontSize: "1.2rem", marginBottom: "1rem" }}>
                  Your collection
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {earned.map((s) => (
                    <div key={s.key} style={{
                      background: "rgba(124,34,197,0.2)",
                      border: "2px solid rgba(196,181,253,0.4)",
                      borderRadius: "1.25rem",
                      padding: "1.25rem",
                      textAlign: "center",
                    }}>
                      <p style={{ fontSize: "2.5rem", margin: "0 0 0.5rem" }}>{s.emoji}</p>
                      <p className="font-fredoka" style={{ color: "#e9d5ff", fontSize: "1.05rem", margin: "0 0 0.25rem" }}>
                        {s.label}
                      </p>
                      <p className="font-nunito" style={{ fontSize: "0.75rem", margin: 0 }}>
                        <span style={{
                          background: DOMAIN_COLORS[s.domain] ?? "#6b7280",
                          color: "#fff",
                          borderRadius: "999px",
                          padding: "0.15rem 0.6rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                        }}>
                          {s.domain.toUpperCase()}
                        </span>
                        {" "}
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>
                          {TIER_LABELS[s.tier] ?? s.tier}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Locked butterflies */}
            {locked.length > 0 && (
              <section style={{ marginBottom: "2.5rem" }}>
                <h2 className="font-fredoka" style={{ color: "rgba(255,255,255,0.35)", fontSize: "1.1rem", marginBottom: "1rem" }}>
                  Still to discover
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {locked.map((s) => (
                    <div key={s.key} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "2px solid rgba(255,255,255,0.1)",
                      borderRadius: "1.25rem",
                      padding: "1.25rem",
                      textAlign: "center",
                      opacity: 0.55,
                    }}>
                      <p style={{ fontSize: "2.5rem", margin: "0 0 0.5rem", filter: "grayscale(1)" }}>{s.emoji}</p>
                      <p className="font-fredoka" style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.05rem", margin: "0 0 0.25rem" }}>
                        {s.label}
                      </p>
                      <p className="font-nunito" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                        {s.domain.toUpperCase()} · {TIER_LABELS[s.tier] ?? s.tier}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Passport stamps */}
            {data.stamps.length > 0 && (
              <section>
                <h2 className="font-fredoka" style={{ color: "#fde68a", fontSize: "1.2rem", marginBottom: "1rem" }}>
                  Skill Passport
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {data.stamps.map((st) => (
                    <span key={st.skill_id} style={{
                      background: DOMAIN_COLORS[st.domain] ?? "#374151",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "0.3rem 0.9rem",
                      fontSize: "0.8rem",
                      fontFamily: "var(--font-nunito, sans-serif)",
                      fontWeight: 700,
                    }}>
                      {st.skill_id} · {TIER_LABELS[st.tier] ?? st.tier}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {earned.length === 0 && locked.length > 0 && (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <p className="font-nunito" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95rem" }}>
                  Complete your placement assessment to earn your first butterfly!
                </p>
                <Link
                  href="/learn/placement"
                  style={{
                    display: "inline-block", marginTop: "1rem",
                    padding: "0.65rem 1.5rem", borderRadius: "999px",
                    background: "#7c22c5", color: "#fff", textDecoration: "none",
                    fontWeight: 700, fontFamily: "var(--font-nunito, sans-serif)",
                  }}
                >
                  Take Placement →
                </Link>
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/rewards" className="font-nunito" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
