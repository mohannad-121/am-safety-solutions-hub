import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCanonicalUrl } from "@/lib/canonical";
import { getSeoIntegrationStatus, runLiveCrawl, seoIntegrationsEnabled, type CrawlPage } from "@/lib/seoIntegrations";
import { clusterForPath } from "@/lib/topicClusters";

const client = supabase as unknown as SupabaseClient;

export type SeoCategory =
  | "technical"
  | "onPage"
  | "content"
  | "image"
  | "structured"
  | "internal"
  | "performance"
  | "aiReadiness"
  | "canonical"
  | "eeat"
  | "helpfulContent"
  | "topicClusters"
  | "conversion";
export type SeoIssue = {
  id: string;
  pageUrl: string;
  category: SeoCategory;
  severity: "urgent" | "warning" | "suggestion";
  title: string;
  detail: string;
  suggestedAction: string;
};
export type SeoAuditReport = {
  id: string;
  createdAt: string;
  sourceUrl: string;
  overallScore: number;
  categoryScores: Record<SeoCategory, number | null>;
  pagesChecked: number;
  issues: SeoIssue[];
  measurementCoverage: number;
  unmeasuredCategories: SeoCategory[];
  categoryEvidence: Record<SeoCategory, {
    measured: boolean;
    source: string;
    findings: number;
    pagesAffected: number;
    requirementsMissing: number;
  }>;
  integrations: {
    searchConsole: boolean;
    pageSpeed: boolean;
    openAi: boolean;
    competitor: boolean;
  };
};
export type SeoTask = SeoIssue & {
  status: "new" | "in_review" | "draft_created" | "ignored" | "done";
  createdAt: string;
  createdBy: string;
};

const historyKey = "ambs_seo_audit_history_v1";
const taskKey = "ambs_seo_tasks_v1";
const weights: Record<SeoCategory, number> = {
  technical: 10,
  onPage: 15,
  content: 10,
  image: 5,
  structured: 10,
  internal: 10,
  performance: 5,
  aiReadiness: 5,
  canonical: 10,
  eeat: 5,
  helpfulContent: 5,
  topicClusters: 5,
  conversion: 5,
};

function envEnabled(value: unknown) {
  return typeof value === "string" && value.trim().toLowerCase() === "true";
}

function issue(
  pageUrl: string,
  category: SeoCategory,
  severity: SeoIssue["severity"],
  title: string,
  detail: string,
  suggestedAction: string,
): SeoIssue {
  return {
    id: crypto.randomUUID(),
    pageUrl,
    category,
    severity,
    title,
    detail,
    suggestedAction,
  };
}

function scoreFor(category: SeoCategory, pages: number, issues: SeoIssue[]) {
  if (!pages) return 0;
  const findings = issues.filter((item) => item.category === category);
  if (!findings.length) return 100;
  const severityRank = { suggestion: 1, warning: 2, urgent: 3 } as const;
  const highestSeverityByPage = new Map<string, SeoIssue["severity"]>();
  findings.forEach((finding) => {
    const current = highestSeverityByPage.get(finding.pageUrl);
    if (!current || severityRank[finding.severity] > severityRank[current]) highestSeverityByPage.set(finding.pageUrl, finding.severity);
  });
  const weightedAffectedPages = [...highestSeverityByPage.values()].reduce(
    (total, severity) => total + (severity === "urgent" ? 100 : severity === "warning" ? 45 : 15),
    0,
  );
  const duplicateFindingPenalty = Math.max(0, findings.length - highestSeverityByPage.size) * 2;
  let score = Math.max(0, Math.round(100 - weightedAffectedPages / pages - duplicateFindingPenalty));
  if (findings.some((item) => item.severity === "urgent")) score = Math.min(score, 69);
  else if (findings.some((item) => item.severity === "warning")) score = Math.min(score, 89);
  else score = Math.min(score, 99);
  return score;
}

export function readSeoAuditHistory(): SeoAuditReport[] {
  try {
    return JSON.parse(
      localStorage.getItem(historyKey) || "[]",
    ) as SeoAuditReport[];
  } catch {
    return [];
  }
}

