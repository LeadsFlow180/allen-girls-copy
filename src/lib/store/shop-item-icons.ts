/**
 * Open-source award / relic icons from Game Icons (https://game-icons.net)
 * License: CC BY 3.0 — attribute in README or credits if shipping publicly.
 */
export const SHOP_ITEM_ICON_IDS: Record<string, string> = {
  "badge-streak-spark": "game-icons:fire-gem",
  "badge-hola-hero": "game-icons:hand-ok",
  "badge-quiz-star": "game-icons:medal",
  "badge-path-pioneer": "game-icons:compass",
  "badge-gem-hunter": "game-icons:cut-diamond",
  "badge-maya-crew": "game-icons:heart-necklace",
  "badge-spark-buddy": "game-icons:robot-golem",
  "badge-legend-crown": "game-icons:laurel-crown",
  "badge-butterfly-charm": "game-icons:butterfly",
  "badge-ruby-flame": "game-icons:flame",
  "badge-crystal-orb": "game-icons:crystal-ball",
  "badge-star-medal": "game-icons:star-medal",
  "badge-scholar-scroll": "game-icons:scroll-unfurled",
  "badge-suncrest": "game-icons:sun",
  "badge-pearl-tide": "game-icons:pearl-necklace",
  "badge-gold-trophy": "game-icons:trophy",
  "badge-moonstone": "game-icons:moon",
  "badge-forest-wreath": "game-icons:vine-flower",
  "badge-treasure-map": "game-icons:treasure-map",
  "badge-wizard-elixir": "game-icons:magic-potion",
  "badge-dragon-scale": "game-icons:dragon-head",
  "badge-unicorn-relic": "game-icons:unicorn",
  "badge-castle-keeper": "game-icons:castle",
  "badge-rainbow-star": "game-icons:rainbow-star",
  "badge-stone-sigil": "game-icons:stone-block",
  "badge-gem-chain": "game-icons:gem-chain",
  "badge-energy-blade": "game-icons:energy-sword",
  "badge-wizard-cowl": "game-icons:wizard-face",
  "badge-laurel-champion": "game-icons:laurels",
  "badge-ring-of-quest": "game-icons:ring",
  "bundle-gems-small": "game-icons:swap-bag",
  "bundle-gems-medium": "game-icons:backpack",
  "bundle-gems-large": "game-icons:gems",
  "bundle-gems-royal": "game-icons:crown-coin",
  "boost-streak-shield": "game-icons:shield",
  "boost-xp-rush": "game-icons:lightning-arc",
  "boost-gem-magnet": "game-icons:gem-chain",
  "boost-owl-wisdom": "game-icons:owl",
  "boost-flame-ward": "game-icons:flame",
};

export function getShopItemIconId(itemId: string): string {
  return SHOP_ITEM_ICON_IDS[itemId] ?? "game-icons:gem-necklace";
}

/** Unique game-icons slugs bundled for offline render. */
export function getBundledShopIconSlugs(): string[] {
  const slugs = new Set<string>();
  for (const iconId of Object.values(SHOP_ITEM_ICON_IDS)) {
    slugs.add(iconId.replace("game-icons:", ""));
  }
  slugs.add("gem-necklace");
  return [...slugs];
}
