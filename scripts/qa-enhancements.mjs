import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];

for (const config of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: { width: config.width, height: config.height }, reducedMotion: "no-preference" });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => errors.push(`${request.failure()?.errorText}: ${request.url()}`));

  await page.goto("http://127.0.0.1:4180/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForSelector(".interactive-product-card");
  await page.waitForTimeout(4200);
  const home = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    h1: document.querySelectorAll("h1").length,
    stats: [...document.querySelectorAll(".home-stat strong")].map((element) => element.textContent),
    cards: document.querySelectorAll(".interactive-product-card").length,
  }));
  if (config.name === "desktop") {
    await page.getByRole("button", { name: "Products" }).hover();
    home.mega = await page.locator("#products-mega-menu").isVisible();
    await page.locator(".interactive-product-card").first().hover();
    await page.waitForTimeout(800);
    home.hoverOpacity = await page.locator(".product-hover-image").first().evaluate((element) => getComputedStyle(element).opacity);
    await page.screenshot({ path: ".qa-home.png", fullPage: false });
  }

  await page.goto("http://127.0.0.1:4180/about", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForSelector(".story-step");
  const about = await page.evaluate(() => {
    const video = document.querySelector("#aboutHeroVideo");
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      h1: document.querySelectorAll("h1").length,
      loop: video?.loop,
      paused: video?.paused,
      steps: document.querySelectorAll(".story-step").length,
    };
  });
  await page.getByText("From Site Risk to Safer Execution").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  about.activeStart = await page.locator(".story-step.is-active").first().textContent();
  await page.locator(".story-step").last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  about.activeEnd = await page.locator(".story-step.is-active").first().textContent();
  await page.screenshot({ path: config.name === "desktop" ? ".qa-about.png" : ".qa-mobile.png", fullPage: false });
  results.push({ device: config.name, home, about, errors });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