export async function persistSeoAudit(report: SeoAuditReport) {
  const history = [report, ...readSeoAuditHistory()].slice(0, 30);
  if (seoIntegrationsEnabled) {
    const result = await client.from("seo_audits").insert({
      id: report.id,
      source_url: report.sourceUrl,
      overall_score: report.overallScore,
      category_scores: report.categoryScores,
      pages_checked: report.pagesChecked,
      issues: report.issues,
      integrations: report.integrations,
      created_at: report.createdAt,
    });
    if (result.error) throw new Error(`SEO audit could not be persisted: ${result.error.message}`);
  }
  localStorage.setItem(historyKey, JSON.stringify(history));
  return history;
}

export async function createSeoTask(
  finding: SeoIssue,
  auditId: string,
  userId: string,
) {
  const task: SeoTask = {
    ...finding,
    status: "new",
    createdAt: new Date().toISOString(),
    createdBy: userId,
  };
  let tasks: SeoTask[] = [];
  try {
    tasks = JSON.parse(localStorage.getItem(taskKey) || "[]") as SeoTask[];
  } catch {
    // Start a clean local queue when old browser data is invalid.
  }
  if (seoIntegrationsEnabled) {
    const result = await client.from("seo_tasks").insert({
      id: task.id,
      audit_id: auditId,
      page_url: task.pageUrl,
      category: task.category,
      priority: task.severity,
      issue: task.title,
      suggested_fix: task.suggestedAction,
      status: "new",
      source: "manual_audit",
      created_by: userId,
    });
    if (result.error) throw new Error(`SEO task could not be saved to Supabase: ${result.error.message}`);
  }
  localStorage.setItem(
    taskKey,
    JSON.stringify([task, ...tasks.filter((item) => item.id !== task.id)].slice(0, 500)),
  );
  return task;
}

function absoluteUrl(path: string, origin: string) {
  try {
    const parsed = new URL(path, origin);
    return new URL(`${parsed.pathname}${parsed.search}`, origin).toString();
  } catch {
    return `${origin}${path}`;
  }
}

function reportFromCrawler(origin: string, pages: CrawlPage[], issues: SeoIssue[], integrations: SeoAuditReport["integrations"], createdAt: string): SeoAuditReport {
  const categories = Object.keys(weights) as SeoCategory[];
  const categoryScores = Object.fromEntries(categories.map((category) => [category, category === "performance" ? null : scoreFor(category, pages.length, issues)])) as Record<SeoCategory, number | null>;
  const measured = categories.filter((category) => categoryScores[category] !== null);
  const measuredWeight = measured.reduce((total, category) => total + weights[category], 0);
  const totalWeight = categories.reduce((total, category) => total + weights[category], 0);
  const overallScore = Math.round(categories.reduce((total, category) => total + (categoryScores[category] || 0) * weights[category], 0) / totalWeight);
  const categoryEvidence = Object.fromEntries(categories.map((category) => {
    const categoryIssues = issues.filter((item) => item.category === category);
    return [category, {
      measured: categoryScores[category] !== null,
      source: category === "performance" ? "PageSpeed, Lighthouse or CrUX integration required" : "Authenticated server-side production crawl",
      findings: categoryIssues.length,
      pagesAffected: new Set(categoryIssues.map((item) => item.pageUrl)).size,
      requirementsMissing: categoryIssues.length + (categoryScores[category] === null ? 1 : 0),
    }];
  })) as SeoAuditReport["categoryEvidence"];
  return {
    id: crypto.randomUUID(), createdAt, sourceUrl: origin, overallScore, categoryScores,
    pagesChecked: pages.length, issues,
    measurementCoverage: Math.round(measuredWeight / totalWeight * 100),
    unmeasuredCategories: categories.filter((category) => categoryScores[category] === null),
    categoryEvidence, integrations,
  };
}

