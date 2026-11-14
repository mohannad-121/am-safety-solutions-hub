import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const screenshotDir = path.resolve("docs/admin-qa-screenshots");
const reportPath = path.resolve("docs/admin-qa-report.md");
const modules = [
  "Dashboard", "Website Pages", "Products & Solutions", "Projects / Case Studies", "Training Center",
  "Resources", "Articles", "FAQs", "Media Library", "Image Locator", "Leads / Quote Requests",
  "Website Statistics", "Users & Roles", "Audit Logs", "Settings",
];

await mkdir(screenshotDir, { recursive: true });
const results = [];
const failure = (area, detail) => results.push({ area, status: "FAIL", detail });
const pass = (area, detail) => results.push({ area, status: "PASS", detail });

const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.on("console", message => { if (message.type() === "error" && !message.text().includes("Failed to load resource")) failure("Console", message.text()); });
  await page.goto(`${baseURL}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.setItem("admin_authenticated", "true");
    localStorage.setItem("admin_user", JSON.stringify({ id: "qa-admin", email: "qa@ambs.ae", role: "super_admin" }));
  });
  await page.goto(`${baseURL}/admin/dashboard`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Dashboard", exact: true }).waitFor();
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  robots?.includes("noindex") ? pass("Admin SEO", robots) : failure("Admin SEO", `Unexpected robots value: ${robots}`);

  for (const module of modules) {
    const button = page.getByRole("button", { name: module, exact: true }).first();
    await button.click();
    await page.getByRole("heading", { name: module, exact: true }).first().waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    overflow <= 2 ? pass(`Navigation: ${module}`, "Loaded without horizontal page overflow") : failure(`Navigation: ${module}`, `Horizontal overflow ${overflow}px`);
  }

  await page.getByRole("button", { name: "Image Locator", exact: true }).first().click();
  await page.locator('button[data-slot-id="shared.edge-protection"]').click();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(path.resolve("public/assets/images/edge-protection-systems.jpg"));
  await page.getByRole("button", { name: "Save Draft Image", exact: true }).click();
  await page.getByText("Draft image saved. The public website has not changed.").waitFor({ timeout: 15000 });
  pass("Image draft", "Upload validated and saved without changing the public image");

  await page.getByRole("button", { name: "Apply to Website", exact: true }).click();
  await page.getByText(/Image applied successfully/).waitFor({ timeout: 15000 });
  pass("Image publish", "Apply to Website completed");
  await page.goto(`${baseURL}/products`, { waitUntil: "domcontentloaded" });
  const reflected = await page.locator('img[alt*="edge protection" i]').first().getAttribute("src");
  reflected?.startsWith("data:image") || reflected?.includes("cms-media") ? pass("Public reflection", "Published image is read by the public product view") : failure("Public reflection", `Public image remained ${reflected}`);

  await page.goto(`${baseURL}/admin/dashboard`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Image Locator", exact: true }).first().click();
  await page.locator('button[data-slot-id="shared.edge-protection"]').click();
  const rollbackButton = page.getByRole("button", { name: "Rollback", exact: true });
  await rollbackButton.click();
  await page.getByText(/Previous image restored/).waitFor({ timeout: 15000 });
  pass("Image rollback", "Previous published version restored");
  await page.screenshot({ path: path.join(screenshotDir, "image-locator-desktop.png"), fullPage: true });
  await context.close();

  const mediaContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mediaContext.newPage();
  await mobile.goto(`${baseURL}/admin/login`, { waitUntil: "domcontentloaded" });
  await mobile.evaluate(() => {
    localStorage.setItem("admin_authenticated", "true");
    localStorage.setItem("admin_user", JSON.stringify({ id: "qa-media", email: "media@ambs.ae", role: "media_manager" }));
  });
  await mobile.goto(`${baseURL}/admin/dashboard`, { waitUntil: "domcontentloaded" });
  await mobile.getByLabel("Admin section").selectOption("Image Locator");
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  mobileOverflow <= 2 ? pass("Mobile admin", "390px layout has no page overflow") : failure("Mobile admin", `Horizontal overflow ${mobileOverflow}px`);
  const applyDisabled = await mobile.getByRole("button", { name: "Apply to Website", exact: true }).isDisabled();
  applyDisabled ? pass("Media Manager permission", "Live publishing is disabled") : failure("Media Manager permission", "Live publish was enabled");
  await mobile.screenshot({ path: path.join(screenshotDir, "image-locator-mobile.png"), fullPage: true });
  await mediaContext.close();
} finally {
  await browser.close();
}

const failed = results.filter(result => result.status === "FAIL");
const report = [
  "# AMBS Admin QA Report", "", `Generated: ${new Date().toISOString()}`, "",
  `Summary: ${results.length - failed.length} passed, ${failed.length} failed.`, "",
  "| Area | Status | Detail |", "| --- | --- | --- |",
  ...results.map(result => `| ${result.area} | ${result.status} | ${String(result.detail).replaceAll("|", "\\|")} |`), "",
  "Screenshots:", "- `docs/admin-qa-screenshots/image-locator-desktop.png`", "- `docs/admin-qa-screenshots/image-locator-mobile.png`", "",
].join("\n");
await writeFile(reportPath, report, "utf8");
console.log(`Admin QA complete: ${results.length - failed.length} passed, ${failed.length} failed.`);
if (failed.length) process.exitCode = 1;
