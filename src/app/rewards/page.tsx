"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Star, Lock, Check } from "lucide-react";

type StoreItem = {
  id: string;
  label: string;
  description: string;
  category: string;
  tier: number;
  price: number;
  owned: boolean;
  canAfford: boolean;
};

type StoreData = {
  balance: number;
  items: StoreItem[];
};

const TIER_COLORS: Record<number, { bg: string; border: string; badge: string }> = {
  1: { bg: "#f0fdf4", border: "#86efac", badge: "#16a34a" },
  2: { bg: "#eff6ff", border: "#93c5fd", badge: "#2563eb" },
  3: { bg: "#faf5ff", border: "#c4b5fd", badge: "#7c3aed" },
  4: { bg: "#fff7ed", border: "#fdba74", badge: "#ea580c" },
  5: { bg: "#fef9c3", border: "#fde047", badge: "#ca8a04" },
};

const TIER_LABELS: Record<number, string> = {
  1: "Quick Win",
  2: "Mission Gear",
  3: "Elite",
  4: "Exploration",
  5: "Legendary",
};

const CATEGORY_EMOJI: Record<string, string> = {
  cosmetic:    "🎨",
  collection:  "🃏",
  story:       "📖",
  exploration: "🗺️",
  special:     "⚡",
};

export default function RewardsPage() {
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadStore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rewards/store");
      if (res.status === 401) { setError("Please sign in to view the reward store."); return; }
      if (res.status === 403) { setError("The reward store is for students only."); return; }
      if (!res.ok) { setError("Could not load the store right now."); return; }
      setData(await res.json() as StoreData);
    } catch {
      setError("Something went wrong loading the store.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStore(); }, [loadStore]);

  const handleRedeem = async (item: StoreItem) => {
    if (!item.canAfford || redeeming) return;
    setRedeeming(item.id);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const json = await res.json() as { success?: boolean; newBalance?: number; error?: string };
      if (json.success) {
        showToast(`✓ You got: ${item.label}!`, true);
        await loadStore();
      } else {
        showToast(json.error === "insufficient_balance" ? "Not enough points!" : "Could not redeem right now.", false);
      }
    } catch {
      showToast("Something went wrong.", false);
    } finally {
      setRedeeming(null);
    }
  };

  const displayedItems = data
    ? filterTier === null
      ? data.items
      : data.items.filter((i) => i.tier === filterTier)
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0a2e 0%, #1a0a50 40%, #0e1a40 100%)" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)",
          padding: "0.75rem 1.5rem", borderRadius: "999px", zIndex: 50,
          background: toast.ok ? "#16a34a" : "#dc2626", color: "#fff",
          fontFamily: "var(--font-nunito, sans-serif)", fontWeight: 700, fontSize: "0.95rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "2.5rem 1.5rem 1.5rem", maxWidth: "880px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ShoppingBag style={{ color: "#f5c518", width: "2rem", height: "2rem" }} />
            <h1 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#fff", margin: 0 }}>
              Reward Store
            </h1>
          </div>
          {data && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(245,197,24,0.15)", border: "2px solid rgba(245,197,24,0.4)",
              borderRadius: "999px", padding: "0.5rem 1.25rem",
            }}>
              <Sparkles style={{ color: "#f5c518", width: "1.2rem", height: "1.2rem" }} />
              <span className="font-fredoka" style={{ color: "#f5c518", fontSize: "1.3rem" }}>
                {data.balance.toLocaleString()} pts
              </span>
            </div>
          )}
        </div>
        <p className="font-nunito" style={{ color: "rgba(255,255,255,0.65)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Earn points by passing gates and completing missions. Spend them here.
        </p>
      </div>

      {/* Filter bar */}
      {data && (
        <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 1.5rem 1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterTier(null)}
            className="font-nunito"
            style={{
              padding: "0.4rem 1rem", borderRadius: "999px", border: "2px solid",
              borderColor: filterTier === null ? "#f5c518" : "rgba(255,255,255,0.2)",
              background: filterTier === null ? "rgba(245,197,24,0.15)" : "transparent",
              color: filterTier === null ? "#f5c518" : "rgba(255,255,255,0.7)",
              cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
            }}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t === filterTier ? null : t)}
              className="font-nunito"
              style={{
                padding: "0.4rem 1rem", borderRadius: "999px", border: "2px solid",
                borderColor: filterTier === t ? TIER_COLORS[t].badge : "rgba(255,255,255,0.2)",
                background: filterTier === t ? `${TIER_COLORS[t].badge}22` : "transparent",
                color: filterTier === t ? TIER_COLORS[t].badge : "rgba(255,255,255,0.7)",
                cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
              }}
            >
              T{t} · {TIER_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        {loading && (
          <p className="font-nunito" style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", paddingTop: "4rem" }}>
            Loading store…
          </p>
        )}

        {error && (
          <div style={{
            background: "rgba(220,38,38,0.15)", border: "2px solid rgba(220,38,38,0.4)",
            borderRadius: "1rem", padding: "2rem", textAlign: "center",
          }}>
            <p className="font-nunito" style={{ color: "#fca5a5", marginBottom: "1rem" }}>{error}</p>
            <Link href="/account/login" style={{ color: "#f5c518", fontWeight: 700, textDecoration: "underline" }}>
              Sign in
            </Link>
          </div>
        )}

        {!loading && !error && displayedItems.length === 0 && (
          <p className="font-nunito" style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", paddingTop: "3rem" }}>
            No items in this tier yet.
          </p>
        )}

        {!loading && !error && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.25rem",
          }}>
            {displayedItems.map((item) => {
              const colors = TIER_COLORS[item.tier];
              const isRedeeming = redeeming === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    background: item.owned ? "rgba(255,255,255,0.05)" : colors.bg,
                    border: `2px solid ${item.owned ? "rgba(255,255,255,0.12)" : colors.border}`,
                    borderRadius: "1.25rem",
                    padding: "1.25rem",
                    opacity: item.owned ? 0.75 : 1,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                >
                  {/* Category + tier badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <span style={{ fontSize: "1.6rem" }}>{CATEGORY_EMOJI[item.category] ?? "🎁"}</span>
                    <span style={{
                      background: colors.badge, color: "#fff",
                      borderRadius: "999px", padding: "0.2rem 0.7rem",
                      fontSize: "0.72rem", fontWeight: 800, fontFamily: "var(--font-nunito, sans-serif)",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {TIER_LABELS[item.tier]}
                    </span>
                  </div>

                  <h3 className="font-fredoka" style={{ fontSize: "1.1rem", color: "#1a0a40", margin: "0 0 0.25rem" }}>
                    {item.label}
                  </h3>
                  <p className="font-nunito" style={{ fontSize: "0.82rem", color: "#374151", margin: "0 0 1rem", lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  {/* Price + action */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Star style={{ width: "1rem", height: "1rem", color: "#f5c518" }} />
                      <span className="font-fredoka" style={{ fontSize: "1.1rem", color: "#1a0a40" }}>
                        {item.price} pts
                      </span>
                    </div>

                    {item.owned ? (
                      <span style={{
                        display: "flex", alignItems: "center", gap: "0.3rem",
                        color: "#16a34a", fontWeight: 700, fontSize: "0.85rem",
                        fontFamily: "var(--font-nunito, sans-serif)",
                      }}>
                        <Check style={{ width: "1rem", height: "1rem" }} /> Owned
                      </span>
                    ) : item.canAfford ? (
                      <button
                        onClick={() => void handleRedeem(item)}
                        disabled={isRedeeming}
                        className="font-nunito"
                        style={{
                          padding: "0.4rem 1rem", borderRadius: "999px", border: "none",
                          background: colors.badge, color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                          cursor: isRedeeming ? "wait" : "pointer", opacity: isRedeeming ? 0.7 : 1,
                        }}
                      >
                        {isRedeeming ? "…" : "Get it"}
                      </button>
                    ) : (
                      <span style={{
                        display: "flex", alignItems: "center", gap: "0.3rem",
                        color: "#9ca3af", fontSize: "0.82rem",
                        fontFamily: "var(--font-nunito, sans-serif)",
                      }}>
                        <Lock style={{ width: "0.9rem", height: "0.9rem" }} />
                        {(data?.balance ?? 0) < item.price
                          ? `Need ${item.price - (data?.balance ?? 0)} more`
                          : "Locked"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sanctuary teaser */}
        {data && (
          <div style={{
            marginTop: "3rem",
            background: "rgba(124,34,197,0.15)",
            border: "2px solid rgba(124,34,197,0.35)",
            borderRadius: "1.5rem",
            padding: "2rem",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}>🦋</p>
            <h2 className="font-fredoka" style={{ color: "#e9d5ff", fontSize: "1.35rem", marginBottom: "0.5rem" }}>
              Butterfly Sanctuary
            </h2>
            <p className="font-nunito" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Earn butterfly species by mastering skill domains during your placement and missions.
            </p>
            <Link
              href="/rewards/sanctuary"
              className="font-nunito"
              style={{
                display: "inline-block",
                padding: "0.6rem 1.4rem",
                borderRadius: "999px",
                background: "#7c22c5",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              View Sanctuary
            </Link>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/learn" className="font-nunito" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            ← Back to Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
