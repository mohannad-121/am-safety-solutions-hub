import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { chromium } from "playwright";
import { preview } from "vite";

const rootDir = path.resolve(process.cwd());
const distDir = path.join(rootDir, "dist");
const sitemapPath = path.join(distDir, "sitemap.xml");
const host = "127.0.0.1";
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once("error", reject);
  probe.listen(0, host, () => {
    const address = probe.address();
    const freePort = typeof address === "object" && address ? address.port : 4173;
    probe.close(() => resolve(freePort));
  });
});
const baseUrl = `http://${host}:${port}`;
const windowsChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function sitemapRoutes() {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  return [...new Set([...xml.matchAll(/<loc>https:\/\/www\.ambs\.ae([^<]*)<\/loc>/g)].map((match) => match[1] || "/"))];
}

function outputPath(route) {
  if (route === "/") return path.join(distDir, "index.html");
  return path.join(distDir, route.replace(/^\//, ""), "index.html");
}

const server = await preview({ root: rootDir, preview: { host, port, strictPort: true } });
try {
  const browser = await chromium.launch({
    headless: true,
    ...(process.platform === "win32" && fs.existsSync(windowsChrome) ? { executablePath: windowsChrome } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const failures = [];
  for (const route of sitemapRoutes()) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30000 });
    const title = await page.title();
    const h1Count = await page.locator("h1").count();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href").catch(() => null);
    if (!response || response.status() !== 200 || !title || h1Count !== 1 || !canonical) {
      failures.push(`${route}: status=${response?.status() ?? "none"}, title=${Boolean(title)}, h1=${h1Count}, canonical=${Boolean(canonical)}`);
      continue;
    }
    const target = outputPath(route);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, await page.content());
    console.log(`Prerendered ${route}`);
  }
  await browser.close();
  if (failures.length) throw new Error(`SEO prerender validation failed:\n${failures.join("\n")}`);
} finally {
  await new Promise((resolve) => server.httpServer.close(resolve));
}
