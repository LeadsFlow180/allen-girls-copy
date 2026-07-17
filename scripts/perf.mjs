// Move 4 helper: measure sustained frame rate under 6x CPU throttling
// (approximates a low-end school Chromebook), per Brief 06A RECON #1.
//   node scripts/perf.mjs [route ...]
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:3000";
const routes = process.argv.slice(2);
const list = routes.length ? routes : ["/", "/learn/explore"];
const RATE = 6;      // CPU slowdown multiplier
const SAMPLE_MS = 5000;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const route of list) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: RATE });
  try {
    await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500); // let ambient animations start
    const fps = await page.evaluate(async (ms) => {
      return await new Promise((resolve) => {
        let frames = 0;
        const t0 = performance.now();
        function tick(now) {
          frames++;
          if (now - t0 >= ms) resolve(Math.round((frames * 1000) / (now - t0)));
          else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, SAMPLE_MS);
    console.log(`${route.padEnd(18)} @${RATE}x CPU  ->  ${fps} fps  (${fps >= 50 ? "PASS >=50" : "BELOW 50"})`);
  } catch (e) {
    console.log(`${route.padEnd(18)} ERROR ${e.message.split("\n")[0]}`);
  }
  await page.close();
}

await browser.close();
