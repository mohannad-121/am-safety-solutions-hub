import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("supabase/functions/seo-integrations/index.ts", "utf8");
const migration = readFileSync("supabase/migrations/20261115100000_harden_seo_operations.sql", "utf8");

describe("SEO integrations backend security", () => {
  it("verifies the Supabase user and an allowed CMS role", () => {
    expect(source).toContain("client.auth.getUser(token)");
    expect(source).toContain('from("cms_admin_profiles")');
    expect(source).toContain("allowedRoles.has");
  });

  it("restricts crawler and Google targets to the configured HTTPS origin", () => {
    expect(source).toContain("approvedOrigin(body.siteUrl)");
    expect(source).toContain("The requested URL is outside the approved production origin");
    expect(source).toContain("Cross-origin URL rejected");
    expect(source).toMatch(/192\\\.168|169\\\.254/);
  });

  it("records runs, caches expensive results and tracks inspection budget", () => {
    expect(source).toContain('from("seo_integration_runs")');
    expect(source).toContain('from("seo_integration_cache")');
    expect(source).toContain('rpc("increment_seo_url_inspection_usage"');
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("Daily URL Inspection safety budget exceeded");
  });

  it("calculates real crawl graph signals instead of treating sitemap differences as orphans", () => {
    expect(source).toContain("inboundLinks");
    expect(source).toContain("clickDepth");
    expect(source).toContain("orphanPages");
    expect(source).toContain("sitemapOnlyPages");
    expect(source).toContain("crawledMissingFromSitemap");
  });
});
