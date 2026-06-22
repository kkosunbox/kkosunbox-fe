import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const p = await c.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.evaluate(async () => { const s = window.innerHeight; for (let y = 0; y <= document.body.scrollHeight; y += s) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } window.scrollTo(0, 0); });
await p.waitForTimeout(400);
await p.screenshot({ path: "scripts/reports/about-desktop-1280.png", fullPage: true });
const r = await p.evaluate(() => {
  const visCount = (part) => [...document.querySelectorAll("img")].filter(i => (i.currentSrc || i.src || "").includes(part) && i.getBoundingClientRect().height > 10).length;
  // confirm row layout: image left/right beside text
  const secOf = (label) => document.querySelector(`[aria-label="${label}"]`).closest("section");
  const flexDir = (label) => {
    const s = secOf(label);
    const row = s.querySelector(".lg\\:flex-row, [class*='lg:flex-row']");
    return row ? getComputedStyle(row).flexDirection : "n/a";
  };
  return {
    visiblePuppy: visCount("puppy-run"),
    visibleBox: visCount("make-box"),
    visibleProduct: visCount("product"),
    sec2dir: flexDir("믿고 먹일 수 있는 간식, 생각보다 어렵습니다."),
  };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
