import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Download,
  ExternalLink,
  Gauge,
  Play,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { canEditSeo, exportToCsv, type CmsAdminUser } from "@/lib/cms";
import {
  createSeoTask,
  persistSeoAudit,
  readSeoAuditHistory,
  runSeoAudit,
  seoScoreWeights,
  type SeoAuditReport,
  type SeoIssue,
} from "@/lib/seoAudit";
import { AiSuggestionsPanel } from "@/components/admin/AiSuggestionsPanel";
import { CanonicalHealth } from "@/components/admin/CanonicalHealth";
import { SeoOperations } from "@/components/admin/SeoOperations";
import { CompetitorComparison } from "@/components/admin/CompetitorComparison";
import { getSeoIntegrationStatus, type IntegrationStatus } from "@/lib/seoIntegrations";

const labels = {
  technical: "Technical SEO",
  onPage: "On-page SEO",
  content: "Content depth",
  image: "Image SEO",
  structured: "Structured data",
  internal: "Internal linking",
  performance: "Performance/mobile",
  aiReadiness: "AI-search readiness",
  canonical: "Canonical health",
  eeat: "E-E-A-T signals",
  helpfulContent: "Helpful content",
  topicClusters: "Topic clusters",
  conversion: "Conversion readiness",
};

function ScoreRing({ value, complete }: { value: number; complete: boolean }) {
  const color = value >= 85 ? "#15803d" : value >= 65 ? "#d97706" : "#b91c1c";
  return (
    <div
      className="relative grid h-36 w-36 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${value * 3.6}deg, #e5e7eb 0)`,
      }}
    >
      <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
        <div>
          <strong className="text-3xl">{value}%</strong>
          <span className="block text-xs text-slate-500">{complete ? "Evidence score" : "Provisional score"}</span>
        </div>
      </div>
    </div>
  );
}

function Integration({
  label,
  connected,
  note,
}: {
  label: string;
  connected: boolean;
  note: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-t py-3 first:border-t-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs leading-5 text-slate-500">{note}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
      >
        {connected ? "Connected" : "Setup required"}
      </span>
    </div>
  );
}

