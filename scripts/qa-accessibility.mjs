import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseURL = (process.env.QA_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const routes = ["/", "/products", "/edge-protection-systems-uae", "/safety-net-uae", "/loading-platforms-uae", "/resources/technical-library", "/articles", "/faq", "/contact", "/quote"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 1366 },
  { name: "mobile", width: 390, height: 844 },
];
const output = path.resolve("qa-artifacts", "accessibility");
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const records = [];

try {
  for (const route of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle", timeout: 45_000 });
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const serious = result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
      records.push({ route, viewport: viewport.name, status: response?.status(), violations: result.violations, seriousCount: serious.length });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ checkedAt: new Date().toISOString(), baseURL, records }, null, 2));
const failures = records.filter((record) => record.status !== 200 || record.seriousCount > 0);
console.log(`Accessibility QA completed ${records.length} route/viewport checks with ${failures.length} failing checks.`);
if (failures.length) {
  failures.forEach((failure) => console.error(`${failure.route} ${failure.viewport}: HTTP ${failure.status}, serious/critical violations ${failure.seriousCount}`));
  process.exitCode = 1;
}
