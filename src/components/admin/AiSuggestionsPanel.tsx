import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, Download, ExternalLink, FileEdit, RefreshCw, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CmsAdminUser } from "@/lib/cms";
import type { SeoIssue } from "@/lib/seoAudit";
import {
  approveSuggestionDraft,
  applySuggestionDraft,
  canGenerateSuggestionDraft,
  ignoreSuggestion,
  logSuggestionUtilityAction,
  markSuggestionDone,
  recheckSuggestion,
  reopenSuggestion,
  reviewSuggestionDraft,
  reviewSuggestion,
  rollbackSuggestionDraft,
  suggestionEditorUrl,
  syncSuggestions,
  type SeoSuggestion,
} from "@/lib/seoSuggestions";

function downloadSuggestion(item: SeoSuggestion) {
  const safe = { issue: item.title, affectedPage: item.pageUrl, category: item.category, proposedFix: item.suggestedAction, risk: item.risk, confidence: item.confidence, status: item.status, date: item.lastChecked, draft: item.proposedDraft };
  const blob = new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `seo-suggestion-${item.id}.json`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export function AiSuggestionsPanel({ issues, user }: { issues: SeoIssue[]; user: CmsAdminUser }) {
  const [items, setItems] = useState<SeoSuggestion[]>(() => syncSuggestions(issues));
  const [selected, setSelected] = useState<SeoSuggestion | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => setItems(syncSuggestions(issues)), [issues]);
  const structured = useMemo(() => items.filter((item) => item.category === "structured" || /schema|structured/i.test(item.title)), [items]);

  const update = (item: SeoSuggestion) => {
    setItems((current) => current.map((entry) => entry.id === item.id ? item : entry));
    setSelected(item);
  };
  const act = async (operation: () => Promise<SeoSuggestion>, success: string) => {
    setError(""); setMessage("");
    try { update(await operation()); setMessage(success); } catch (caught) { setError(caught instanceof Error ? caught.message : "The action could not be completed."); }
  };
  const openReview = async (item: SeoSuggestion) => {
    setSelected(item); setError(""); setMessage("");
    if (item.status === "new") update(await reviewSuggestion(item, user.id));
  };
  const openEditor = async (item: SeoSuggestion) => {
    await logSuggestionUtilityAction(item, "editor_opened", user.id);
    window.location.assign(suggestionEditorUrl(item));
  };
  const exportOne = async (item: SeoSuggestion) => {
    downloadSuggestion(item);
    await logSuggestionUtilityAction(item, "exported", user.id);
    setMessage("Suggestion exported without private data.");
  };

  return <section className="rounded-md border bg-white" aria-labelledby="ai-suggestions-heading">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
      <div><div className="flex items-center gap-2"><Bot className="h-5 w-5 text-[#ed1c24]"/><h3 id="ai-suggestions-heading" className="font-semibold">AI Suggestions</h3></div><p className="mt-1 text-sm text-slate-500">Approval-only schema drafts. Suggestions never publish automatically.</p></div>
      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">{structured.length} schema findings</span>
    </header>
    {(error || message) && <p className={`m-5 rounded border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</p>}
    <div className="divide-y">
      {structured.slice(0, 50).map((item) => <article key={item.id} className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><h4 className="font-medium">{item.title}</h4><span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{item.status.replaceAll("_", " ")}</span></div><p className="mt-1 break-all text-xs text-slate-500">Affected page: {new URL(item.pageUrl).pathname}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs"><span>Risk: <strong>{item.risk}</strong></span><span>Confidence: <strong>{item.confidence}%</strong></span><span>Last checked: <strong>{new Date(item.lastChecked).toLocaleDateString()}</strong></span></div><p className="mt-2 text-sm text-slate-600">{item.expectedBenefit}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => openReview(item)}>Review</Button>
          <Button size="sm" onClick={() => act(() => applySuggestionDraft(item, user.id), "A schema-only draft and before/after snapshot were created. Nothing was published.")} disabled={!canGenerateSuggestionDraft(item) || item.status === "ignored" || item.status === "done"}>Apply as draft</Button>
          {item.status === "draft_applied" && <Button size="sm" variant="outline" onClick={() => { const note = window.prompt("Review note (required):") || ""; void act(() => reviewSuggestionDraft(item, user.id, note), "Draft reviewed. It is still not published."); }}>Review draft</Button>}
          {item.status === "draft_reviewed" && <Button size="sm" variant="outline" onClick={() => act(() => approveSuggestionDraft(item, user.id), "Draft approved for a separate publish workflow. Nothing was published.")}>Approve draft</Button>}
          {item.status === "ignored" ? <Button size="sm" variant="outline" onClick={() => act(() => reopenSuggestion(item, user.id), "Suggestion reopened.")}>Reopen</Button> : <Button size="sm" variant="outline" onClick={() => { if (!window.confirm("Ignore this suggestion without changing the website?")) return; const reason = window.prompt("Reason for ignoring this suggestion:") || ""; void act(() => ignoreSuggestion(item, user.id, reason), "Suggestion ignored. The website was not changed."); }}>Ignore</Button>}
          <Button size="sm" variant="outline" onClick={() => act(() => recheckSuggestion(item, user.id), "The rendered page was re-checked.")} disabled={!item.proposedDraft}><RefreshCw className="mr-1 h-3 w-3"/>Re-check</Button>
          <Button size="sm" variant="outline" onClick={() => act(() => markSuggestionDone(item, user.id), "Suggestion marked done after verification.")} disabled={item.status !== "validated" || item.validation !== "passed"}><CheckCircle2 className="mr-1 h-3 w-3"/>Mark done</Button>
          {item.draftId && item.status !== "rolled_back" && item.status !== "done" && <Button size="sm" variant="outline" onClick={() => { if (window.confirm("Roll back this unpublished schema draft?")) void act(() => rollbackSuggestionDraft(item, user.id), "The unpublished schema draft was rolled back."); }}>Rollback draft</Button>}
          <Button size="sm" variant="outline" onClick={() => openEditor(item)}><FileEdit className="mr-1 h-3 w-3"/>Open editor</Button>
          <Button size="icon" variant="outline" title="Export suggestion" onClick={() => exportOne(item)}><Download className="h-4 w-4"/></Button>
        </div>
      </article>)}
      {!structured.length && <p className="p-8 text-center text-sm text-slate-500">No schema suggestions are waiting. Run an SEO evaluation to refresh this list.</p>}
    </div>
    {selected && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="suggestion-review-title"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white shadow-2xl"><header className="flex items-start justify-between border-b p-5"><div><p className="text-xs font-semibold uppercase text-[#ed1c24]">Suggestion review</p><h3 id="suggestion-review-title" className="mt-1 text-xl font-semibold">{selected.title}</h3></div><Button size="icon" variant="ghost" title="Close" onClick={() => setSelected(null)}><X/></Button></header><div className="space-y-5 p-5"><div><p className="text-xs font-semibold uppercase text-slate-500">Affected page</p><p className="mt-1 break-all text-sm">{selected.pageUrl}</p></div><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-slate-500">Current schema status</p><strong>{selected.status.replaceAll("_", " ")}</strong></div><div><p className="text-xs text-slate-500">Risk</p><strong>{selected.risk}</strong></div><div><p className="text-xs text-slate-500">Confidence</p><strong>{selected.confidence}%</strong></div></div><div><p className="text-xs font-semibold uppercase text-slate-500">Expected benefit</p><p className="mt-1 text-sm text-slate-700">{selected.expectedBenefit}</p></div><div className="rounded border border-emerald-200 bg-emerald-50 p-4"><div className="flex gap-2"><ShieldAlert className="h-5 w-5 text-emerald-700"/><strong>Protected from change</strong></div><p className="mt-2 text-sm leading-6 text-emerald-900">URL, canonical, headings, visible content, metadata, internal links and existing valid schema remain unchanged. This action stores a separate schema draft only.</p></div><div><p className="text-xs font-semibold uppercase text-slate-500">Proposed schema draft</p><pre className="mt-2 max-h-72 overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-100">{selected.proposedDraft ? JSON.stringify(selected.proposedDraft, null, 2) : canGenerateSuggestionDraft(selected) ? "Select Apply as draft to read the affected page and generate a validated proposal." : "This issue requires manual repair in the correct editor."}</pre></div></div><footer className="flex flex-wrap justify-end gap-2 border-t p-5"><Button variant="outline" onClick={() => setSelected(null)}>Close</Button><Button variant="outline" onClick={() => openEditor(selected)}>Open editor <ExternalLink className="ml-2 h-4 w-4"/></Button><Button onClick={() => act(() => applySuggestionDraft(selected, user.id), "Draft created and validated. Nothing was published.")} disabled={!canGenerateSuggestionDraft(selected)}>Apply as draft</Button></footer></div></div>}
  </section>;
}