async function runServerSeoAudit(onProgress?: (message: string, completed: number, total: number) => void): Promise<SeoAuditReport> {
  onProgress?.("Running authenticated production crawl", 0, 1);
  const [crawl, status] = await Promise.all([
    runLiveCrawl(250, true),
    getSeoIntegrationStatus().catch(() => ({ searchConsole: false, pageSpeed: false, crux: false, siteUrl: null })),
  ]);
  const sitemapSet = new Set(crawl.sitemapUrls.map((url) => buildCanonicalUrl(url)));
  const pages = crawl.pages.filter((page) => sitemapSet.has(buildCanonicalUrl(page.requestedUrl)) || sitemapSet.has(buildCanonicalUrl(page.finalUrl)));
  const issues: SeoIssue[] = [];

  pages.forEach((page, index) => {
    onProgress?.(`Evaluating ${new URL(page.finalUrl).pathname}`, index + 1, pages.length);
    const pageUrl = page.finalUrl;
    const pathname = new URL(pageUrl).pathname;
    const expectedCanonical = buildCanonicalUrl(page.requestedUrl);
    const linkedPaths = new Set(page.internalLinkList.map((link) => new URL(link.url).pathname));
    const articlePage = pathname.startsWith("/articles/") || (pathname.startsWith("/resources/") && !["/resources/technical-library", "/resources/risk-assessment-method-statement"].includes(pathname));

    if (page.status < 200 || page.status >= 400) issues.push(issue(pageUrl, "technical", "urgent", `Page returned HTTP ${page.status}`, "The sitemap URL is not returning a successful response.", "Restore the route or remove it from the sitemap after an SEO review."));
    if (!page.title) issues.push(issue(pageUrl, "onPage", "urgent", "Missing page title", "No HTML title was found.", "Create a unique title draft and review it before publishing."));
    else if (page.title.length < 25 || page.title.length > 65) issues.push(issue(pageUrl, "onPage", "warning", "Title length needs review", `The title contains ${page.title.length} characters.`, "Review the title without removing established keywords."));
    if (!page.description) issues.push(issue(pageUrl, "onPage", "warning", "Missing meta description", "No meta description was found.", "Create a description as a draft; do not replace live metadata automatically."));
    if (!page.canonical) issues.push(issue(pageUrl, "technical", "urgent", "Missing canonical", "The page has no canonical link.", "Add a self-referencing canonical after confirming the preferred URL."));
    else if (page.canonical !== expectedCanonical) issues.push(issue(pageUrl, "canonical", "urgent", "Canonical differs from sitemap URL", `Found ${page.canonical}; expected ${expectedCanonical}.`, "Align the self canonical, sitemap, Open Graph and schema URL."));
    if (!page.indexable) issues.push(issue(pageUrl, "technical", "urgent", "Public page is not indexable", "The response or robots metadata prevents indexing.", "Confirm the intended public indexing state before changing it."));
    if (page.h1.length !== 1) issues.push(issue(pageUrl, "onPage", "warning", "H1 structure needs review", `Found ${page.h1.length} H1 elements.`, "Keep one descriptive primary heading without rewriting other content."));
    if (page.textLength < 500) issues.push(issue(pageUrl, "content", "warning", "Page may be thin", `Only ${page.textLength} visible characters were detected.`, "Review whether useful original technical detail is missing."));
    page.imagesMissingAlt.forEach(() => issues.push(issue(pageUrl, "image", "warning", "Image missing alt text", "An image has no descriptive alt attribute.", "Prepare an alt-text draft and require approval before saving.")));
    if (!page.schemaTypes.includes("WebPage")) issues.push(issue(pageUrl, "structured", "warning", "Missing WebPage schema", "No WebPage JSON-LD type was found in prerendered HTML.", "Create a WebPage schema draft from the real page title, description, canonical and breadcrumb."));
    if (articlePage && !page.schemaTypes.some((type) => type === "Article" || type === "BlogPosting")) issues.push(issue(pageUrl, "structured", "warning", "Missing Article schema", "This article or resource page has no Article or BlogPosting JSON-LD type.", "Create a draft using only the real title, description, author/publisher and available dates."));
    if (!articlePage && page.schemaTypes.some((type) => type === "Article" || type === "BlogPosting")) issues.push(issue(pageUrl, "structured", "urgent", "Schema needs review: wrong page type", "Article schema appears on a non-article page.", "Review the source block manually; do not delete valid schema automatically."));
    if (page.invalidJsonLd) issues.push(issue(pageUrl, "structured", "urgent", "Invalid JSON-LD", `${page.invalidJsonLd} structured-data block(s) are not valid JSON.`, "Repair only the invalid block in the editor and validate before publishing."));
    const duplicateSchemaTypes = [...new Set(page.schemaTypes.filter((type, typeIndex) => page.schemaTypes.indexOf(type) !== typeIndex && ["Organization", "WebPage", "Article", "BlogPosting"].includes(type)))];
    if (duplicateSchemaTypes.length) issues.push(issue(pageUrl, "structured", "warning", "Schema needs review: duplicate schema", `Duplicate high-level schema types: ${duplicateSchemaTypes.join(", ")}.`, "Review identifiers and remove only genuinely duplicate or conflicting blocks."));
    if (page.schemaUrls.some((value) => { try { return buildCanonicalUrl(value) !== buildCanonicalUrl(page.canonical || pageUrl); } catch { return true; } })) issues.push(issue(pageUrl, "structured", "urgent", "Schema needs review: conflicting canonical", "Structured data contains URL values that do not align with the page canonical.", "Correct only the conflicting schema URLs after manual review."));
    if (!page.internalLinks) issues.push(issue(pageUrl, "internal", "suggestion", "No internal links detected", "The page does not link to another AMBS page.", "Suggest relevant product or resource links for editorial review."));
    if (page.genericAnchorCount) issues.push(issue(pageUrl, "internal", "warning", "Generic internal-link anchors", `${page.genericAnchorCount} internal link(s) use non-descriptive anchor text.`, "Replace generic labels with text that names the destination or action."));
    const nonSitemapTargets = [...linkedPaths].filter((target) => !sitemapSet.has(buildCanonicalUrl(target)) && !target.startsWith("/admin"));
    if (nonSitemapTargets.length) issues.push(issue(pageUrl, "internal", "warning", "Internal targets missing from sitemap", `${nonSitemapTargets.length} linked route(s) are not declared in the public sitemap.`, "Confirm each target is indexable, intentionally redirected or remove the link."));
    const cluster = clusterForPath(pathname);
    if (cluster) {
      const expectedPaths = [cluster.pillar, ...cluster.supporting, ...cluster.products, ...cluster.resources].map((link) => link.path).filter((path) => path !== pathname);
      const missingClusterLinks = expectedPaths.filter((path) => !linkedPaths.has(path));
      if (!page.topicClusterIds.includes(cluster.id)) issues.push(issue(pageUrl, "topicClusters", "warning", "Topic cluster block is not visible", `The ${cluster.label} page has no visible cluster navigation.`, "Render the shared related-cluster section on this public page."));
      if (missingClusterLinks.length) issues.push(issue(pageUrl, "topicClusters", "warning", "Topic cluster links are incomplete", `Missing ${missingClusterLinks.length} declared cluster link(s).`, "Add crawlable descriptive links between the pillar, supporting, product and resource pages."));
    } else if (page.internalLinks < 3) issues.push(issue(pageUrl, "topicClusters", "suggestion", "Limited topic-cluster connections", `Only ${page.internalLinks} internal links were detected.`, "Add editorially relevant links to the pillar, supporting guidance and conversion route."));
    if (!page.reviewSignal) issues.push(issue(pageUrl, "eeat", "suggestion", "Authorship or review signal not visible", "No visible organizational authorship or technical-review signal was detected.", "Add a truthful author/review owner and review policy link without inventing credentials."));
    const helpfulContentEligible = /^\/(?:products|articles|resources|standards|safety|temporary|loading|vertical|work-at-height|what-is|edge-protection|engineering|high-risk|steel-fabrication)/.test(pathname);
    if (helpfulContentEligible && !page.helpfulContentSignal) issues.push(issue(pageUrl, "helpfulContent", "suggestion", "Helpful-content structure can improve", "No concise answer, checklist, practical application or FAQ marker was detected.", "Review whether a concise answer and task-focused checks would improve the page."));
    if (!page.internalLinkList.some((link) => /\/quote|\/contact/.test(new URL(link.url).pathname))) issues.push(issue(pageUrl, "conversion", "suggestion", "No clear enquiry path detected", "The page has no internal link to quote or contact.", "Add a relevant project enquiry path without weakening technical content."));
    if (!page.schemaTypes.some((type) => ["FAQPage", "Product", "Article", "LocalBusiness", "Organization"].includes(type))) issues.push(issue(pageUrl, "aiReadiness", "suggestion", "Entity context can improve", "No page-specific entity type was detected.", "Review whether page-specific schema and concise answer content are appropriate."));
  });

  crawl.orphanPages.forEach((pageUrl) => issues.push(issue(pageUrl, "internal", "urgent", "Orphan sitemap page", "No crawlable internal link from another sitemap page was detected.", "Add a descriptive contextual, navigation or cluster link to this page.")));
  crawl.brokenLinks.forEach((link) => issues.push(issue(link.url, "technical", "urgent", `Broken internal link returned HTTP ${link.status || 0}`, "A crawled internal target could not be loaded.", "Repair or remove the broken internal link after review.")));

  return reportFromCrawler(crawl.siteUrl, pages, issues, {
    searchConsole: status.searchConsole,
    pageSpeed: status.pageSpeed,
    openAi: envEnabled(import.meta.env.VITE_AI_SUGGESTIONS_CONNECTED),
    competitor: envEnabled(import.meta.env.VITE_COMPETITOR_AUDIT_CONNECTED),
  }, crawl.checkedAt);
}

