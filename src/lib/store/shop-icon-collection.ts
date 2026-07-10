import { addCollection } from "@iconify/react";

import shopIcons from "./game-icons-shop.collection.json";

let loaded = false;

/** Bundled Game Icons so relic art loads without the Iconify CDN. */
export function ensureShopIconsLoaded() {
  if (loaded) return;
  addCollection(shopIcons);
  loaded = true;
}

ensureShopIconsLoaded();
