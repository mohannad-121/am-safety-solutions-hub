import { supabase } from "@/integrations/supabase/client";
import { getPublicSiteUrl } from "@/lib/canonical";

// The Edge Function enforces authentication and CMS-role authorization itself.
// Keep an explicit opt-out for isolated builds, but do not silently disable the
// production tools when a Vercel build-time flag is absent.
export const seoIntegrationsEnabled = import.meta.env.VITE_SEO_INTEGRATIONS_ENABLED !== "false";

export type IntegrationStatus = {
  searchConsole: boolean;
  pageSpeed: boolean;
  crux: boolean;
  siteUrl: string | null;
  gscProperty?: string | null;
  inspectionQuota?: { used: number; safetyBudget: number };
};
export type CrawlPage = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  redirected: boolean;
  responseMs: number;
  title: string;
  description: string;
  canonical: string;
  canonicalRaw: string;
  canonicalCount: number;
  ogUrl: string;
  robots: string;
  indexable: boolean;
  h1: string[];
  h2: string[];
  schemaTypes: string[];
  schemaUrls: string[];
  invalidJsonLd: number;
  textLength: number;
  topicClusterIds: string[];
  reviewSignal: boolean;
  helpfulContentSignal: boolean;
  internalLinks: number;
  genericAnchorCount: number;
  inboundLinks: number;
  clickDepth: number | null;
  orphanStatus: "linked" | "orphan" | "sitemap_only";
  imagesMissingAlt: string[];
  internalLinkList: Array<{ url: string; anchorText: string }>;
  issues: string[];
};
export type LinkFinding = { url: string; status: number; finalUrl: string; sources?: Array<{ sourcePage: string; anchorText: string }> };
export type LiveCrawlResult = {
  checkedAt: string;
  siteUrl: string;
  cached?: boolean;
  sitemapCount: number;
  sitemapUrls: string[];
  discoveredCount: number;
  orphanPages: string[];
  sitemapOnlyPages: string[];
  weaklyLinkedPages: string[];
  deepPages: string[];
  genericAnchorPages: string[];
  crawledMissingFromSitemap: string[];
  brokenLinks: LinkFinding[];
  redirectedLinks: LinkFinding[];
  brokenImages: LinkFinding[];
  duplicateTitles: Array<{ value: string; urls: string[] }>;
  duplicateDescriptions: Array<{ value: string; urls: string[] }>;
  duplicateCanonicals: Array<{ value: string; urls: string[] }>;
  pages: CrawlPage[];
};
export type SearchAnalyticsRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };
export type SearchAnalyticsResult = { rows?: SearchAnalyticsRow[]; responseAggregationType?: string; cached?: boolean };
export type InspectionResult = { results: Array<{ url: string; data: Record<string, unknown>; cached: boolean }>; quotaUsed: number; safetyBudget: number };
export type SitemapResult = { sitemap?: Array<{ path?: string; lastSubmitted?: string; lastDownloaded?: string; isPending?: boolean; warnings?: number; errors?: number }> };
export type PageSpeedResult = { strategy?: "mobile" | "desktop"; checkedAt?: string; lighthouseResult?: { categories?: { performance?: { score?: number }; accessibility?: { score?: number }; "best-practices"?: { score?: number }; seo?: { score?: number } }; audits?: Record<string, { numericValue?: number; displayValue?: string }> }; loadingExperience?: Record<string, unknown> };
export type CruxResult = { record?: { key?: Record<string, string>; metrics?: Record<string, { histogram?: Array<{ start?: number; end?: number; density?: number }>; percentiles?: { p75?: number | string } }> }; device?: "mobile" | "desktop"; checkedAt?: string };
export type IntegrationRun = { id: string; action: string; status: string; site_url: string; error_message?: string | null; started_at: string; completed_at?: string | null };

async function invoke<T>(action: string, payload: Record<string, unknown> = {}) {
  if (!seoIntegrationsEnabled) throw new Error("SEO integrations are disabled for this environment.");
  const { data, error } = await supabase.functions.invoke("seo-integrations", { body: { action, ...payload } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const getSeoIntegrationStatus = () => seoIntegrationsEnabled ? invoke<IntegrationStatus>("status") : Promise.resolve({ searchConsole: false, pageSpeed: false, crux: false, siteUrl: getPublicSiteUrl(), inspectionQuota: { used: 0, safetyBudget: 200 } });
export const runLiveCrawl = (maxPages = 100, force = false) => invoke<LiveCrawlResult>("live_crawl", { maxPages, force });
export const syncSearchConsole = (force = false) => { const endDate = new Date(); const startDate = new Date(endDate); startDate.setDate(startDate.getDate() - 28); return invoke<SearchAnalyticsResult>("search_analytics", { startDate: startDate.toISOString().slice(0, 10), endDate: endDate.toISOString().slice(0, 10), force }); };
export const inspectSearchConsoleUrls = (urls: string[], force = false) => invoke<InspectionResult>("inspect", { urls, force });
export const listSearchConsoleSitemaps = () => invoke<SitemapResult>("sitemaps");
export const submitSearchConsoleSitemap = () => invoke<{ submitted: boolean; sitemapUrl: string; note: string }>("submit_sitemap");
export const runPageSpeed = (url = getPublicSiteUrl(), device: "mobile" | "desktop" = "mobile") => invoke<PageSpeedResult>("pagespeed", { urls: [url], device });
export const runCrux = (url = getPublicSiteUrl(), device: "mobile" | "desktop" = "mobile") => invoke<CruxResult>("crux", { urls: [url], device });
export async function getSeoIntegrationHistory() {
  if (!seoIntegrationsEnabled) return [];
  const result = await supabase.from("seo_integration_runs").select("id,action,status,site_url,error_message,started_at,completed_at").order("started_at", { ascending: false }).limit(20);
  if (result.error) throw new Error(result.error.message);
  return (result.data || []) as IntegrationRun[];
}