async function runBrowserSeoAudit(
  onProgress?: (message: string, completed: number, total: number) => void,
): Promise<SeoAuditReport> {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_SITE_URL as
    | string
    | undefined;
  const origin = (configuredOrigin || window.location.origin).replace(
    /\/$/,
    "",
  );
  onProgress?.("Reading public sitemap", 0, 1);
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`, {
    cache: "no-store",
  });
  if (!sitemapResponse.ok)
    throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}.`);
  const sitemap = new DOMParser().parseFromString(
    await sitemapResponse.text(),
    "application/xml",
  );
  const urls = Array.from(sitemap.querySelectorAll("loc"), (node) =>
    node.textContent?.trim(),
  ).filter(Boolean) as string[];
  const issues: SeoIssue[] = [];
  const sitemapPaths = new Set(urls.map((url) => new URL(url).pathname.replace(/\/$/, "") || "/"));
  const inboundCounts = new Map<string, number>([...sitemapPaths].map((path) => [path, 0]));

  for (let index = 0; index < urls.length; index += 1) {
    const pageUrl = absoluteUrl(urls[index], origin);
    onProgress?.(
      `Checking ${new URL(pageUrl).pathname}`,
      index + 1,
      urls.length,
    );
    try {
      const response = await fetch(pageUrl, {
        cache: "no-store",
        redirect: "follow",
      });
      if (!response.ok) {
        issues.push(
          issue(
            pageUrl,
            "technical",
            "urgent",
            `Page returned HTTP ${response.status}`,
            "The sitemap URL is not returning a successful response.",
            "Restore the route or remove it from the sitemap after an SEO review.",
          ),
        );
        continue;
      }
      const document = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const title = document.querySelector("title")?.textContent?.trim() || "";
      const description =
        document
          .querySelector<HTMLMetaElement>('meta[name="description"]')
          ?.content.trim() || "";
      const canonical =
        document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
          ?.href || "";
      const robots =
        document.querySelector<HTMLMetaElement>('meta[name="robots"]')
          ?.content || "";
      const headings = document.querySelectorAll("h1");
      const text = document.body.textContent?.replace(/\s+/g, " ").trim() || "";
      const images = Array.from(document.images);
      const pathname = new URL(pageUrl).pathname;
      const internalLinks = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'),
      );
      internalLinks.forEach((link) => {
        const targetPath = new URL(link.getAttribute("href") || "/", pageUrl).pathname.replace(/\/$/, "") || "/";
        if (sitemapPaths.has(targetPath) && targetPath !== pathname) inboundCounts.set(targetPath, (inboundCounts.get(targetPath) || 0) + 1);
      });
      const absoluteInternalLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
        .map((link) => link.href)
        .filter((href) => { try { return new URL(href, pageUrl).origin === new URL(pageUrl).origin; } catch { return false; } });
      const schemaNodes = Array.from(
        document.querySelectorAll<HTMLScriptElement>(
          'script[type="application/ld+json"]',
        ),
      );
      const parsedSchemas: unknown[] = [];
      let invalidSchemaBlocks = 0;
      for (const node of schemaNodes) {
        try { parsedSchemas.push(JSON.parse(node.textContent || "")); }
        catch { invalidSchemaBlocks += 1; }
      }
      const collectSchemaTypes = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.flatMap(collectSchemaTypes);
        if (!value || typeof value !== "object") return [];
        const record = value as Record<string, unknown>;
        const own = Array.isArray(record["@type"]) ? (record["@type"] as unknown[]).map(String) : typeof record["@type"] === "string" ? [record["@type"]] : [];
        return [...own, ...collectSchemaTypes(record["@graph"])];
      };
      const collectSchemaUrls = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.flatMap(collectSchemaUrls);
        if (!value || typeof value !== "object") return [];
        const record = value as Record<string, unknown>;
        const type = record["@type"];
        const pageEntity = typeof type === "string" && ["WebPage", "Article", "BlogPosting"].includes(type);
        const own = [record.mainEntityOfPage, pageEntity ? record.url : undefined].filter((entry): entry is string => typeof entry === "string");
        return [...own, ...collectSchemaUrls(record["@graph"])];
      };
      const schemaTypes = parsedSchemas.flatMap(collectSchemaTypes);
      const schemaUrls = parsedSchemas.flatMap(collectSchemaUrls);
      const articlePage = pathname.startsWith("/articles/") || (pathname.startsWith("/resources/") && !["/resources/technical-library", "/resources/risk-assessment-method-statement"].includes(pathname));

      if (!title)
        issues.push(
          issue(
            pageUrl,
            "onPage",
            "urgent",
            "Missing page title",
            "No HTML title was found.",
            "Create a unique title draft and review it before publishing.",
          ),
        );
      else if (title.length < 25 || title.length > 65)
        issues.push(
          issue(
            pageUrl,
            "onPage",
            "warning",
            "Title length needs review",
            `The title contains ${title.length} characters.`,
            "Review the title without removing established keywords.",
          ),
        );
      if (!description)
        issues.push(
          issue(
            pageUrl,
            "onPage",
            "warning",
            "Missing meta description",
            "No meta description was found.",
            "Create a description as a draft; do not replace live metadata automatically.",
          ),
        );
      if (!canonical)
        issues.push(
          issue(
            pageUrl,
            "technical",
            "urgent",
            "Missing canonical",
            "The page has no canonical link.",
            "Add a self-referencing canonical after confirming the preferred URL.",
          ),
        );
      else {
        const expectedCanonical = new URL(pageUrl); expectedCanonical.search = ""; expectedCanonical.hash = ""; expectedCanonical.pathname = expectedCanonical.pathname === "/" ? "/" : expectedCanonical.pathname.toLowerCase().replace(/\/$/, "");
        if (canonical !== expectedCanonical.toString()) issues.push(issue(pageUrl, "canonical", "urgent", "Canonical differs from sitemap URL", `Found ${canonical}; expected ${expectedCanonical.toString()}.`, "Align the self canonical, sitemap, Open Graph and schema URL."));
        if (!/^https:\/\//.test(canonical)) issues.push(issue(pageUrl, "canonical", "urgent", "Canonical is not HTTPS", canonical, "Use the approved HTTPS master URL."));
      }
      if (/noindex/i.test(robots))
        issues.push(
          issue(
            pageUrl,
            "technical",
            "urgent",
            "Public page is noindex",
            "Robots metadata prevents indexing.",
            "Confirm intent before removing noindex.",
          ),
        );
      if (headings.length !== 1)
        issues.push(
          issue(
            pageUrl,
            "onPage",
            "warning",
            "H1 structure needs review",
            `Found ${headings.length} H1 elements.`,
            "Keep one descriptive primary heading without rewriting other content.",
          ),
        );
      if (text.length < 500)
        issues.push(
          issue(
            pageUrl,
            "content",
            "warning",
            "Page may be thin",
            `Only ${text.length} visible characters were detected.`,
            "Review whether useful original technical detail is missing.",
          ),
        );
      images
        .filter((image) => !image.getAttribute("alt")?.trim())
        .forEach(() =>
          issues.push(
            issue(
              pageUrl,
              "image",
              "warning",
              "Image missing alt text",
              "An image has no descriptive alt attribute.",
              "Prepare an alt-text draft and require approval before saving.",
            ),
          ),
        );
      if (!schemaTypes.includes("WebPage"))
        issues.push(
          issue(
            pageUrl,
            "structured",
            "warning",
            "Missing WebPage schema",
            "No WebPage JSON-LD type was found in prerendered HTML.",
            "Create a WebPage schema draft from the real page title, description, canonical and breadcrumb.",
          ),
        );
      if (articlePage && !schemaTypes.some((type) => type === "Article" || type === "BlogPosting")) issues.push(issue(pageUrl, "structured", "warning", "Missing Article schema", "This article or resource page has no Article or BlogPosting JSON-LD type.", "Create a draft using only the real title, description, author/publisher and available dates."));
      if (!articlePage && schemaTypes.some((type) => type === "Article" || type === "BlogPosting")) issues.push(issue(pageUrl, "structured", "urgent", "Schema needs review: wrong page type", "Article schema appears on a non-article page.", "Review the source block manually; do not delete valid schema automatically."));
      if (invalidSchemaBlocks) issues.push(issue(pageUrl, "structured", "urgent", "Invalid JSON-LD", `${invalidSchemaBlocks} structured-data block(s) are not valid JSON.`, "Repair only the invalid block in the editor and validate before publishing."));
      const duplicateSchemaTypes = [...new Set(schemaTypes.filter((type, index) => schemaTypes.indexOf(type) !== index && ["Organization", "WebPage", "Article", "BlogPosting"].includes(type)))];
      if (duplicateSchemaTypes.length) issues.push(issue(pageUrl, "structured", "warning", "Schema needs review: duplicate schema", `Duplicate high-level schema types: ${duplicateSchemaTypes.join(", ")}.`, "Review identifiers and remove only genuinely duplicate or conflicting blocks."));
      const conflictingSchemaUrls = schemaUrls.filter((value) => { try { return buildCanonicalUrl(value) !== buildCanonicalUrl(canonical || pageUrl); } catch { return true; } });
      if (conflictingSchemaUrls.length) issues.push(issue(pageUrl, "structured", "urgent", "Schema needs review: conflicting canonical", `Structured data contains ${conflictingSchemaUrls.length} URL value(s) that do not align with the page canonical.`, "Correct only the conflicting schema URLs after manual review."));
      if (!internalLinks.length)
        issues.push(
          issue(
            pageUrl,
            "internal",
            "suggestion",
            "No internal links detected",
            "The page does not link to another AMBS page.",
            "Suggest relevant product or resource links for editorial review.",
          ),
        );
      const genericAnchors = internalLinks.filter((link) => /^(learn more|click here|read more|view|more)$/i.test(link.textContent?.trim() || ""));
      if (genericAnchors.length) issues.push(issue(pageUrl, "internal", "warning", "Generic internal-link anchors", `${genericAnchors.length} internal link(s) use non-descriptive anchor text.`, "Replace generic labels with text that names the destination or action."));
      const nonSitemapTargets = internalLinks.map((link) => new URL(link.getAttribute("href") || "/", pageUrl).pathname.replace(/\/$/, "") || "/").filter((target) => !sitemapPaths.has(target) && !target.startsWith("/admin"));
      if (nonSitemapTargets.length) issues.push(issue(pageUrl, "internal", "warning", "Internal targets missing from sitemap", `${new Set(nonSitemapTargets).size} linked route(s) are not declared in the public sitemap.`, "Confirm each target is indexable, intentionally redirected or remove the link."));
      const cluster = clusterForPath(pathname);
      if (cluster) {
        const expectedPaths = [cluster.pillar, ...cluster.supporting, ...cluster.products, ...cluster.resources].map((link) => link.path).filter((path) => path !== pathname);
        const linkedPaths = new Set(internalLinks.map((link) => new URL(link.getAttribute("href") || "/", pageUrl).pathname));
        const missingClusterLinks = expectedPaths.filter((path) => !linkedPaths.has(path));
        if (!document.querySelector(`[data-topic-cluster="${cluster.id}"]`)) issues.push(issue(pageUrl, "topicClusters", "warning", "Topic cluster block is not visible", `The ${cluster.label} page has no visible cluster navigation.`, "Render the shared related-cluster section on this public page."));
        if (missingClusterLinks.length) issues.push(issue(pageUrl, "topicClusters", "warning", "Topic cluster links are incomplete", `Missing ${missingClusterLinks.length} declared cluster link(s).`, "Add crawlable descriptive links between the pillar, supporting, product and resource pages."));
      } else if (absoluteInternalLinks.length < 3) issues.push(issue(pageUrl, "topicClusters", "suggestion", "Limited topic-cluster connections", `Only ${absoluteInternalLinks.length} internal links were detected.`, "Add editorially relevant links to the pillar, supporting guidance and conversion route."));
      if (!/written by|technical review|reviewed by|content review/i.test(text)) issues.push(issue(pageUrl, "eeat", "suggestion", "Authorship or review signal not visible", "No visible organizational authorship or technical-review signal was detected.", "Add a truthful author/review owner and review policy link without inventing credentials."));
      const helpfulContentEligible = /^\/(?:products|articles|resources|standards|safety|temporary|loading|vertical|work-at-height|what-is|edge-protection|engineering|high-risk|steel-fabrication)/.test(pathname);
      if (helpfulContentEligible && !/short answer|frequently asked|checklist|what project teams|what you need|required sections|before installation|scope review|applications/i.test(text)) issues.push(issue(pageUrl, "helpfulContent", "suggestion", "Helpful-content structure can improve", "No concise answer, checklist, practical application or FAQ marker was detected.", "Review whether a concise answer and task-focused checks would improve the page."));
      if (!absoluteInternalLinks.some((href) => /\/quote|\/contact/.test(href))) issues.push(issue(pageUrl, "conversion", "suggestion", "No clear enquiry path detected", "The page has no internal link to quote or contact.", "Add a relevant project enquiry path without weakening technical content."));
      if (
        !/FAQPage|Product|Article|LocalBusiness|Organization/.test(
          schemaNodes.map((node) => node.textContent).join(" "),
        )
      )
        issues.push(
          issue(
            pageUrl,
            "aiReadiness",
            "suggestion",
            "Entity context can improve",
            "No page-specific entity type was detected.",
            "Review whether page-specific schema and concise answer content are appropriate.",
          ),
        );
    } catch (error) {
      issues.push(
        issue(
          pageUrl,
          "technical",
          "urgent",
          "Page could not be checked",
          error instanceof Error ? error.message : "Network error",
          "Verify the deployment and retry the audit.",
        ),
      );
    }
  }

  inboundCounts.forEach((count, path) => {
    if (count === 0 && path !== "/") issues.push(issue(new URL(path, origin).toString(), "internal", "urgent", "Orphan sitemap page", "No crawlable internal link from another sitemap page was detected.", "Add a descriptive contextual, navigation or cluster link to this page."));
  });

  const categories = Object.keys(weights) as SeoCategory[];
  const categoryScores = Object.fromEntries(
    categories.map((category) => [
      category,
      category === "performance"
        ? null
        : scoreFor(category, urls.length, issues),
    ]),
  ) as Record<SeoCategory, number | null>;
  const measured = categories.filter(
    (category) => categoryScores[category] !== null,
  );
  const measuredWeight = measured.reduce(
    (total, category) => total + weights[category],
    0,
  );
  const totalWeight = categories.reduce((total, category) => total + weights[category], 0);
  const overallScore = Math.round(
    categories.reduce(
      (total, category) => total + (categoryScores[category] || 0) * weights[category],
      0,
    ) / totalWeight,
  );
  const categoryEvidence = Object.fromEntries(categories.map((category) => {
    const categoryIssues = issues.filter((item) => item.category === category);
    return [category, {
      measured: categoryScores[category] !== null,
      source: category === "performance" ? "PageSpeed, Lighthouse or CrUX integration required" : "Public sitemap HTML audit",
      findings: categoryIssues.length,
      pagesAffected: new Set(categoryIssues.map((item) => item.pageUrl)).size,
      requirementsMissing: categoryIssues.length + (categoryScores[category] === null ? 1 : 0),
    }];
  })) as SeoAuditReport["categoryEvidence"];
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    sourceUrl: origin,
    overallScore,
    categoryScores,
    pagesChecked: urls.length,
    issues,
    measurementCoverage: Math.round(measuredWeight / totalWeight * 100),
    unmeasuredCategories: categories.filter((category) => categoryScores[category] === null),
    categoryEvidence,
    integrations: {
      searchConsole: envEnabled(import.meta.env.VITE_GSC_CONNECTED),
      pageSpeed: envEnabled(import.meta.env.VITE_PAGESPEED_CONNECTED),
      openAi: envEnabled(import.meta.env.VITE_AI_SUGGESTIONS_CONNECTED),
      competitor: envEnabled(import.meta.env.VITE_COMPETITOR_AUDIT_CONNECTED),
    },
  };
}

export async function runSeoAudit(
  onProgress?: (message: string, completed: number, total: number) => void,
): Promise<SeoAuditReport> {
  try {
    return await runServerSeoAudit(onProgress);
  } catch (serverError) {
    const configuredOrigin = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, "");
    if (!configuredOrigin || new URL(configuredOrigin).origin !== window.location.origin) throw serverError;
    return runBrowserSeoAudit(onProgress);
  }
}

export const seoScoreWeights = weights;
