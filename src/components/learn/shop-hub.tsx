"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, ShoppingBag, Sparkles, Star, Zap } from "lucide-react";

import exploreGameBg from "@/assets/images/learn/explore-game-background.png";
import pointsIcon from "@/assets/images/learn/points.svg";

import { StoreItemIcon } from "@/components/store/store-item-icon";
import {
  SHOP_CATALOG,
  type ShopCatalogItem,
  type ShopItemKind,
} from "@/lib/learn/shop-catalog";
import {
  getShopOwned,
  purchaseShopItem,
  type PurchaseResult,
  type ShopOwnedState,
} from "@/lib/learn/shop-state";
import { useLearnProgress } from "@/lib/learn/use-learn-progress";

import styles from "./shop-hub.module.css";

type ShopFilter = "all" | ShopItemKind;

const EMPTY_OWNED: ShopOwnedState = { badges: [], boosts: [] };

function isOwnedInState(item: ShopCatalogItem, owned: ShopOwnedState): boolean {
  if (item.kind === "badge") return owned.badges.includes(item.id);
  if (item.kind === "boost") return owned.boosts.includes(item.id);
  return false;
}

const STAR_POSITIONS = [
  { top: "14%", left: "10%" },
  { top: "24%", left: "82%" },
  { top: "10%", left: "48%" },
  { top: "32%", left: "18%" },
  { top: "38%", left: "90%" },
];

const TIER_LABELS: Record<number, string> = {
  1: "Common",
  2: "Rare",
  3: "Epic",
  4: "Legend",
  5: "Mythic",
};

const KIND_EMOJI: Record<ShopItemKind, string> = {
  badge: "🏅",
  gem_bundle: "💎",
  boost: "⚡",
};

const FILTER_TABS: { key: ShopFilter; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "🛍️" },
  { key: "badge", label: "Badges", emoji: "🏅" },
  { key: "gem_bundle", label: "Vault", emoji: "💎" },
  { key: "boost", label: "Boosts", emoji: "⚡" },
];

const CONFETTI_COLORS = [
  "#58cc02",
  "#ffc800",
  "#1cb0f6",
  "#ff4b4b",
  "#a855f7",
  "#ff9600",
  "#e8357a",
];

