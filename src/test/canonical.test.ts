import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, canonicalIssueList, isPrivateOrNonIndexablePath, normalizePublicPath } from "@/lib/canonical";

describe("canonical URL policy", () => {
  it("creates absolute lowercase HTTPS URLs without tracking or trailing slashes", () => {
    expect(buildCanonicalUrl("HTTP://other.test/Safety-Nets/?utm_source=x&gclid=y")).toBe("https://www.ambs.ae/safety-nets");
    expect(buildCanonicalUrl("/")).toBe("https://www.ambs.ae/");
  });
  it("preserves only approved indexable parameters", () => {
    expect(buildCanonicalUrl("/articles?page=2&sort=old&utm_medium=cpc", { preservePageParameter: true })).toBe("https://www.ambs.ae/articles?page=2");
  });
  it("identifies unsafe canonical targets", () => {
    expect(isPrivateOrNonIndexablePath("/admin/pages")).toBe(true);
    expect(canonicalIssueList("/relative")).toContain("Canonical must be an absolute URL.");
    expect(normalizePublicPath("//Safety-Nets///")).toBe("/safety-nets");
  });
});

describe("public sitemap policy", () => {
  it("contains unique canonical-form public URLs only", () => {
    const xml = fs.readFileSync(path.resolve("public/sitemap.xml"), "utf8");
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url).toBe(buildCanonicalUrl(url));
      expect(new URL(url).pathname.startsWith("/admin")).toBe(false);
    }
  });
});
