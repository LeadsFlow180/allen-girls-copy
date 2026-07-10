"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type GateType = "crisis" | "discovery";

type GateResponse = {
  gateType: GateType;
  passed: boolean;
  score: number;
  feedback: string;
  sparkMode: string;
  latencyMs: number;
  usedFallbackPath: boolean;
};

export default function LearnGatesPage() {
  const [gateType, setGateType] = useState<GateType>("crisis");
  const [attemptCount, setAttemptCount] = useState(1);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GateResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const prompt = useMemo(() => {
    if (gateType === "crisis") {
      return "Crisis Gate: In one sentence, explain why checking clues carefully helps on a mission.";
    }
    return "Discovery Gate: Explain your reasoning for how the team should choose the safer path when clues conflict.";
  }, [gateType]);

  const expectedKeywords = useMemo(() => {
    if (gateType === "crisis") return ["clue", "careful", "mission"];
    return ["evidence", "reason", "safer", "path"];
  }, [gateType]);

  async function evaluate() {
    setErr(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/gates/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateType,
          prompt,
          answer,
          expectedKeywords,
          attemptCount,
          nickname: "Recruit",
        }),
      });
      if (!res.ok) {
        setErr("Gate evaluation failed.");
        return;
      }
      const data = (await res.json()) as GateResponse;
      setResult(data);

      await fetch("/api/mission/checkpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: "phase4-demo-mission",
          checkpointType: "gate_complete",
          gateType,
          payload: {
            attemptCount,
            passed: data.passed,
            score: data.score,
            usedFallbackPath: data.usedFallbackPath,
          },
        }),
      });
    } catch {
      setErr("Could not reach gate service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell kid-shell">
      <section className="page-header">
        <p className="eyebrow">Mission Gates</p>
        <h1 className="page-title">Gate Lab (Phase 4)</h1>
        <p className="page-subtitle">Run Crisis and Discovery gates with checkpoint logging.</p>
      </section>

      <section className="space-y-4" style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className="path-step">
          <span className="path-step-number">1</span>
          <div style={{ width: "100%" }}>
            <h2 className="path-step-title">Choose gate</h2>
            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              <button className="nav-btn-primary" onClick={() => setGateType("crisis")} type="button">
                Crisis Gate
              </button>
              <button className="nav-btn-primary" onClick={() => setGateType("discovery")} type="button">
                Discovery Gate
              </button>
              <label className="font-nunito" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Attempt:
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={attemptCount}
                  onChange={(e) => setAttemptCount(Number(e.target.value) || 1)}
                  style={{ width: 70 }}
                />
              </label>
            </div>
            <p className="path-step-text" style={{ marginTop: 10 }}>
              <strong>Prompt:</strong> {prompt}
            </p>
          </div>
        </div>

        <div className="path-step">
          <span className="path-step-number">2</span>
          <div style={{ width: "100%" }}>
            <h2 className="path-step-title">Answer</h2>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="font-nunito"
              style={{ width: "100%", borderRadius: 12, border: "2px solid #cbd5e1", padding: 12 }}
              placeholder="Type your gate response..."
            />
            <button
              className="nav-btn-primary"
              style={{ marginTop: 12 }}
              type="button"
              onClick={evaluate}
              disabled={!answer.trim() || loading}
            >
              {loading ? "Evaluating..." : "Run Gate"}
            </button>
            {err && <p style={{ color: "#b91c1c", marginTop: 8 }}>{err}</p>}
          </div>
        </div>

        {result && (
          <div className="path-step">
            <span className="path-step-number">{result.passed ? "✓" : "!"}</span>
            <div>
              <h2 className="path-step-title">Result</h2>
              <p className="path-step-text">
                <strong>Status:</strong> {result.passed ? "Passed" : "Not passed yet"} | <strong>Score:</strong> {result.score} |{" "}
                <strong>Mode:</strong> {result.sparkMode}
              </p>
              <p className="path-step-text">
                <strong>Latency:</strong> {result.latencyMs}ms | <strong>Fallback path:</strong>{" "}
                {result.usedFallbackPath ? "Yes" : "No"}
              </p>
              <p className="path-step-text">{result.feedback}</p>
            </div>
          </div>
        )}
      </section>

      <p className="font-nunito" style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/learn" style={{ color: "var(--accent)", fontWeight: 700 }}>
          ← Back to Kid World
        </Link>
      </p>
    </main>
  );
}
