import { buildCanonicalUrl, getPublicSiteUrl, isProductionSiteUrlValid } from "@/lib/canonical";

export type CanonicalIssueType = "missing" | "multiple" | "relative" | "wrong-domain" | "http" | "uppercase" | "trailing-slash" | "target-invalid" | "sitemap-mismatch" | "og-mismatch" | "schema-mismatch";
export type CanonicalFinding = { pageUrl: string; currentCanonical: string; expectedCanonical: string; issueType: CanonicalIssueType; severity: "critical" | "warning"; recommendedFix: string };
export type CanonicalAuditResult = { checkedAt: string; total: number; withCanonical: number; findings: CanonicalFinding[]; configurationValid: boolean };

function add(findings: CanonicalFinding[], pageUrl: string, currentCanonical: string, expectedCanonical: string, issueType: CanonicalIssueType, severity: CanonicalFinding["severity"], recommendedFix: string) {
  findings.push({ pageUrl, currentCanonical, expectedCanonical, issueType, severity, recommendedFix });
}

export async function runCanonicalAudit(): Promise<CanonicalAuditResult> {
  const siteUrl = getPublicSiteUrl();
  const sitemapResponse = await fetch(`${siteUrl}/sitemap.xml`, { cache: "no-store" });
  if (!sitemapResponse.ok) throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}.`);
  const sitemapDocument = new DOMParser().parseFromString(await sitemapResponse.text(), "application/xml");
  const urls = Array.from(sitemapDocument.querySelectorAll("loc"), (node) => node.textContent?.trim()).filter(Boolean) as string[];
  const sitemapSet = new Set(urls.map((url) => buildCanonicalUrl(url)));
  const findings: CanonicalFinding[] = [];
  let withCanonical = 0;
  for (const pageUrl of urls) {
    const expected = buildCanonicalUrl(pageUrl);
    const response = await fetch(pageUrl, { cache: "no-store", redirect: "follow" });
    const document = new DOMParser().parseFromString(await response.text(), "text/html");
    const nodes = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));
    const raw = nodes[0]?.getAttribute("href") || "";
    const current = raw ? new URL(raw, pageUrl).toString() : "";
    if (!response.ok) add(findings, pageUrl, current, expected, "target-invalid", "critical", "Restore the indexable page or remove it from the sitemap after review.");
    if (!nodes.length) add(findings, pageUrl, "", expected, "missing", "critical", "Add exactly one absolute self-referencing canonical in the HTML head.");
    else withCanonical += 1;
    if (nodes.length > 1) add(findings, pageUrl, current, expected, "multiple", "critical", "Remove conflicting canonical elements and keep one approved URL.");
    if (raw && !/^https?:\/\//i.test(raw)) add(findings, pageUrl, raw, expected, "relative", "critical", "Use an absolute canonical URL.");
    if (current) {
      const parsed = new URL(current);
      const master = new URL(siteUrl);
      if (parsed.protocol !== "https:") add(findings, pageUrl, current, expected, "http", "critical", "Use HTTPS in the canonical URL.");
      if (parsed.host !== master.host) add(findings, pageUrl, current, expected, "wrong-domain", "critical", `Use the approved master host ${master.host}.`);
      if (parsed.pathname !== parsed.pathname.toLowerCase()) add(findings, pageUrl, current, expected, "uppercase", "warning", "Use the lowercase public path.");
      if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) add(findings, pageUrl, current, expected, "trailing-slash", "warning", "Remove the trailing slash.");
      if (!sitemapSet.has(buildCanonicalUrl(current))) add(findings, pageUrl, current, expected, "sitemap-mismatch", "critical", "Make the canonical and sitemap URL identical.");
      if (current !== expected) add(findings, pageUrl, current, expected, "sitemap-mismatch", "critical", "Use the sitemap-aligned self canonical or remove the duplicate URL from the sitemap.");
    }
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content || "";
    if (current && ogUrl !== current) add(findings, pageUrl, current, expected, "og-mismatch", "warning", "Set og:url to the canonical URL.");
    const schemaText = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')).map((node) => node.textContent || "").join(" ");
    if (current && schemaText && !schemaText.includes(current)) add(findings, pageUrl, current, expected, "schema-mismatch", "warning", "Align WebPage, breadcrumb, Product or Article URL fields with the canonical.");
  }
  return { checkedAt: new Date().toISOString(), total: urls.length, withCanonical, findings, configurationValid: isProductionSiteUrlValid() };
}
