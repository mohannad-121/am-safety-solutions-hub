import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const productionUrl = process.env.PRODUCTION_URL || process.env.PUBLIC_SITE_URL;
if (!productionUrl || /localhost|127\.0\.0\.1/.test(productionUrl)) throw new Error("PRODUCTION_URL must be a deployed HTTPS origin.");
if (!productionUrl.startsWith("https://")) throw new Error("PRODUCTION_URL must use HTTPS.");
const origin = productionUrl.replace(/\/$/, "");
const viewports = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1024, height: 1366 },
  { width: 320, height: 700 },
  { width: 360, height: 740 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
];
const output = path.resolve("qa-artifacts", "production-mobile");
fs.mkdirSync(output, { recursive: true });

const sitemap = await fetch(`${origin}/sitemap.xml`).then(async (response) => {
  if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);
  return response.text();
});
const routes = [...new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || "/"))];
const browser = await chromium.launch({ headless: true });
const failures = [];
const records = [];

async function snapshotSignals(page) {
  return page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
    h1: [...document.querySelectorAll("h1")].map((node) => node.textContent?.trim()),
    h2: [...document.querySelectorAll("h2")].map((node) => node.textContent?.trim()),
    schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent),
    links: [...document.querySelectorAll("a[href]")].map((node) => node.getAttribute("href")).filter(Boolean).sort(),
    missingAlt: [...document.querySelectorAll("img")].filter((image) => !image.getAttribute("alt")?.trim()).length,
    conversionActions: [...document.querySelectorAll("a[href],button")].filter((node) => /quote|contact|whatsapp|documentation|technical support|send drawings/i.test(`${node.textContent || ""} ${node.getAttribute("aria-label") || ""} ${node.getAttribute("href") || ""}`)).length,
  }));
}

for (const route of routes) {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const desktopResponse = await desktop.goto(`${origin}${route}`, { waitUntil: "networkidle", timeout: 45000 });
  const desktopSignals = await snapshotSignals(desktop);
  await desktop.close();
  for (const { width, height } of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
    page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
    const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle", timeout: 45000 });
    const signals = await snapshotSignals(page);
    const layout = await page.evaluate(() => {
      const fixed = [...document.querySelectorAll("body *")].filter((node) => ["fixed", "sticky"].includes(getComputedStyle(node).position) && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0).map((node) => ({ node, tag: node.tagName, label: node.getAttribute("aria-label") || node.textContent?.trim().slice(0, 50) || "", rect: node.getBoundingClientRect().toJSON() }));
      const overlaps = [];
      for (let a = 0; a < fixed.length; a += 1) for (let b = a + 1; b < fixed.length; b += 1) { if (fixed[a].node.contains(fixed[b].node) || fixed[b].node.contains(fixed[a].node)) continue; const x = fixed[a].rect; const y = fixed[b].rect; const overlap = x.left < y.right && x.right > y.left && x.top < y.bottom && x.bottom > y.top; if (overlap) overlaps.push([fixed[a].label, fixed[b].label]); }
      const smallTapTargets = [...document.querySelectorAll("a,button,input,select,textarea")].filter((node) => { const rect = node.getBoundingClientRect(); const style = getComputedStyle(node); return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44); }).map((node) => node.getAttribute("aria-label") || node.textContent?.trim().slice(0, 40) || node.tagName).slice(0, 25);
      const formIssues = [...document.querySelectorAll("input,select,textarea")].filter((node) => { const rect = node.getBoundingClientRect(); return rect.right > window.innerWidth + 1 || rect.width < 44 || rect.height < 40; }).map((node) => node.getAttribute("name") || node.getAttribute("aria-label") || node.tagName).slice(0, 25);
      const mediaOverflow = [...document.querySelectorAll("img,video,iframe,canvas")].filter((node) => { const rect = node.getBoundingClientRect(); return rect.left < -1 || rect.right > window.innerWidth + 1; }).map((node) => node.getAttribute("src") || node.tagName).slice(0, 25);
      const tableOverflow = [...document.querySelectorAll("table")].filter((node) => { const rect = node.getBoundingClientRect(); const parent = node.parentElement; return rect.width > window.innerWidth && (!parent || parent.scrollWidth <= parent.clientWidth); }).length;
      return { horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1, fixedOverlaps: overlaps, smallTapTargets, formIssues, mediaOverflow, tableOverflow, viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute("content") || "" };
    });
    const brokenImages = await page.locator("img").evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src")));
    const mismatch = JSON.stringify({ ...signals, links: signals.links.filter((link) => !link?.startsWith("tel:") && !link?.startsWith("mailto:")) }) !== JSON.stringify({ ...desktopSignals, links: desktopSignals.links.filter((link) => !link?.startsWith("tel:") && !link?.startsWith("mailto:")) });
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "--");
    const viewportName = `${width}x${height}`;
    await page.screenshot({ path: path.join(output, `${slug}-${viewportName}-above-fold.png`) });
    await page.screenshot({ path: path.join(output, `${slug}-${viewportName}-full.png`), fullPage: true });
    const menu = page.getByRole("button", { name: /menu|navigation/i }).first();
    if (await menu.isVisible().catch(() => false)) { await menu.click(); await page.screenshot({ path: path.join(output, `${slug}-${viewportName}-menu-open.png`) }); }
    if (!response || response.status() >= 400) failures.push(`${route} ${width}px: HTTP ${response?.status() ?? "none"}`);
    if (desktopResponse?.status() !== response?.status()) failures.push(`${route} ${width}px: desktop/mobile HTTP mismatch`);
    if (layout.horizontalOverflow) failures.push(`${route} ${width}px: horizontal overflow`);
    if (layout.fixedOverlaps.length) failures.push(`${route} ${width}px: fixed controls overlap ${JSON.stringify(layout.fixedOverlaps)}`);
    if (!/width=device-width/i.test(layout.viewportMeta)) failures.push(`${route} ${width}px: viewport meta missing or invalid`);
    if (layout.formIssues.length) failures.push(`${route} ${width}px: unusable form controls ${layout.formIssues.join(", ")}`);
    if (layout.mediaOverflow.length) failures.push(`${route} ${width}px: media overflow ${layout.mediaOverflow.join(", ")}`);
    if (layout.tableOverflow) failures.push(`${route} ${width}px: ${layout.tableOverflow} table(s) overflow without a scroll container`);
    if (brokenImages.length) failures.push(`${route} ${width}px: broken images ${brokenImages.join(", ")}`);
    if (signals.missingAlt) failures.push(`${route} ${width}px: ${signals.missingAlt} images missing alt`);
    if (!signals.conversionActions) failures.push(`${route} ${width}px: no reachable quote, contact, documentation or support action`);
    if (mismatch) failures.push(`${route} ${width}px: desktop/mobile SEO or link parity mismatch`);
    errors.forEach((error) => failures.push(`${route} ${width}px: ${error}`));
    records.push({ route, width, height, status: response?.status(), ...layout, brokenImages, missingAlt: signals.missingAlt, parity: !mismatch, errors });
    await page.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ productionUrl: origin, checkedAt: new Date().toISOString(), routes: routes.length, viewports, records, failures }, null, 2));
console.log(`Mobile production QA checked ${routes.length} routes at ${viewports.length} viewports. Artifacts: ${output}`);
if (failures.length) throw new Error(`Mobile production QA failed (${failures.length} findings):\n${failures.slice(0, 100).join("\n")}`);
