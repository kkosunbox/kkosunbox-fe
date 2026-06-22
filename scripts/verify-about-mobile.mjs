import { chromium } from "@playwright/test";

const HEADINGS = [
  "About Us",
  "믿고 먹일 수 있는 간식, 생각보다 어렵습니다.",
  "그래서 꼬순박스는 기준을 만들었습니다.",
  "꼬순박스는 그 기준으로 간식을 담습니다.",
  "반려동물을 위한 좋은 간식, 기준은 꼬순박스가 세우겠습니다.",
];

const browser = await chromium.launch();

for (const width of [375, 768, 1280]) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  // trigger ScrollReveal animations by scrolling through
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  if (width === 375) {
    await page.screenshot({ path: "scripts/reports/about-mobile-375.png", fullPage: true });
  }

  const data = await page.evaluate((labels) => {
    const out = [];
    for (const label of labels) {
      const el = document.querySelector(`[aria-label="${label}"]`);
      if (!el) { out.push({ label, found: false }); continue; }
      const heading = el.getBoundingClientRect();
      const section = el.closest("section");
      const sRect = section ? section.getBoundingClientRect() : null;
      const svgs = [...el.querySelectorAll("svg")].map((s) => {
        const cs = getComputedStyle(s);
        const r = s.getBoundingClientRect();
        return {
          cls: s.getAttribute("class"),
          display: cs.display,
          w: Math.round(r.width),
          h: Math.round(r.height),
          left: Math.round(r.left),
          right: Math.round(r.right),
        };
      });
      const visible = svgs.find((s) => s.display !== "none");
      let centerInfo = null;
      if (visible && sRect) {
        const svgCenter = (visible.left + visible.right) / 2;
        const sectionCenter = (sRect.left + sRect.right) / 2;
        centerInfo = {
          svgCenter: Math.round(svgCenter),
          sectionCenter: Math.round(sectionCenter),
          offsetFromCenter: Math.round(svgCenter - sectionCenter),
        };
      }
      out.push({
        label,
        found: true,
        headingTop: Math.round(heading.top + window.scrollY),
        svgs,
        visibleSvgWidth: visible ? visible.w : null,
        centerInfo,
      });
    }
    return out;
  }, HEADINGS);

  console.log(`\n================ viewport ${width}px ================`);
  for (const d of data) {
    if (!d.found) { console.log(`MISSING: ${d.label}`); continue; }
    const shortLabel = d.label.length > 24 ? d.label.slice(0, 24) + "…" : d.label;
    console.log(`\n• "${shortLabel}"`);
    d.svgs.forEach((s, i) => {
      const cls = s.cls || "";
      const tag = cls.includes("lg:hidden") && !cls.includes("max-lg:hidden") ? "[mobile/tablet]" : cls.includes("max-lg:hidden") ? "[desktop]" : "[single]";
      console.log(`    svg#${i} ${tag} display=${s.display} w=${s.w} h=${s.h}`);
    });
    if (d.centerInfo) {
      console.log(`    visible width=${d.visibleSvgWidth}px | center offset from section-center = ${d.centerInfo.offsetFromCenter}px`);
    }
  }
  await ctx.close();
}

await browser.close();
console.log("\nDone. Screenshot: scripts/reports/about-mobile-375.png");
