import { chromium, firefox, webkit } from "playwright";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const refreshArg = process.argv.find((argument) => argument.startsWith("--refresh="));
const refreshCount = Number(refreshArg?.split("=")[1] || 3);
const failures = [];
const skipped = [];
const internalLinks = new Set();

const routes = [
  "/", "/products", "/products/safety-nets", "/edge-protection-systems-uae",
  "/projects", "/edge-protection-training", "/articles", "/about", "/standards",
  "/edge-protection-downloads", "/faq", "/contact", "/quote", "/privacy", "/terms",
  "/safety-net-uae", "/safety-catch-net-dubai", "/vertical-safety-net",
  "/loading-platforms-uae", "/work-at-height-safety-uae", "/temporary-works-safety-solutions-uae",
  "/what-is-en-1263-safety-net", "/what-is-en-13374-edge-protection",
  "/resources/risk-assessment-method-statement", "/resources/safety-net-risk-assessment-method-statement",
  "/resources/edge-protection-risk-assessment-method-statement", "/resources/loading-platform-risk-assessment-method-statement",
  "/resources/how-to-make-method-statement",
];
const mobileWidths = [430, 414, 390, 375, 360];

function record(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

async function inspectPage(page, route, viewportLabel) {
  const consoleErrors = [];
  const failedRequests = [];
  const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
  const onRequestFailed = (request) => {
    const errorText = request.failure()?.errorText || "failed";
    if (errorText === "net::ERR_ABORTED") return;
    failedRequests.push(`${request.url()} (${errorText})`);
  };
  page.on("console", onConsole);
  page.on("requestfailed", onRequestFailed);

  const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator("h1").first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(50);
  if (!response?.ok()) record(`${viewportLabel} ${route}: HTTP ${response?.status() || "no response"}`);

  const result = await page.evaluate(() => ({
    title: document.title,
    h1Count: document.querySelectorAll("h1").length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
    emptyLinks: Array.from(document.querySelectorAll("a[href]")).filter((link) => ["", "#"].includes(link.getAttribute("href") || "")).map((link) => link.textContent?.trim()),
    links: Array.from(document.querySelectorAll("a[href]"), (link) => link.getAttribute("href")),
  }));

  for (const href of result.links) {
    if (href?.startsWith("/") && !href.startsWith("/admin") && !href.startsWith("//")) internalLinks.add(href.split("#")[0]);
  }

  if (!result.title) record(`${viewportLabel} ${route}: missing document title`);
  if (result.h1Count !== 1) record(`${viewportLabel} ${route}: expected one H1, found ${result.h1Count}`);
  if (result.overflow > 1) record(`${viewportLabel} ${route}: horizontal overflow ${result.overflow}px`);
  if (result.brokenImages.length) record(`${viewportLabel} ${route}: broken images ${result.brokenImages.join(", ")}`);
  if (result.emptyLinks.length) record(`${viewportLabel} ${route}: empty links ${result.emptyLinks.join(", ")}`);
  if (consoleErrors.length) record(`${viewportLabel} ${route}: console errors ${consoleErrors.join(" | ")}`);
  if (failedRequests.length) record(`${viewportLabel} ${route}: failed requests ${failedRequests.join(" | ")}`);

  page.off("console", onConsole);
  page.off("requestfailed", onRequestFailed);
}

async function inspectForms(page, route) {
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(250);
  const unlabeled = await page.evaluate(() => Array.from(document.querySelectorAll("input:not([type=hidden]), select, textarea")).filter((field) => {
    const id = field.getAttribute("id");
    return !(field.closest("label") || (id && document.querySelector(`label[for=\"${CSS.escape(id)}\"]`)) || field.getAttribute("aria-label"));
  }).map((field) => `${field.tagName.toLowerCase()}[name=${field.getAttribute("name") || ""}]`));
  if (unlabeled.length) record(`${route}: unlabeled controls ${unlabeled.join(", ")}`);
}

async function inspectVideos(page) {
  for (const config of [
    { route: "/", id: "landingHeroVideo", duration: 16, frame: ".landing-video-frame" },
    { route: "/about", id: "aboutHeroVideo", duration: 19, frame: ".about-video-frame" },
  ]) {
    await page.goto(`${baseURL}${config.route}`, { waitUntil: "domcontentloaded" });
    const video = page.locator(`#${config.id}`);
    const initial = await video.evaluate((element) => ({ paused: element.paused, poster: element.poster, preload: element.preload }));
    if (!initial.poster) record(`${config.route}: missing poster`);
    if (!initial.paused) record(`${config.route}: video should wait for hover/tap`);
    if (initial.preload !== "none") record(`${config.route}: video should not preload before interaction`);

    const supportsHover = await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    if (supportsHover) await page.locator(config.frame).hover();
    else await page.locator(config.frame).click({ position: { x: 10, y: 10 } });
    await video.evaluate((element) => new Promise((resolve, reject) => {
      if (element.readyState >= 1) resolve(undefined);
      else {
        element.addEventListener("loadedmetadata", () => resolve(undefined), { once: true });
        window.setTimeout(() => reject(new Error("metadata timeout")), 15_000);
      }
    }));
    const details = await video.evaluate((element) => ({ duration: element.duration, source: element.currentSrc }));
    if (Math.abs(details.duration - config.duration) > 0.15) record(`${config.route}: video duration ${details.duration}, expected ${config.duration}`);
    if (/youtube|youtu\.be/i.test(details.source)) record(`${config.route}: still uses YouTube`);
    await page.waitForTimeout(1800);
    const playing = await video.evaluate((element) => !element.paused && element.currentTime > 0);
    if (!playing) record(`${config.route}: video did not play on hover`);
    if (supportsHover) await page.mouse.move(0, 0);
    else await page.locator(config.frame).click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(200);
    const pausedAt = await video.evaluate((element) => ({ paused: element.paused, time: element.currentTime }));
    await page.waitForTimeout(300);
    const frozenAt = await video.evaluate((element) => element.currentTime);
    if (!pausedAt.paused || Math.abs(frozenAt - pausedAt.time) > 0.08) record(`${config.route}: video did not pause and hold its position`);
  }
}

async function inspectMobileMenu(page) {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(250);
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  if (bodyOverflow !== "hidden") record("mobile menu: background scroll is not locked");
  const solutionsLink = page.getByRole("link", { name: "View all Solutions", exact: true });
  if (!(await solutionsLink.isVisible())) {
    await page.getByRole("button", { name: "Solutions", exact: true }).click();
  }
  if (!(await solutionsLink.isVisible())) record("mobile menu: solutions dropdown did not open");
  await page.getByRole("button", { name: "Close menu" }).click();
}

async function inspectInternalLinks(page) {
  for (const path of internalLinks) {
    const consoleErrors = [];
    const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
    page.on("console", onConsole);
    const response = await page.goto(`${baseURL}${path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(100);
    const isNotFound = await page.getByRole("heading", { name: "404", exact: true }).count();
    if (!response?.ok() || isNotFound || consoleErrors.some((message) => message.includes("404 Error"))) record(`broken internal link: ${path}`);
    page.off("console", onConsole);
  }
}

async function runBrowser(name, browserType, fullMobileMatrix = false, launchOptions = {}) {
  let browser;
  try {
    browser = await browserType.launch({ headless: true, ...launchOptions });
  } catch (error) {
    skipped.push(`${name}: ${error.message.split("\n")[0]}`);
    return;
  }

  try {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const desktopPage = await desktop.newPage();
    for (const route of routes) await inspectPage(desktopPage, route, `${name} desktop`);
    if (name === "Chrome") await inspectVideos(desktopPage);
    if (name === "Chrome") await inspectInternalLinks(desktopPage);
    await desktop.close();

    const widths = fullMobileMatrix ? mobileWidths : [390];
    for (const width of widths) {
      const mobile = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
      const mobilePage = await mobile.newPage();
      for (const route of routes) await inspectPage(mobilePage, route, `${name} ${width}px`);
      if (width === 390) {
        await inspectMobileMenu(mobilePage);
        await inspectForms(mobilePage, "/contact");
        await inspectForms(mobilePage, "/quote");
      }
      await mobile.close();
    }

    if (name === "Chrome") {
      const stress = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const stressPage = await stress.newPage();
      for (const route of ["/", "/about"]) {
        await stressPage.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
        for (let index = 0; index < refreshCount; index += 1) await stressPage.reload({ waitUntil: "domcontentloaded" });
      }
      await stress.close();
    }
  } finally {
    await browser.close();
  }
}

await runBrowser("Chrome", chromium, true, { channel: "chrome" });
await runBrowser("Edge", chromium, false, { channel: "msedge" });
await runBrowser("Firefox", firefox);
await runBrowser("WebKit", webkit);

console.log(`QA complete: ${failures.length} failure(s), ${skipped.length} browser(s) skipped, ${refreshCount} refreshes per video page.`);
for (const message of skipped) console.log(`SKIP ${message}`);
if (failures.length) process.exitCode = 1;