export function SeoCenter({ user }: { user: CmsAdminUser }) {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  useEffect(() => {
    void getSeoIntegrationStatus().then(setIntegrationStatus).catch(() => setIntegrationStatus(null));
  }, []);
  const [history, setHistory] = useState<SeoAuditReport[]>(readSeoAuditHistory);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({
    message: "Ready",
    completed: 0,
    total: 0,
  });
  const [error, setError] = useState("");
  const [taskNotice, setTaskNotice] = useState("");
  const [severity, setSeverity] = useState<"all" | SeoIssue["severity"]>("all");
  const current = history[0];
  const visibleIssues = useMemo(
    () =>
      (current?.issues || []).filter(
        (item) => severity === "all" || item.severity === severity,
      ),
    [current, severity],
  );

  const run = async () => {
    setRunning(true);
    setError("");
    try {
      const report = await runSeoAudit((message, completed, total) =>
        setProgress({ message, completed, total }),
      );
      setHistory(await persistSeoAudit(report));
      setProgress({
        message: "Evaluation complete",
        completed: report.pagesChecked,
        total: report.pagesChecked,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The SEO evaluation could not be completed.",
      );
    } finally {
      setRunning(false);
    }
  };

  const exportIssues = () =>
    current &&
    exportToCsv(
      "ambs-seo-issues.csv",
      current.issues as unknown as Record<string, unknown>[],
    );

  const addTask = async (finding: SeoIssue) => {
    if (!current) return;
    setTaskNotice("");
    setError("");
    try {
      await createSeoTask(finding, current.id, user.id);
      setTaskNotice(`Draft task created for: ${finding.title}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The SEO task could not be created.",
      );
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border bg-white p-5">
        <div>
          <p className="text-xs font-semibold uppercase text-[#ed1c24]">
            SEO Command Center
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Daily review and approval queue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real public-page checks. No recommendation changes live content
            automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportIssues} disabled={!current}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={run}
            disabled={running}
            className="bg-[#ed1c24] text-white hover:bg-[#c9151d]"
          >
            {running ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run SEO Evaluation
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {taskNotice && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {taskNotice}
        </div>
      )}
      {!running && current && progress.message === "Evaluation complete" && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Evaluation complete. The report is saved for review; no public SEO
          fields were changed.
        </div>
      )}
      {running && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex justify-between text-sm">
            <span>{progress.message}</span>
            <span>
              {progress.completed}/{progress.total || "-"}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded bg-blue-100">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${progress.total ? (progress.completed / progress.total) * 100 : 8}%`,
              }}
            />
          </div>
        </div>
      )}

      {!current ? (
        <div className="rounded-md border border-dashed bg-white p-10 text-center">
          <SearchCheck className="mx-auto h-9 w-9 text-slate-400" />
          <h3 className="mt-3 font-semibold">No audit has run yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Run the first evaluation to crawl the deployed sitemap and create a
            measured baseline.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
            <div className="flex items-center gap-6 rounded-md border bg-white p-5 xl:flex-col xl:justify-center">
              <ScoreRing value={current.overallScore} complete={(current.measurementCoverage ?? 0) === 100 && current.issues.length === 0} />
              <div className="text-sm">
                <p>
                  <strong>{current.pagesChecked}</strong> pages checked
                </p>
                <p className="mt-1">
                  <strong>{current.issues.length}</strong> items need review
                </p>
                <p className="mt-1">
                  <strong>{current.measurementCoverage ?? "Legacy"}{typeof current.measurementCoverage === "number" ? "%" : ""}</strong> evidence coverage
                </p>
                {!!current.unmeasuredCategories?.length && <p className="mt-1 text-xs text-amber-700">Unmeasured: {current.unmeasuredCategories.map((category) => labels[category]).join(", ")}</p>}
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(current.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Object.entries(current.categoryScores).map(
                ([category, score]) => (
                  <article
                    key={category}
                    className="rounded-md border bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <Gauge className="h-5 w-5 text-[#ed1c24]" />
                      <span className="text-xs text-slate-400">
                        {
                          seoScoreWeights[
                            category as keyof typeof seoScoreWeights
                          ]
                        }
                        % weight
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                      {labels[category as keyof typeof labels]}
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      {score === null ? "Not measured" : `${score}%`}
                    </p>
                    {current.categoryEvidence?.[category as keyof typeof current.categoryEvidence] && <p className="mt-2 text-xs leading-5 text-slate-500">
                      {current.categoryEvidence[category as keyof typeof current.categoryEvidence].source}<br />
                      {current.categoryEvidence[category as keyof typeof current.categoryEvidence].findings} findings on {current.categoryEvidence[category as keyof typeof current.categoryEvidence].pagesAffected} pages
                    </p>}
                  </article>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="rounded-md border bg-white">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <div>
                  <h3 className="font-semibold">Priority queue</h3>
                  <p className="text-sm text-slate-500">
                    Review findings before creating any draft.
                  </p>
                </div>
                <select
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value as typeof severity)
                  }
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="all">All priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="warning">Warning</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </header>
              <div className="divide-y">
                {visibleIssues.slice(0, 100).map((item) => (
                  <article key={item.id} className="p-5">
                    <div className="flex items-start gap-3">
                      {item.severity === "urgent" ? (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      ) : item.severity === "warning" ? (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium">{item.title}</h4>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                            {labels[item.category]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.pageUrl}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.detail}
                        </p>
                        <p className="mt-2 text-sm">
                          <strong>Recommended:</strong> {item.suggestedAction}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={item.pageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open page{" "}
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => addTask(item)}
                            disabled={!canEditSeo(user.role)}
                            title="Creates a review task only; it never publishes"
                          >
                            Create draft task
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {!visibleIssues.length && (
                  <p className="p-8 text-center text-sm text-slate-500">
                    No findings match this filter.
                  </p>
                )}
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-md border bg-white p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <h3 className="font-semibold">SEO safety</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Audits and suggestions are read-only. Applying metadata,
                  canonical, schema, headings or content requires an
                  authenticated reviewer and a separate publish confirmation.
                </p>
              </section>
              <section className="rounded-md border bg-white p-5">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#ed1c24]" />
                  <h3 className="font-semibold">Data integrations</h3>
                </div>
                <div className="mt-3">
                  <Integration
                    label="Google Search Console"
                    connected={integrationStatus?.searchConsole ?? false}
                    note="Clicks, impressions, CTR and average position."
                  />
                  <Integration
                    label="PageSpeed Insights"
                    connected={integrationStatus?.pageSpeed ?? false}
                    note="Core Web Vitals and mobile performance."
                  />
                  <Integration
                    label="OpenAI suggestions"
                    connected={integrationStatus?.openAi ?? false}
                    note="Backend-only structured draft suggestions."
                  />
                  <Integration
                    label="TSS public benchmark"
                    connected={integrationStatus?.competitor ?? false}
                    note="Rate-limited public data, never private analytics."
                  />
                </div>
              </section>
              <section className="rounded-md border bg-white p-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#ed1c24]" />
                  <h3 className="font-semibold">Audit history</h3>
                </div>
                <div className="mt-3 divide-y">
                  {history.slice(0, 7).map((report) => (
                    <div
                      key={report.id}
                      className="flex justify-between py-3 text-sm"
                    >
                      <span>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      <strong>{report.overallScore}%</strong>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
      <CanonicalHealth />
      <SeoOperations />
      <CompetitorComparison />
      <AiSuggestionsPanel issues={current?.issues || []} user={user} />
    </section>
  );
}
