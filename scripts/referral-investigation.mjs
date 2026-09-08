import fs from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
const require = createRequire(import.meta.url);
console.log(fs.readFileSync(require.resolve('next/dist/client/components/app-router'), 'utf8').split('\n').filter(l => l.includes('window.next') || l.includes('router:')).join('\n'));
const browser = await chromium.launch({ headless: true });
const followup = process.argv.includes('--followup');
const resultsFile = 'reports/referral-investigation-2026-09-08/results.json';
const results = followup ? JSON.parse(fs.readFileSync(resultsFile, 'utf8')) : [];
const base = 'http://localhost:3001';
const slugs = ['test-influencer', 'second-influencer'];
const codes = ['FRIEND10', 'SECOND20'];
async function run(mode, count, blockAction = false, initialIndex = 0) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const events = [];
  await context.route('**/*', route => {
    const req = route.request();
    if (!req.url().startsWith(base) && !req.url().startsWith('http://localhost:3099')) return route.abort();
    if (blockAction && req.headers()['next-action']) { events.push({ type: 'blocked-action', url: req.url() }); return route.abort(); }
    return route.continue();
  });
  await page.exposeFunction('logCookieWrite', value => events.push({ type: 'js-cookie', value }));
  await page.addInitScript(() => {
    const d = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', { get: () => d.get.call(document), set: value => { window.logCookieWrite(value); d.set.call(document, value); }, configurable: true });
  });
  page.on('response', async response => {
    const cookies = (await response.allHeaders())['set-cookie'];
    if (cookies || response.request().headers()['next-action']) events.push({ type: 'response', url: response.url(), status: response.status(), action: !!response.request().headers()['next-action'], cookies: cookies ?? null });
  });
  page.on('pageerror', e => events.push({ type: 'pageerror', message: e.message }));
  await page.goto(base + '/r/' + slugs[initialIndex], { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => !!window.next?.router);
  await page.waitForTimeout(1200);
  for (let i = 0; i < count; i++) {
    const index = (i + 1 + initialIndex) % 2;
    const start = events.length;
    const path = mode === 'query' ? '/?r=SECOND20' : '/r/' + slugs[index];
    if (mode.startsWith('soft')) {
      await page.evaluate(path => window.next.router.push(path), path);
      await page.waitForURL(base + path);
    } else if (mode === 'rapid-hard') {
      await page.goto(base + '/r/' + slugs[1 - index], { waitUntil: 'commit', timeout: 120000 });
      await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 120000 });
    } else await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(mode === 'soft-long' ? 18000 : 1500);
    const cookies = Object.fromEntries((await context.cookies()).filter(c => c.name.startsWith('ggosoon-ref')).map(c => [c.name, c.value]));
    const text = await page.locator('body').innerText();
    const row = { mode, initialIndex, blockAction, iteration: i + 1, expected: mode === 'query' ? 'SECOND20' : codes[index], cookies, hasA: text.includes('[테스트인플루언서]'), hasB: text.includes('[두번째인플루언서]'), events: events.slice(start) };
    row.passed = cookies['ggosoon-ref'] === row.expected && (mode === 'query' || cookies['ggosoon-ref-slug'] === slugs[index]);
    results.push(row);
    console.log(JSON.stringify(row));
    if (mode === 'soft-long') {
      await page.screenshot({ path: 'reports/referral-investigation-2026-09-08/soft-navigation-stale.png' });
      await page.evaluate(() => window.next.router.refresh());
      await page.waitForTimeout(2000);
      row.afterRefresh = Object.fromEntries((await context.cookies()).filter(c => c.name.startsWith('ggosoon-ref')).map(c => [c.name, c.value]));
      console.log('AFTER_REFRESH', JSON.stringify(row.afterRefresh));
    }
  }
  await context.close();
}
try {
  if (followup) {
    await run('soft-reverse', 6, false, 1);
    await run('soft-long', 1);
    await run('rapid-hard', 10);
    await run('query', 1);
  } else {
    await run('hard', 10);
    await run('hard', 10, true);
    await run('soft', 6);
    await run('query', 1);
  }
} finally {
  fs.mkdirSync('reports/referral-investigation-2026-09-08', { recursive: true });
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  await browser.close();
}
