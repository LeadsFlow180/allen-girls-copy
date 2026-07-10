import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsTs = fs.readFileSync(
  path.join(__dirname, "../src/lib/store/shop-item-icons.ts"),
  "utf8",
);

const slugs = new Set(["gem-necklace"]);
for (const match of iconsTs.matchAll(/"game-icons:([^"]+)"/g)) {
  slugs.add(match[1]);
}

const list = [...slugs].join(",");
const res = await fetch(`https://api.iconify.design/game-icons.json?icons=${list}`);
const data = await res.json();

const out = {
  prefix: "game-icons",
  width: 512,
  height: 512,
  icons: data.icons,
};

const outPath = path.join(__dirname, "../src/lib/store/game-icons-shop.collection.json");
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`Bundled ${Object.keys(data.icons).length} icons -> ${outPath}`);
