import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

const client = supabase as unknown as SupabaseClient;

export type SeoCategory =
  | "technical"
  | "onPage"
  | "content"
  | "image"
  | "structured"
  | "internal"
  | "performance"
  | "aiReadiness";
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
  technical: 20,
  onPage: 20,
  content: 15,
  image: 10,
  structured: 10,
  internal: 10,
  performance: 10,
  aiReadiness: 5,
};

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
  const penalty = issues
    .filter((item) => item.category === category)
    .reduce(
      (total, item) =>
        total +
        (item.severity === "urgent" ? 18 : item.severity === "warning" ? 9 : 3),
      0,
    );
  return Math.max(0, Math.round(100 - penalty / pages));
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
  localStorage.setItem(historyKey, JSON.stringify(history));
  try {
    await client.from("seo_audits").insert({
      id: report.id,
      source_url: report.sourceUrl,
      overall_score: report.overallScore,
      category_scores: report.categoryScores,
      pages_checked: report.pagesChecked,
      issues: report.issues,
      integrations: report.integrations,
      created_at: report.createdAt,
    });
  } catch {
    /* Local history remains available until the migration is applied. */
  }
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
  localStorage.setItem(
    taskKey,
    JSON.stringify([task, ...tasks.filter((item) => item.id !== task.id)].slice(0, 500)),
  );
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
  if (result.error && !import.meta.env.DEV) {
    throw new Error(`SEO task could not be saved to Supabase: ${result.error.message}`);
  }
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

export async function runSeoAudit(
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
      const internalLinks = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'),
      );
      const schemaNodes = Array.from(
        document.querySelectorAll<HTMLScriptElement>(
          'script[type="application/ld+json"]',
        ),
      );

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
      if (!schemaNodes.length)
        issues.push(
          issue(
            pageUrl,
            "structured",
            "warning",
            "Structured data not detected",
            "No JSON-LD block was found in prerendered HTML.",
            "Add only schema that matches visible page content.",
          ),
        );
      for (const node of schemaNodes)
        try {
          JSON.parse(node.textContent || "");
        } catch {
          issues.push(
            issue(
              pageUrl,
              "structured",
              "urgent",
              "Invalid JSON-LD",
              "A structured-data block is not valid JSON.",
              "Repair and validate the block before publishing.",
            ),
          );
        }
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
  const overallScore = Math.round(
    measured.reduce(
      (total, category) =>
        total + (categoryScores[category] || 0) * weights[category],
      0,
    ) / measuredWeight,
  );
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    sourceUrl: origin,
    overallScore,
    categoryScores,
    pagesChecked: urls.length,
    issues,
    integrations: {
      searchConsole: Boolean(import.meta.env.VITE_GSC_CONNECTED),
      pageSpeed: Boolean(import.meta.env.VITE_PAGESPEED_CONNECTED),
      openAi: Boolean(import.meta.env.VITE_AI_SUGGESTIONS_CONNECTED),
      competitor: Boolean(import.meta.env.VITE_COMPETITOR_AUDIT_CONNECTED),
    },
  };
}

export const seoScoreWeights = weights;
