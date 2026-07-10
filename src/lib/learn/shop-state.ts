import {
  getLocalWallet,
  saveLocalWallet,
  type LocalWallet,
} from "@/lib/learn/achievements-state";
import { getShopItem, type ShopCatalogItem } from "@/lib/learn/shop-catalog";

export const SHOP_OWNED_KEY = "learn.shopOwned";
export const SHOP_BOOSTS_KEY = "learn.shopBoosts";

export type ShopOwnedState = {
  badges: string[];
  boosts: string[];
};

export type PurchaseResult =
  | { ok: true; wallet: LocalWallet; item: ShopCatalogItem }
  | { ok: false; error: "not_found" | "already_owned" | "insufficient_gems" | "insufficient_xp" };

function readOwned(): ShopOwnedState {
  if (typeof window === "undefined") {
    return { badges: [], boosts: [] };
  }
  try {
    const raw = window.localStorage.getItem(SHOP_OWNED_KEY);
    if (!raw) return { badges: [], boosts: [] };
    const parsed = JSON.parse(raw) as Partial<ShopOwnedState>;
    return {
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      boosts: Array.isArray(parsed.boosts) ? parsed.boosts : [],
    };
  } catch {
    return { badges: [], boosts: [] };
  }
}

function saveOwned(state: ShopOwnedState) {
  window.localStorage.setItem(SHOP_OWNED_KEY, JSON.stringify(state));
}

export function getShopOwned(): ShopOwnedState {
  return readOwned();
}

export function isShopItemOwned(item: ShopCatalogItem): boolean {
  const owned = readOwned();
  if (item.kind === "badge") return owned.badges.includes(item.id);
  if (item.kind === "boost") return owned.boosts.includes(item.id);
  return false;
}

export function purchaseShopItem(itemId: string): PurchaseResult {
  const item = getShopItem(itemId);
  if (!item) return { ok: false, error: "not_found" };

  const wallet = getLocalWallet();
  const owned = readOwned();

  if (item.kind === "badge" && owned.badges.includes(item.id)) {
    return { ok: false, error: "already_owned" };
  }
  if (item.kind === "boost" && owned.boosts.includes(item.id)) {
    return { ok: false, error: "already_owned" };
  }

  if (item.kind === "gem_bundle") {
    const xpCost = item.priceXp ?? 0;
    if (wallet.xp < xpCost) return { ok: false, error: "insufficient_xp" };
    const nextWallet: LocalWallet = {
      xp: wallet.xp - xpCost,
      gems: wallet.gems + (item.gemsGranted ?? 0),
    };
    saveLocalWallet(nextWallet);
    notifyShopUpdated();
    return { ok: true, wallet: nextWallet, item };
  }

  if (wallet.gems < item.priceGems) {
    return { ok: false, error: "insufficient_gems" };
  }

  const nextWallet: LocalWallet = {
    xp: wallet.xp,
    gems: wallet.gems - item.priceGems,
  };

  if (item.kind === "badge") {
    owned.badges = [...owned.badges, item.id];
  } else if (item.kind === "boost") {
    owned.boosts = [...owned.boosts, item.id];
  }

  saveOwned(owned);
  saveLocalWallet(nextWallet);
  notifyShopUpdated();
  return { ok: true, wallet: nextWallet, item };
}

export function notifyShopUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("learn:shop-updated"));
  window.dispatchEvent(new CustomEvent("learn:wallet-updated"));
}
