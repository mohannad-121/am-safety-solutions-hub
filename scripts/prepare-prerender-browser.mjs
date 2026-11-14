import { spawnSync } from "node:child_process";

if (!process.env.VERCEL) {
  console.log("Using the local browser for SEO prerendering.");
  process.exit(0);
}

console.log("Installing the Playwright Chromium build required for SEO prerendering on Vercel.");
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["playwright", "install", "chromium"], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
