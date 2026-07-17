// Dev-only screenshot helper for the design-system consolidation (Brief 06A).
// Usage: node scripts/shoot.mjs <outDir> [route1 route2 ...]
// Reads BASE_URL env (default http://localhost:3000).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.env.BASE_URL || "http://localhost:3000";
const outDir = process.argv[2] || "shots";
const routes = process.argv.slice(3);
const list = routes.length
  ? routes
  : ["/", "/games", "/store", "/login", "/signup", "/characters", "/worlds", "/learn/explore", "/parent/dashboard"];

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const route of list) {
  const name = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  const file = `${outDir}/${name}.png`;
  try {
    await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`OK   ${route} -> ${file} (final url: ${page.url()})`);
  } catch (e) {
    try { await page.screenshot({ path: file }); } catch {}
    console.log(`WARN ${route} -> ${file} : ${e.message.split("\n")[0]}`);
  }
}

await browser.close();
