"use client";

import { Icon } from "@iconify/react";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";
import { getShopItemIconId } from "@/lib/store/shop-item-icons";
import "@/lib/store/shop-icon-collection";

export type StoreItemIconSize = "hero" | "film" | "relic" | "card" | "shelf";

type Props = {
  item: Pick<ShopCatalogItem, "id" | "accent" | "icon" | "emoji">;
  size?: StoreItemIconSize;
  className?: string;
};

const SIZE_PX: Record<StoreItemIconSize, number> = {
  hero: 128,
  film: 36,
  relic: 30,
  card: 56,
  shelf: 26,
};

export function StoreItemIcon({ item, size = "hero", className }: Props) {
  const iconId = item.icon ?? getShopItemIconId(item.id);

  return (
    <Icon
      icon={iconId}
      width={SIZE_PX[size]}
      height={SIZE_PX[size]}
      className={className}
      style={{ color: item.accent }}
      aria-hidden
      inline
    />
  );
}
