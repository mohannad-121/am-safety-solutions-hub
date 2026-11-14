import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:4180";
const routes = [
  "/resources/safety-net-risk-assessment-method-statement",
  "/resources/edge-protection-risk-assessment-method-statement",
  "/resources/loading-platform-risk-assessment-method-statement",
];

const browser = await chromium.launch({ headless: true, channel: "chrome" });

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const page = await context.newPage();

  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1Count: document.querySelectorAll("h1").length,
      title: document.title,
    }));

    if (result.overflow > 0 || result.h1Count !== 1 || !result.title) {
      throw new Error(`${route} failed mobile QA: ${JSON.stringify(result)}`);
    }

    console.log(`${route}: passed`);
  }
} finally {
  await browser.close();
}
