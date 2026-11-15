import { useEffect, useMemo, useState } from "react";
import { Activity, Cloud, Download, Gauge, RefreshCw, SearchCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl, isProductionSiteUrlValid } from "@/lib/canonical";
import {
  getSeoIntegrationHistory,
  getSeoIntegrationStatus,
  inspectSearchConsoleUrls,
  listSearchConsoleSitemaps,
  runLiveCrawl,
  runCrux,
  runPageSpeed,
  submitSearchConsoleSitemap,
  syncSearchConsole,
  type CruxResult,
  type InspectionResult,
  type IntegrationRun,
  type IntegrationStatus,
  type LiveCrawlResult,
  type PageSpeedResult,
  type SearchAnalyticsResult,
  type SitemapResult,
} from "@/lib/seoIntegrations";

function downloadJson(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function pct(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "Not available";
}

export function SeoOperations() {
  const [status, setStatus] = useState<IntegrationStatus>({
    searchConsole: false,
    pageSpeed: false,
    crux: false,
    siteUrl: getPublicSiteUrl(),
    inspectionQuota: { used: 0, safetyBudget: 200 },
  });
  const [crawl, setCrawl] = useState<LiveCrawlResult | null>(null);
  const [analytics, setAnalytics] = useState<SearchAnalyticsResult | null>(null);
  const [inspections, setInspections] = useState<InspectionResult | null>(null);
  const [sitemaps, setSitemaps] = useState<SitemapResult | null>(null);
  const [pageSpeedMobile, setPageSpeedMobile] = useState<PageSpeedResult | null>(null);
  const [pageSpeedDesktop, setPageSpeedDesktop] = useState<PageSpeedResult | null>(null);
  const [crux, setCrux] = useState<CruxResult | null>(null);
  const [history, setHistory] = useState<IntegrationRun[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshStatus = async () => {
    const [nextStatus, nextHistory] = await Promise.all([getSeoIntegrationStatus(), getSeoIntegrationHistory().catch(() => [])]);
    setStatus(nextStatus);
    setHistory(nextHistory);
  };
  useEffect(() => { void refreshStatus().catch(() => setStatus({ searchConsole: false, pageSpeed: false, crux: false, siteUrl: getPublicSiteUrl(), inspectionQuota: { used: 0, safetyBudget: 200 } })); }, []);

  const execute = async <T,>(name: string, operation: () => Promise<T>, success: string, commit: (value: T) => void) => {
    setBusy(name); setError(""); setMessage("");
    try { const result = await operation(); commit(result); setMessage(success); await refreshStatus(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Operation failed."); }
    finally { setBusy(""); }
  };
  const urls = crawl?.pages.map((page) => page.finalUrl).slice(0, 20) || [getPublicSiteUrl()];
  const lowCtr = useMemo(() => (analytics?.rows || []).filter((row) => (row.impressions || 0) >= 50 && (row.ctr || 0) < 0.03).slice(0, 20), [analytics]);
  const crawlerScore = useMemo(() => {
    if (!crawl) return null;
    const penalty = crawl.brokenLinks.length * 20 + crawl.orphanPages.length * 12 + crawl.sitemapOnlyPages.length * 8 + crawl.redirectedLinks.length * 4 + crawl.duplicateCanonicals.length * 8 + crawl.weaklyLinkedPages.length * 2 + crawl.deepPages.length * 2 + crawl.genericAnchorPages.length * 3 + crawl.pages.filter((page) => page.issues.length > 0).length;
    return Math.max(0, Math.min(100, 100 - penalty));
  }, [crawl]);
  const googleScore = useMemo(() => {
    if (!inspections?.results.length) return null;
    const scores = inspections.results.map((result) => {
      const index = (result.data.inspectionResult as Record<string, unknown> | undefined)?.indexStatusResult as Record<string, unknown> | undefined;
      if (!index) return 0;
      const checks = [
        /indexed/i.test(String(index.coverageState || "")),
        /allowed/i.test(String(index.robotsTxtState || "")),
        /successful/i.test(String(index.pageFetchState || "")),
        Boolean(index.userCanonical) && index.userCanonical === index.googleCanonical,
        Array.isArray(index.sitemap) && index.sitemap.length > 0,
      ];
      return Math.round(checks.filter(Boolean).length / checks.length * 100);
    });
    return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
  }, [inspections]);

  return <section className="rounded-md border bg-white" aria-labelledby="operations-heading">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
      <div><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-[#ed1c24]"/><h3 id="operations-heading" className="font-semibold">Production Crawl & Google Data</h3></div><p className="mt-1 text-sm text-slate-500">Crawler evidence, Search Console evidence and PageSpeed evidence remain separate and traceable.</p></div>
      {crawl && <Button variant="outline" size="sm" onClick={() => downloadJson("ambs-live-crawl-report.json", crawl)}><Download className="mr-2 h-4 w-4"/>Export crawl</Button>}
    </header>
    {(!isProductionSiteUrlValid() || error || message) && <div className={`m-5 rounded border p-3 text-sm ${error || !isProductionSiteUrlValid() ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{!isProductionSiteUrlValid() ? "Production configuration error: VITE_PUBLIC_SITE_URL must be a non-local HTTPS URL." : error || message}</div>}
    <div className="flex flex-wrap gap-2 px-5 pt-5">
      <Button onClick={() => execute("crawl", () => runLiveCrawl(250, true), "Bounded crawl completed and recorded.", setCrawl)} disabled={Boolean(busy)}>{busy === "crawl" && <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>}Run Live Crawl</Button>
      <Button variant="outline" onClick={() => execute("gsc", () => syncSearchConsole(true), "Search Console performance data synced and cached.", setAnalytics)} disabled={Boolean(busy) || !status?.searchConsole}><Cloud className="mr-2 h-4 w-4"/>Sync GSC</Button>
      <Button variant="outline" onClick={() => execute("inspect", () => inspectSearchConsoleUrls(urls), "URL Inspection completed for approved production URLs.", setInspections)} disabled={Boolean(busy) || !status?.searchConsole}><SearchCheck className="mr-2 h-4 w-4"/>Inspect URLs</Button>
      <Button variant="outline" onClick={() => execute("sitemaps", listSearchConsoleSitemaps, "Sitemap status retrieved from Search Console.", setSitemaps)} disabled={Boolean(busy) || !status?.searchConsole}>List Sitemaps</Button>
      <Button variant="outline" onClick={() => { if (window.confirm("Submit the approved production sitemap to Google Search Console? Submission is only a hint and does not guarantee indexing.")) void execute("submit", submitSearchConsoleSitemap, "Sitemap submitted as a crawl hint; indexing is not guaranteed.", () => undefined); }} disabled={Boolean(busy) || !status?.searchConsole}><Send className="mr-2 h-4 w-4"/>Submit Sitemap</Button>
      <Button variant="outline" onClick={() => execute("pagespeed-mobile", () => runPageSpeed(getPublicSiteUrl(), "mobile"), "Real mobile PageSpeed data retrieved.", setPageSpeedMobile)} disabled={Boolean(busy) || !status?.pageSpeed}><Gauge className="mr-2 h-4 w-4"/>Mobile PageSpeed</Button>
      <Button variant="outline" onClick={() => execute("pagespeed-desktop", () => runPageSpeed(getPublicSiteUrl(), "desktop"), "Real desktop PageSpeed data retrieved.", setPageSpeedDesktop)} disabled={Boolean(busy) || !status?.pageSpeed}><Gauge className="mr-2 h-4 w-4"/>Desktop PageSpeed</Button>
      <Button variant="outline" onClick={() => execute("crux", () => runCrux(getPublicSiteUrl(), "mobile"), "Real CrUX field data retrieved.", setCrux)} disabled={Boolean(busy) || !status?.crux}><Activity className="mr-2 h-4 w-4"/>Mobile CrUX</Button>
    </div>

    <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-6">
      {[['Crawler verification', crawlerScore === null ? 'Not run' : `${crawlerScore}%`], ['Google confirmation', googleScore === null ? 'Not confirmed' : `${googleScore}%`], ['Search Console', status?.searchConsole ? 'Server verified' : 'Not configured'], ['PageSpeed', status?.pageSpeed ? 'Server verified' : 'Not configured'], ['CrUX', status?.crux ? 'Server verified' : 'Not configured'], ['Broken links', crawl ? String(crawl.brokenLinks.length) : 'Not crawled'], ['URL Inspection quota', status?.inspectionQuota ? `${status.inspectionQuota.used}/${status.inspectionQuota.safetyBudget}` : 'Not available']].map(([label, value]) => <div key={label} className="border-l-2 border-slate-200 pl-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}
    </div>

    <p className="px-5 pb-5 text-xs text-slate-500">{crawlerScore === 100 ? "Crawler verified: 100%." : crawlerScore === null ? "Crawler verification is pending." : `Crawler findings prevent a 100% claim (${crawlerScore}%).`} {googleScore === 100 && crawlerScore === 100 ? "Google-confirmed checks also passed for every inspected key URL." : "Google-confirmed 100% is not claimed unless URL Inspection passes every key check."}</p>

    {crawl && <div className="border-t p-5"><div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[['Orphan pages', crawl.orphanPages.length], ['Sitemap-only', crawl.sitemapOnlyPages.length], ['Weakly linked', crawl.weaklyLinkedPages.length], ['Deep pages', crawl.deepPages.length], ['Generic anchors', crawl.genericAnchorPages.length], ['Redirect links', crawl.redirectedLinks.length], ['Broken images', crawl.brokenImages.length], ['Duplicate canonicals', crawl.duplicateCanonicals.length]].map(([label, value]) => <div key={String(label)}><p className="text-xs text-slate-500">{label}</p><strong>{value}</strong></div>)}</div><div className="overflow-auto"><table className="w-full min-w-[960px] text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-3">URL</th><th className="p-3">HTTP</th><th className="p-3">Canonical</th><th className="p-3">H1</th><th className="p-3">Schema</th><th className="p-3">Inbound</th><th className="p-3">Depth</th><th className="p-3">Status</th><th className="p-3">Response</th></tr></thead><tbody>{crawl.pages.map((page) => <tr key={page.requestedUrl} className="border-b align-top"><td className="max-w-72 break-all p-3">{new URL(page.requestedUrl).pathname}</td><td className="p-3">{page.status}{page.redirected ? " → final" : ""}</td><td className="p-3">{page.canonicalCount}</td><td className="p-3">{page.h1.length}</td><td className="p-3">{page.schemaTypes.join(", ") || "None"}</td><td className="p-3">{page.inboundLinks}</td><td className="p-3">{page.clickDepth ?? "Unreached"}</td><td className="p-3">{page.orphanStatus.replaceAll("_", " ")}{page.issues.length ? ` / ${page.issues.length} issues` : ""}</td><td className="p-3">{page.responseMs}ms</td></tr>)}</tbody></table></div></div>}

    {(analytics || inspections || sitemaps || pageSpeedMobile || pageSpeedDesktop || crux) && <div className="grid gap-6 border-t p-5 xl:grid-cols-2">
      {analytics && <div><h4 className="font-semibold">Search Analytics opportunities</h4><p className="mt-1 text-xs text-slate-500">Real rows with at least 50 impressions and CTR below 3%. Recommendations remain draft-only.</p><div className="mt-3 max-h-64 overflow-auto divide-y">{lowCtr.map((row, index) => <div key={`${row.keys?.join('-')}-${index}`} className="py-2 text-sm"><p className="break-all font-medium">{row.keys?.[0] || 'Page'} / {row.keys?.[1] || 'Query'}</p><p className="text-xs text-slate-500">{row.clicks || 0} clicks · {row.impressions || 0} impressions · {pct(row.ctr)} CTR · position {row.position?.toFixed(1) || 'n/a'}</p></div>)}{!lowCtr.length && <p className="py-3 text-sm text-slate-500">No low-CTR opportunities met the threshold.</p>}</div></div>}
      {inspections && <div><h4 className="font-semibold">URL Inspection</h4><p className="mt-1 text-xs text-slate-500">{inspections.results.length} approved URLs inspected. Safety budget: {inspections.quotaUsed}/{inspections.safetyBudget}.</p><div className="mt-3 max-h-64 overflow-auto divide-y">{inspections.results.map((result) => { const index = (result.data.inspectionResult as Record<string, unknown> | undefined)?.indexStatusResult as Record<string, unknown> | undefined; return <div key={result.url} className="py-2 text-sm"><p className="break-all font-medium">{result.url}</p><p className="text-xs text-slate-500">Coverage: {String(index?.coverageState || 'Unknown')} · Fetch: {String(index?.pageFetchState || 'Unknown')} · Cached: {result.cached ? 'Yes' : 'No'}</p></div>; })}</div></div>}
      {sitemaps && <div><h4 className="font-semibold">Submitted sitemaps</h4><div className="mt-3 divide-y">{(sitemaps.sitemap || []).map((item) => <div key={item.path} className="py-2 text-sm"><p className="break-all font-medium">{item.path}</p><p className="text-xs text-slate-500">Errors {item.errors || 0} · Warnings {item.warnings || 0} · Last downloaded {item.lastDownloaded || 'Unknown'}</p></div>)}</div></div>}
      {[pageSpeedMobile, pageSpeedDesktop].filter(Boolean).map((result) => <div key={result?.strategy}><h4 className="font-semibold">{result?.strategy === "desktop" ? "Desktop" : "Mobile"} PageSpeed</h4><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-500">Performance</p><strong>{pct(result?.lighthouseResult?.categories?.performance?.score)}</strong></div><div><p className="text-xs text-slate-500">Accessibility</p><strong>{pct(result?.lighthouseResult?.categories?.accessibility?.score)}</strong></div><div><p className="text-xs text-slate-500">Best practices</p><strong>{pct(result?.lighthouseResult?.categories?.["best-practices"]?.score)}</strong></div><div><p className="text-xs text-slate-500">SEO</p><strong>{pct(result?.lighthouseResult?.categories?.seo?.score)}</strong></div><div><p className="text-xs text-slate-500">LCP</p><strong>{result?.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue || 'n/a'}</strong></div><div><p className="text-xs text-slate-500">INP/TBT</p><strong>{result?.lighthouseResult?.audits?.['interaction-to-next-paint']?.displayValue || result?.lighthouseResult?.audits?.['total-blocking-time']?.displayValue || 'n/a'}</strong></div><div><p className="text-xs text-slate-500">CLS</p><strong>{result?.lighthouseResult?.audits?.['cumulative-layout-shift']?.displayValue || 'n/a'}</strong></div><div><p className="text-xs text-slate-500">Captured</p><strong>{result?.checkedAt ? new Date(result.checkedAt).toLocaleString() : 'n/a'}</strong></div></div></div>)}
      {crux && <div><h4 className="font-semibold">CrUX field data</h4><p className="mt-1 text-xs text-slate-500">75th-percentile metrics for {crux.device || "mobile"}; availability depends on Chrome UX Report traffic thresholds.</p><div className="mt-3 grid grid-cols-2 gap-3 text-sm">{Object.entries(crux.record?.metrics || {}).map(([metric, value]) => <div key={metric}><p className="break-words text-xs text-slate-500">{metric.replaceAll("_", " ")}</p><strong>{String(value.percentiles?.p75 ?? "n/a")}</strong></div>)}</div></div>}
    </div>}

    {history.length > 0 && <div className="border-t p-5"><h4 className="font-semibold">Integration history</h4><div className="mt-3 overflow-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b"><th className="py-2">Action</th><th>Status</th><th>Started</th><th>Error</th></tr></thead><tbody>{history.map((run) => <tr key={run.id} className="border-b"><td className="py-2">{run.action.replaceAll("_", " ")}</td><td>{run.status}</td><td>{new Date(run.started_at).toLocaleString()}</td><td className="text-red-700">{run.error_message || "—"}</td></tr>)}</tbody></table></div></div>}
  </section>;
}
