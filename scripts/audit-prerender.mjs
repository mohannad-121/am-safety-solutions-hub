import fs from "node:fs";
import { JSDOM } from "jsdom";

const xml = fs.readFileSync("public/sitemap.xml", "utf8");
const paths = [...xml.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
const rows = [];
for (const route of paths) {
  const file = route === "/" ? "dist/index.html" : `dist${route}/index.html`;
  if (!fs.existsSync(file)) { rows.push({ route, missingFile: true }); continue; }
  const document = new JSDOM(fs.readFileSync(file, "utf8")).window.document;
  const types = [];
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    const type = value["@type"];
    if (Array.isArray(type)) types.push(...type.map(String));
    else if (type) types.push(String(type));
    visit(value["@graph"]);
  };
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try { visit(JSON.parse(script.textContent || "")); } catch { types.push("INVALID"); }
  }
  const text = document.body.textContent?.replace(/\s+/g, " ") || "";
  const links = [...document.querySelectorAll('a[href^="/"]')];
  rows.push({
    route,
    title: Boolean(document.title),
    description: Boolean(document.querySelector('meta[name="description"]')?.getAttribute("content")),
    canonical: Boolean(document.querySelector('link[rel="canonical"]')?.getAttribute("href")),
    h1: document.querySelectorAll("h1").length,
    webpage: types.includes("WebPage"),
    trust: /technical review|content review|reviewed by/i.test(text),
    conversion: links.some((link) => /\/quote|\/contact/.test(link.getAttribute("href") || "")),
    genericAnchors: links.filter((link) => /^(learn more|click here|read more|view|more)$/i.test(link.textContent?.trim() || "")).length,
    clusterBlocks: document.querySelectorAll("[data-topic-cluster]").length,
  });
}

const summary = {
  checkedAt: new Date().toISOString(),
  routes: rows.length,
  missingFiles: rows.filter((row) => row.missingFile).length,
  missingTitles: rows.filter((row) => !row.title).length,
  missingDescriptions: rows.filter((row) => !row.description).length,
  missingCanonicals: rows.filter((row) => !row.canonical).length,
  invalidH1Counts: rows.filter((row) => row.h1 !== 1).length,
  missingWebPageSchema: rows.filter((row) => !row.webpage).length,
  missingVisibleReviewSignal: rows.filter((row) => !row.trust).length,
  missingConversionPath: rows.filter((row) => !row.conversion).length,
  genericInternalAnchors: rows.reduce((total, row) => total + (row.genericAnchors || 0), 0),
  topicClusterPages: rows.filter((row) => row.clusterBlocks > 0).length,
};
fs.mkdirSync("qa-artifacts", { recursive: true });
fs.writeFileSync("qa-artifacts/prerender-audit.json", JSON.stringify({ summary, rows }, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (summary.missingFiles || summary.missingTitles || summary.missingDescriptions || summary.missingCanonicals || summary.invalidH1Counts || summary.missingWebPageSchema || summary.missingConversionPath) process.exitCode = 1;
