"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Gem, Zap } from "lucide-react";

import { SHOP_CATALOG, type ShopCatalogItem, type ShopItemKind } from "@/lib/learn/shop-catalog";
import {
  getShopOwned,
  purchaseShopItem,
  type PurchaseResult,
  type ShopOwnedState,
} from "@/lib/learn/shop-state";
import { useLearnProgress } from "@/lib/learn/use-learn-progress";

import { StoreAmbientDust } from "./store-ambient-dust";
import { StoreArtifact } from "./store-artifact";
import { StoreCurator } from "./store-curator";
import { StoreEnvironment } from "./store-environment";
import { StoreFilmstrip } from "./store-filmstrip";
import { StorePurchaseBurst } from "./store-purchase-burst";
import { StoreRelicRow } from "./store-relic-row";
import { StoreSpotlight } from "./store-spotlight";
import styles from "./magical-store.module.css";

type StoreFilter = "all" | ShopItemKind;

const FILTERS: { key: StoreFilter; label: string }[] = [
  { key: "all", label: "All relics" },
  { key: "badge", label: "Badges" },
  { key: "gem_bundle", label: "Vault" },
  { key: "boost", label: "Boosts" },
];

const EMPTY_OWNED: ShopOwnedState = { badges: [], boosts: [] };

const COLLECTIBLE_COUNT = SHOP_CATALOG.filter(
  (i) => i.kind === "badge" || i.kind === "boost",
).length;

function purchaseErrorMessage(result: Extract<PurchaseResult, { ok: false }>) {
  switch (result.error) {
    case "already_owned":
      return "Already in your collection.";
    case "insufficient_gems":
      return "Not enough gems.";
    case "insufficient_xp":
      return "Not enough XP.";
    default:
      return "Purchase failed.";
  }
}

function isOwnedItem(item: ShopCatalogItem, owned: ShopOwnedState): boolean {
  if (item.kind === "badge") return owned.badges.includes(item.id);
  if (item.kind === "boost") return owned.boosts.includes(item.id);
  return false;
}

