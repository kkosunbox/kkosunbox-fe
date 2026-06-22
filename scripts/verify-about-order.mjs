import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page.evaluate(async () => {
  const step = window.innerHeight;
  for (let y = 0; y <= document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(400);
await page.screenshot({ path: "scripts/reports/about-mobile-375-order.png", fullPage: true });

const result = await page.evaluate(() => {
  const topOf = (el) => el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
  const visibleImgIn = (section, srcPart) => {
    const imgs = [...section.querySelectorAll("img")].filter(i => (i.currentSrc || i.src || "").includes(srcPart));
    return imgs.find(i => i.getBoundingClientRect().height > 10) || null;
  };
  const out = {};

  const sec = (label) => document.querySelector(`[aria-label="${label}"]`).closest("section");

  // Section 2
  let s = sec("믿고 먹일 수 있는 간식, 생각보다 어렵습니다.");
  let heading = [...s.querySelectorAll('[aria-label]')][0];
  let p = [...s.querySelectorAll("p")].find(x => x.textContent.includes("좋은 재료여도"));
  out.section2 = {
    heading: topOf(heading),
    image: topOf(visibleImgIn(s, "puppy-run")),
    desc: topOf(p),
  };

  // Section 3
  s = sec("그래서 꼬순박스는 기준을 만들었습니다.");
  heading = [...s.querySelectorAll('[aria-label]')][0];
  p = [...s.querySelectorAll("p")].find(x => x.textContent.includes("제대로 확인된 재료"));
  out.section3 = {
    heading: topOf(heading),
    image: topOf(visibleImgIn(s, "make-box")),
    desc: topOf(p),
  };

  // CTA
  s = sec("반려동물을 위한 좋은 간식, 기준은 꼬순박스가 세우겠습니다.");
  let intro = [...s.querySelectorAll("p")].find(x => x.textContent.includes("믿고 선택할 수 있도록"));
  heading = [...s.querySelectorAll('[aria-label]')][0];
  let img = visibleImgIn(s, "product");
  let btn = [...s.querySelectorAll("a")].find(x => x.textContent.includes("추천 받기"));
  out.cta = {
    intro: topOf(intro),
    heading: topOf(heading),
    image: topOf(img),
    button: topOf(btn),
  };
  return out;
});

const check = (name, items, order) => {
  const tops = order.map(k => items[k]);
  const ok = tops.every((v, i) => i === 0 || (v != null && tops[i-1] != null && v > tops[i-1]));
  console.log(`\n[${name}] expected order: ${order.join(" → ")}`);
  order.forEach(k => console.log(`    ${k.padEnd(8)} top=${items[k]}px`));
  console.log(`    => ${ok ? "✅ CORRECT" : "❌ WRONG ORDER"}`);
};

check("Section 2", result.section2, ["heading", "image", "desc"]);
check("Section 3", result.section3, ["heading", "image", "desc"]);
check("CTA", result.cta, ["intro", "heading", "image", "button"]);

await browser.close();
console.log("\nScreenshot: scripts/reports/about-mobile-375-order.png");
