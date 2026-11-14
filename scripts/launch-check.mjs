import { existsSync, readFileSync, statSync } from "node:fs";

const errors = [];
const requiredFiles = [
  "public/assets/brand/ambs-logo.svg",
  "public/assets/brand/ambs-mark.svg",
  "public/sw.js",
  "public/sitemap.xml",
  "src/pages/Faq.tsx",
  "src/pages/Privacy.tsx",
  "src/pages/Terms.tsx",
];

for (const file of requiredFiles) {
  if (!existsSync(file) || statSync(file).size < 32) errors.push(`Missing or empty required file: ${file}`);
}

const environment = existsSync(".env") ? readFileSync(".env", "utf8") : "";
if (!/VITE_WHATSAPP_NUMBER\s*=\s*["']?971558556746/.test(environment)) errors.push("VITE_WHATSAPP_NUMBER is not configured with the approved number.");

const sitemap = existsSync("public/sitemap.xml") ? readFileSync("public/sitemap.xml", "utf8") : "";
for (const path of ["/faq", "/privacy", "/terms"]) {
  if (!sitemap.includes(`https://www.ambs.ae${path}`)) errors.push(`Sitemap is missing ${path}`);
}

if (sitemap.includes("/admin")) errors.push("Sitemap must not contain admin routes.");
const robots = existsSync("public/robots.txt") ? readFileSync("public/robots.txt", "utf8") : "";
if (!/Disallow:\s*\/admin\//.test(robots)) errors.push("robots.txt must disallow /admin/.");
const vercel = existsSync("vercel.json") ? readFileSync("vercel.json", "utf8") : "";
if (!vercel.includes("X-Robots-Tag") || !vercel.includes("noindex, nofollow")) errors.push("Admin X-Robots-Tag protection is missing from vercel.json.");

if (errors.length) {
  errors.forEach((error) => console.error(`ERROR ${error}`));
  process.exitCode = 1;
} else {
  console.log("Launch configuration check passed.");
}
