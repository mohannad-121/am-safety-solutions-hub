import { buildCanonicalUrl, getPublicSiteUrl, isProductionSiteUrlValid } from "@/lib/canonical";
import { runLiveCrawl } from "@/lib/seoIntegrations";

export type CanonicalIssueType = "missing" | "multiple" | "relative" | "wrong-domain" | "http" | "uppercase" | "trailing-slash" | "target-invalid" | "sitemap-mismatch" | "og-mismatch" | "schema-mismatch";
export type CanonicalFinding = { pageUrl: string; currentCanonical: string; expectedCanonical: string; issueType: CanonicalIssueType; severity: "critical" | "warning"; recommendedFix: string };
export type CanonicalAuditResult = { checkedAt: string; total: number; withCanonical: number; findings: CanonicalFinding[]; configurationValid: boolean };

function add(findings: CanonicalFinding[], pageUrl: string, currentCanonical: string, expectedCanonical: string, issueType: CanonicalIssueType, severity: CanonicalFinding["severity"], recommendedFix: string) {
  findings.push({ pageUrl, currentCanonical, expectedCanonical, issueType, severity, recommendedFix });
}

export async function runCanonicalAudit(): Promise<CanonicalAuditResult> {
  const siteUrl = getPublicSiteUrl();
  const crawl = await runLiveCrawl(250, true);
  const sitemapSet = new Set(crawl.sitemapUrls.map((url) => buildCanonicalUrl(url)));
  const pages = crawl.pages.filter((page) => sitemapSet.has(buildCanonicalUrl(page.requestedUrl)) || sitemapSet.has(buildCanonicalUrl(page.finalUrl)));
  const findings: CanonicalFinding[] = [];
  let withCanonical = 0;

  for (const page of pages) {
    const pageUrl = page.finalUrl;
    const expected = buildCanonicalUrl(page.requestedUrl);
    const current = page.canonical;
    if (page.status < 200 || page.status >= 400) add(findings, pageUrl, current, expected, "target-invalid", "critical", "Restore the indexable page or remove it from the sitemap after review.");
    if (!page.canonicalCount) add(findings, pageUrl, "", expected, "missing", "critical", "Add exactly one absolute self-referencing canonical in the HTML head.");
    else withCanonical += 1;
    if (page.canonicalCount > 1) add(findings, pageUrl, current, expected, "multiple", "critical", "Remove conflicting canonical elements and keep one approved URL.");
    if (page.canonicalRaw && !/^https?:\/\//i.test(page.canonicalRaw)) add(findings, pageUrl, page.canonicalRaw, expected, "relative", "critical", "Use an absolute canonical URL.");
    if (current) {
      const parsed = new URL(current);
      const master = new URL(siteUrl);
      if (parsed.protocol !== "https:") add(findings, pageUrl, current, expected, "http", "critical", "Use HTTPS in the canonical URL.");
      if (parsed.host !== master.host) add(findings, pageUrl, current, expected, "wrong-domain", "critical", `Use the approved master host ${master.host}.`);
      if (parsed.pathname !== parsed.pathname.toLowerCase()) add(findings, pageUrl, current, expected, "uppercase", "warning", "Use the lowercase public path.");
      if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) add(findings, pageUrl, current, expected, "trailing-slash", "warning", "Remove the trailing slash.");
      if (!sitemapSet.has(buildCanonicalUrl(current)) || current !== expected) add(findings, pageUrl, current, expected, "sitemap-mismatch", "critical", "Use the sitemap-aligned self canonical or remove the duplicate URL from the sitemap.");
      if (page.ogUrl !== current) add(findings, pageUrl, current, expected, "og-mismatch", "warning", "Set og:url to the canonical URL.");
      if (page.schemaUrls.some((url) => buildCanonicalUrl(url) !== buildCanonicalUrl(current))) add(findings, pageUrl, current, expected, "schema-mismatch", "warning", "Align WebPage, breadcrumb, Product or Article URL fields with the canonical.");
    }
  }

  return { checkedAt: crawl.checkedAt, total: pages.length, withCanonical, findings, configurationValid: isProductionSiteUrlValid() };
}
