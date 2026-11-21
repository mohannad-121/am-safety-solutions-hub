import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { remoteCmsEnabled } from "@/lib/cms";

type Page = { topic?: string; url: string; status: number; title: string; h1: string[]; words: number; score: number; issues: string[] };
type Site = { origin: string; score: number; pages: Page[] };
type Suggestion = { title: string; reason: string; action: string; ourUrl: string; competitorUrl: string; priority: string };
type Comparison = { id: string; checkedAt: string; ours: Site; competitor: Site; matchedTopics?: string[]; differences: Array<{ label: string; ourValue: number; competitorValue: number; unit: string; leader: string }>; winner: "ours" | "competitor" | "tie" | "inconclusive"; scope: string; ai: { status: string; summary?: string; error?: string; suggestions: Suggestion[] } };

export function CompetitorComparison() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Comparison | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!remoteCmsEnabled) return;
    void supabase.from("seo_comparisons").select("id,result").order("created_at", { ascending: false }).limit(1).then(({ data }) => {
      if (data?.[0]) setResult({ ...(data[0].result as unknown as Omit<Comparison, "id">), id: data[0].id });
    });
  }, []);

  async function compare(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setRunning(true);
    try {
      const target = new URL(url);
      if (target.protocol !== "https:") throw new Error("Enter a public HTTPS URL.");
      if (!remoteCmsEnabled) throw new Error("Connect the admin to Supabase to run comparisons.");
      const { data, error: callError } = await supabase.functions.invoke("seo-compare", { body: { competitorUrl: target.toString() } });
      if (callError) throw callError;
      if (data?.error) throw new Error(data.error);
      setResult(data as Comparison);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The comparison failed.");
    } finally {
      setRunning(false);
    }
  }

  return <section className="rounded-md border bg-white p-5" aria-labelledby="competitor-heading">
    <h3 id="competitor-heading" className="text-lg font-semibold">Competitor SEO comparison</h3>
    <p className="mt-1 text-sm text-slate-600">Enter a competitor website. The audit compares public HTML evidence from up to five pages per site, then drafts SEO actions when the OpenAI key is configured.</p>
    <form onSubmit={compare} className="mt-4 flex flex-wrap gap-2">
      <label htmlFor="competitor-url" className="sr-only">Competitor website URL</label>
      <input id="competitor-url" type="url" required placeholder="https://competitor.example" value={url} onChange={(event) => setUrl(event.target.value)} className="min-w-[260px] flex-1 rounded-md border px-3 py-2 text-sm" />
      <Button type="submit" disabled={running}>{running ? "Comparing…" : "Compare SEO"}</Button>
    </form>
    {error && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {result && !result.matchedTopics && <p className="mt-5 rounded bg-amber-50 p-3 text-sm text-amber-900">This earlier comparison used unmatched page samples. Run it again for the corrected topic comparison.</p>}
    {result?.matchedTopics && <div className="mt-6 space-y-5">
      <p className="text-xs text-slate-500">Checked {new Date(result.checkedAt).toLocaleString()} · {result.scope}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {([result.ours, result.competitor] as Site[]).map((site, index) => <article key={site.origin} className="rounded-md border p-4">
          <p className="text-sm font-medium">{index === 0 ? "Our website" : "Competitor"}</p>
          <p className="break-all text-xs text-slate-500">{site.origin}</p>
          <p className="mt-2 text-3xl font-semibold">{site.score}<span className="text-base text-slate-500">/100 technical</span></p>
          <p className="text-xs text-slate-500">{result.matchedTopics.length} matched page topics measured</p>
          <ul className="mt-3 space-y-2 text-xs">{site.pages.map((page) => <li key={page.url} className="border-t pt-2"><span className="font-semibold">{page.topic?.replaceAll("_", " ")}: </span><a href={page.url} target="_blank" rel="noreferrer" className="break-all text-blue-700 underline">{page.url}</a><span className="ml-2 font-semibold">{page.score}/100</span><p className="mt-1 text-slate-600">{page.issues.length ? page.issues.join(" · ") : "No issues in measured checks"}</p></li>)}</ul>
        </article>)}
      </div>
      <p className="rounded bg-slate-50 p-3 text-sm font-medium">Measured technical result: {result.winner === "inconclusive" || result.winner === "tie" ? "Inconclusive — no clear winner in these checks" : result.winner === "ours" ? "Our website leads on these checks" : "Competitor leads on these checks"}</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Measured difference</th><th className="py-2">Ours</th><th className="py-2">Competitor</th></tr></thead><tbody>{result.differences?.map((item) => <tr key={item.label} className="border-b"><td className="py-2">{item.label}</td><td className="py-2">{item.ourValue}{item.unit === "%" ? "%" : ` ${item.unit}`}</td><td className="py-2">{item.competitorValue}{item.unit === "%" ? "%" : ` ${item.unit}`}</td></tr>)}</tbody></table></div>
      {result.ai.status === "key_required" && <p className="text-sm text-amber-800">OpenAI suggestions will appear after OPENAI_API_KEY is added to Supabase Edge Function secrets.</p>}
      {result.ai.status === "failed" && <p className="text-sm text-amber-800">AI suggestions unavailable: {result.ai.error}</p>}
      {result.ai.summary && <p className="text-sm text-slate-700">{result.ai.summary}</p>}
      {!!result.ai.suggestions?.length && <div><h4 className="font-semibold">Suggested SEO improvements</h4><div className="mt-2 space-y-3">{result.ai.suggestions.map((item, index) => <article key={`${item.title}-${index}`} className="rounded-md border p-3 text-sm"><p className="font-semibold">{item.title} · {item.priority} priority</p><p className="mt-1">{item.reason}</p><p className="mt-1"><strong>Action:</strong> {item.action}</p><p className="mt-2 break-all text-xs text-slate-500">Evidence: <a href={item.ourUrl} target="_blank" rel="noreferrer" className="underline">our page</a> · <a href={item.competitorUrl} target="_blank" rel="noreferrer" className="underline">competitor page</a></p></article>)}</div></div>}
    </div>}
  </section>;
}
