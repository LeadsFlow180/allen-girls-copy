// Verification helper for Brief 06A: reduced-motion + keyboard focus.
//   node scripts/verify-a11y.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.env.BASE_URL || "http://localhost:3000";
mkdirSync("shots/verify", { recursive: true });
const browser = await chromium.launch();

// 1) Reduced motion: content must remain visible/usable.
const rm = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const rmPage = await rm.newPage();
for (const route of ["/", "/learn/explore", "/store"]) {
  const name = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  await rmPage.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  await rmPage.waitForTimeout(2000);
  await rmPage.screenshot({ path: `shots/verify/reduced-motion_${name}.png`, fullPage: false });
  console.log(`reduced-motion ${route} captured`);
}
await rm.close();

// 2) Keyboard focus: Tab through the login form, capture the visible ring.
const kb = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const kbPage = await kb.newPage();
await kbPage.goto(base + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
await kbPage.waitForTimeout(1500);
for (let i = 0; i < 6; i++) await kbPage.keyboard.press("Tab");
const active = await kbPage.evaluate(() => {
  const el = document.activeElement;
  const cs = el ? getComputedStyle(el) : null;
  return el ? { tag: el.tagName, text: (el.textContent || "").trim().slice(0, 30), outline: cs.outlineWidth + " " + cs.outlineStyle + " " + cs.outlineColor } : null;
});
console.log("focused element after 6 Tabs:", JSON.stringify(active));
await kbPage.screenshot({ path: "shots/verify/keyboard-focus_login.png", fullPage: false });
await kb.close();

await browser.close();