export function MagicalStoreExperience() {
  const router = useRouter();
  const { wallet, refresh } = useLearnProgress();
  const [owned, setOwned] = useState<ShopOwnedState>(EMPTY_OWNED);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<StoreFilter>("all");
  const [selected, setSelected] = useState<ShopCatalogItem | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [burst, setBurst] = useState(false);

  const catalog = useMemo(() => {
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

  const ownedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of catalog) {
      if (isOwnedItem(item, owned)) ids.add(item.id);
    }
    return ids;
  }, [catalog, owned]);

  const collectionOwned = owned.badges.length + owned.boosts.length;
  const collectionPercent = Math.round((collectionOwned / COLLECTIBLE_COUNT) * 100);

  const selectedIndex = useMemo(
    () => (selected ? catalog.findIndex((i) => i.id === selected.id) : -1),
    [catalog, selected],
  );

  const syncOwned = useCallback(() => {
    setOwned(getShopOwned());
  }, []);

  useEffect(() => {
    syncOwned();
    const reload = () => {
      syncOwned();
      void refresh();
    };
    window.addEventListener("learn:shop-updated", reload);
    window.addEventListener("learn:wallet-updated", reload);
    return () => {
      window.removeEventListener("learn:shop-updated", reload);
      window.removeEventListener("learn:wallet-updated", reload);
    };
  }, [syncOwned, refresh]);

  useEffect(() => {
    setSelected(catalog[0] ?? null);
  }, [catalog]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (catalog.length === 0 || selectedIndex < 0) return;
      if (e.key === "ArrowRight") {
        setSelected(catalog[Math.min(selectedIndex + 1, catalog.length - 1)]);
      } else if (e.key === "ArrowLeft") {
        setSelected(catalog[Math.max(selectedIndex - 1, 0)]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [catalog, selectedIndex]);

  const handleBuy = () => {
    if (!selected) return;
    const result = purchaseShopItem(selected.id);
    if (!result.ok) {
      setToast(purchaseErrorMessage(result));
      return;
    }
    setBurst(true);
    window.setTimeout(() => setBurst(false), 2200);
    setToast(
      result.item.kind === "gem_bundle"
        ? `+${result.item.gemsGranted} gems secured.`
        : `${result.item.title} acquired.`,
    );
    syncOwned();
    void refresh();
  };

  const selectedOwned = selected ? isOwnedItem(selected, owned) : false;
  const selectedCanAfford = selected
    ? selected.kind === "gem_bundle"
      ? wallet.xp >= (selected.priceXp ?? 0)
      : wallet.gems >= selected.priceGems
    : false;

  return (
    <motion.div
      className={styles.atelier}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <StoreEnvironment scrollProgress={scrollProgress} />
      <StoreAmbientDust />
      <StorePurchaseBurst active={burst} />

      <div className={styles.atelierGrain} aria-hidden />
      <div className={styles.atelierVignette} aria-hidden />

      <header className={styles.hud}>
        <button
          type="button"
          className={`${styles.hudExit} font-nunito`}
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={14} aria-hidden />
          Leave
        </button>

        <div className={styles.hudBrand}>
          <p className={`${styles.hudEyebrow} font-nunito`}>Allen Girls Adventures</p>
          <h1 className={`${styles.hudTitle} font-fredoka`}>
            The Enchanted <em>Boutique</em>
          </h1>
        </div>

        <div className={styles.hudWallet}>
          <span className={`${styles.hudStat} font-nunito`}>
            <Gem size={13} aria-hidden />
            <strong>{wallet.gems}</strong>
          </span>
          <span className={`${styles.hudStat} font-nunito`}>
            <Zap size={13} aria-hidden />
            <strong>{wallet.xp}</strong>
          </span>
          <Link href="/shop" className={`${styles.hudLink} font-nunito`}>
            Classic
          </Link>
        </div>
      </header>

      <main className={styles.stage}>
        <section className={styles.immersion} aria-label="Relic display">
          <StoreArtifact
            item={selected}
            index={selectedIndex >= 0 ? selectedIndex : 0}
            total={catalog.length}
          />
          <StoreCurator />
        </section>

        <aside className={styles.catalog} aria-label="Relic catalog">
          <div className={styles.collectionBar}>
            <div className={styles.collectionHead}>
              <span className={`${styles.collectionLabel} font-nunito`}>Archive progress</span>
              <span className={`${styles.collectionValue} font-nunito`}>
                <strong>{collectionOwned}</strong> / {COLLECTIBLE_COUNT}
                <em>{collectionPercent}%</em>
              </span>
            </div>
            <div className={styles.collectionTrack}>
              <motion.span
                className={styles.collectionFill}
                initial={false}
                animate={{ width: `${collectionPercent}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <StoreSpotlight
            item={selected}
            owned={selectedOwned}
            canAfford={selectedCanAfford}
            onBuy={handleBuy}
          />

          <nav className={styles.filterRail} aria-label="Categories">
            {FILTERS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`${styles.filterChip} font-nunito ${
                  filter === tab.key ? styles.filterChipActive : ""
                }`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className={styles.relicList}>
            {catalog.map((item, index) => (
              <StoreRelicRow
                key={item.id}
                item={item}
                index={index}
                selected={selected?.id === item.id}
                owned={ownedIds.has(item.id)}
                onSelect={() => setSelected(item)}
              />
            ))}
          </div>
        </aside>
      </main>

      <StoreFilmstrip
        items={catalog}
        selectedId={selected?.id ?? null}
        ownedIds={ownedIds}
        onSelect={setSelected}
        onScrollProgress={setScrollProgress}
      />

      <AnimatePresence>
        {toast ? (
          <motion.p
            className={`${styles.toast} font-nunito`}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