function WorldBackdrop() {
  return (
    <div className={styles.skyDecor} aria-hidden>
      <Image
        src={exploreGameBg}
        alt=""
        fill
        className={styles.worldBg}
        sizes="100vw"
        priority
      />
      <div className={styles.sun} />
      <div className={`${styles.cloud} ${styles.cloudA}`} />
      <div className={`${styles.cloud} ${styles.cloudB}`} />
      <div className={`${styles.cloud} ${styles.cloudC}`} />
      {STAR_POSITIONS.map((pos, i) => (
        <span
          key={i}
          className={styles.star}
          style={{ ...pos, animationDelay: `${i * 0.35}s` }}
        />
      ))}
      <div className={styles.hillBack} />
      <div className={styles.hillFront} />
      <div className={styles.sparkleField} />
    </div>
  );
}

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 17) % 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (i % 8) * 0.06,
    rotate: (i * 47) % 360,
  }));

  return (
    <div className={styles.confettiLayer} aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: p.left,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function purchaseErrorMessage(result: Extract<PurchaseResult, { ok: false }>) {
  switch (result.error) {
    case "already_owned":
      return "Already in your treasure chest!";
    case "insufficient_gems":
      return "Need more gems — hit Quests & Trophies first!";
    case "insufficient_xp":
      return "Not enough XP for this exchange.";
    default:
      return "Purchase failed — try again.";
  }
}

function ShopCard({
  item,
  owned,
  walletGems,
  walletXp,
  onBuy,
}: {
  item: ShopCatalogItem;
  owned: boolean;
  walletGems: number;
  walletXp: number;
  onBuy: (id: string) => void;
}) {
  const isBundle = item.kind === "gem_bundle";
  const canAfford = isBundle
    ? walletXp >= (item.priceXp ?? 0)
    : walletGems >= item.priceGems;

  return (
    <motion.article
      className={[
        styles.card,
        styles[`tier${item.tier}` as keyof typeof styles],
        owned ? styles.cardOwned : "",
        item.featured ? styles.cardFeatured : "",
        canAfford && !owned ? styles.cardAffordable : "",
      ]
        .filter(Boolean)
        .join(" ")}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={owned ? undefined : { y: -5, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      style={{ "--shop-accent": item.accent } as CSSProperties}
      data-tier={item.tier}
    >
      {item.featured ? (
        <span className={`${styles.featuredRibbon} font-nunito`}>
          <Sparkles size={10} aria-hidden />
          Hot
        </span>
      ) : null}

      <span className={`${styles.kindChip} font-nunito`}>
        {KIND_EMOJI[item.kind]} {item.kind === "gem_bundle" ? "Vault" : item.kind}
      </span>

      <div className={styles.iconStage}>
        <div className={styles.iconGlow} aria-hidden />
        <motion.span
          className={styles.cardIcon}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <StoreItemIcon item={item} size="card" />
        </motion.span>
        <div className={styles.iconPedestal} aria-hidden />
      </div>

      <span className={`${styles.tierPill} font-nunito`}>
        {TIER_LABELS[item.tier]}
      </span>

      <h4 className={`${styles.cardTitle} font-fredoka`}>{item.title}</h4>
      <p className={`${styles.cardDesc} font-nunito`}>{item.description}</p>

      <div className={styles.cardFoot}>
        {owned ? (
          <span className={`${styles.ownedBadge} font-fredoka`}>⭐ Yours!</span>
        ) : (
          <>
            <span className={`${styles.price} font-nunito`}>
              {isBundle ? (
                <>
                  <Image src={pointsIcon} alt="" width={15} height={15} />
                  <strong>{item.priceXp}</strong> XP
                </>
              ) : (
                <>
                  <Gem size={14} strokeWidth={2.5} aria-hidden />
                  <strong>{item.priceGems}</strong>
                </>
              )}
            </span>
            <button
              type="button"
              data-ui-sound="claim"
              disabled={!canAfford}
              className={`${styles.buyBtn} font-fredoka`}
              onClick={() => onBuy(item.id)}
            >
              {isBundle ? "Exchange" : "Grab!"}
            </button>
          </>
        )}
      </div>
    </motion.article>
  );
}

export function ShopHub() {
  const router = useRouter();
  const { wallet, refresh, hydrated } = useLearnProgress();
  const [filter, setFilter] = useState<ShopFilter>("all");
  const [owned, setOwned] = useState<ShopOwnedState>(EMPTY_OWNED);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  const syncOwned = useCallback(() => {
    setOwned(getShopOwned());
  }, []);

  useEffect(() => {
    syncOwned();
    const onShop = () => {
      syncOwned();
      void refresh();
    };
    window.addEventListener("learn:shop-updated", onShop);
    window.addEventListener("learn:wallet-updated", onShop);
    return () => {
      window.removeEventListener("learn:shop-updated", onShop);
      window.removeEventListener("learn:wallet-updated", onShop);
    };
  }, [syncOwned, refresh]);

  const filtered = useMemo(() => {
    const list =
      filter === "all"
        ? SHOP_CATALOG
        : SHOP_CATALOG.filter((item) => item.kind === filter);
    return [...list].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.tier - b.tier;
    });
  }, [filter]);

  const ownedBadges = useMemo(
    () =>
      SHOP_CATALOG.filter(
        (item) => item.kind === "badge" && owned.badges.includes(item.id),
      ),
    [owned.badges],
  );

  const collectionPercent = Math.round(
    (owned.badges.length /
      Math.max(1, SHOP_CATALOG.filter((i) => i.kind === "badge").length)) *
      100,
  );

  const handleBuy = (id: string) => {
    const result = purchaseShopItem(id);
    if (!result.ok) {
      setToast(purchaseErrorMessage(result));
      return;
    }
    const label =
      result.item.kind === "gem_bundle"
        ? `💎 +${result.item.gemsGranted} gems in your vault!`
        : `🎉 ${result.item.title} unlocked!`;
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2600);
    setToast(label);
    syncOwned();
    void refresh();
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <section className={styles.page} aria-label="Gem Bazaar shop">
      <WorldBackdrop />
      <ConfettiBurst active={confetti} />

      <div className={styles.content}>
        <header className={styles.stage}>
          <div className={styles.signBoard}>
            <p className={`${styles.signEyebrow} font-nunito`}>Allen Girls</p>
            <h1 className={`${styles.signTitle} font-fredoka`}>Gem Bazaar</h1>
            <div className={styles.walletRow}>
              <span className={`${styles.orb} ${styles.orbGem} font-nunito`}>
                <Gem size={14} color="#0c4a6e" strokeWidth={2.5} />
                <strong>{wallet.gems}</strong>
              </span>
              <span className={`${styles.orb} ${styles.orbXp} font-nunito`}>
                <Image src={pointsIcon} alt="" width={14} height={14} />
                <strong>{wallet.xp}</strong>
              </span>
              <button
                type="button"
                className={`${styles.earnLink} font-nunito`}
                onClick={() => router.push("/learn/quests")}
              >
                <Zap size={12} aria-hidden />
                Earn
              </button>
            </div>
          </div>

          <div className={styles.vaultMascot} aria-hidden>
            <div className={styles.vaultGlow} />
            <motion.div
              className={styles.vaultFloat}
              animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShoppingBag size={48} color="#fde047" fill="#fbbf24" strokeWidth={2} />
              <Gem size={22} className={styles.vaultGem} color="#67e8f9" fill="#a5f3fc" />
            </motion.div>
            <div className={styles.vaultPedestal} />
          </div>
        </header>

        {hydrated && ownedBadges.length > 0 ? (
          <details className={styles.shelfDetails}>
            <summary className={`${styles.shelfSummary} font-nunito`}>
              <Star size={13} fill="#fbbf24" color="#fbbf24" aria-hidden />
              Treasure chest · {ownedBadges.length} badges ({collectionPercent}%)
            </summary>
            <div className={styles.shelfTrack}>
              {ownedBadges.map((badge) => (
                <span
                  key={badge.id}
                  className={styles.shelfBadge}
                  title={badge.title}
                >
                  <StoreItemIcon item={badge} size="shelf" />
                </span>
              ))}
            </div>
          </details>
        ) : null}

        <div className={styles.marketWrap}>
          <div className={styles.awning} aria-hidden>
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className={styles.tabDock} role="tablist" aria-label="Shop categories">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                className={`${styles.tab} font-nunito ${
                  filter === tab.key ? styles.tabActive : ""
                }`}
                onClick={() => setFilter(tab.key)}
              >
                <span className={styles.tabEmoji} aria-hidden>
                  {tab.emoji}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <ShopCard
                  key={item.id}
                  item={item}
                  owned={hydrated && isOwnedInState(item, owned)}
                  walletGems={wallet.gems}
                  walletXp={wallet.xp}
                  onBuy={handleBuy}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`${styles.toast} font-fredoka`}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            role="status"
          >
            <Sparkles size={16} className={styles.toastIcon} aria-hidden />
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
