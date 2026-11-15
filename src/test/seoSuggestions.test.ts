import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: () => Promise.resolve({ error: null }), upsert: () => Promise.resolve({ error: null }), update: () => ({ eq: () => Promise.resolve({ error: null }) }) }) } }));

import { approveSuggestionDraft, applySuggestionDraft, buildSuggestionDraft, markSuggestionDone, recheckSuggestion, reviewSuggestionDraft, rollbackSuggestionDraft, syncSuggestions, type SeoSuggestion } from "@/lib/seoSuggestions";
import type { SeoIssue } from "@/lib/seoAudit";

const issue: SeoIssue = { id: "11111111-1111-4111-8111-111111111111", pageUrl: "https://www.ambs.ae/about", category: "structured", severity: "warning", title: "Missing WebPage schema", detail: "No WebPage schema found", suggestedAction: "Create a schema draft" };
const context = { url: issue.pageUrl, title: "About AM Building Solutions", description: "About AM Building Solutions in the UAE.", existingTypes: ["Organization"] };

describe("SEO suggestion approval workflow", () => {
  beforeEach(() => localStorage.clear());
  it("creates a review suggestion with page context", () => {
    const [suggestion] = syncSuggestions([issue]);
    expect(suggestion.status).toBe("new");
    expect(suggestion.pageUrl).toBe(issue.pageUrl);
    expect(suggestion.confidence).toBeGreaterThan(0);
  });
  it("creates a schema-only draft and never a published state", async () => {
    const [suggestion] = syncSuggestions([issue]);
    const draft = await applySuggestionDraft(suggestion, "22222222-2222-4222-8222-222222222222", context);
    expect(draft.status).toBe("draft_applied");
    expect(draft.validation).toBe("needs_publish");
    expect(draft.beforeSnapshot).toMatchObject({ canonicalProtected: true, visibleContentProtected: true });
  });
  it("rejects Article drafts on non-article pages", () => {
    const suggestion = { ...syncSuggestions([{ ...issue, title: "Missing Article schema" }])[0] };
    expect(() => buildSuggestionDraft(suggestion)).toThrow(/article or resource pages/);
  });
  it("cannot mark an unresolved suggestion done", async () => {
    await expect(markSuggestionDone(syncSuggestions([issue])[0] as SeoSuggestion, "user")).rejects.toThrow(/Re-check/);
  });
  it("requires review before approval and supports rollback", async () => {
    const draft = await applySuggestionDraft(syncSuggestions([issue])[0], "22222222-2222-4222-8222-222222222222", context);
    await expect(approveSuggestionDraft(draft, "22222222-2222-4222-8222-222222222222")).rejects.toThrow(/reviewed/);
    const reviewed = await reviewSuggestionDraft(draft, "22222222-2222-4222-8222-222222222222", "Canonical and visible content preserved.");
    const approved = await approveSuggestionDraft(reviewed, "22222222-2222-4222-8222-222222222222");
    expect(approved.status).toBe("approved_as_draft");
    expect(approved.validation).toBe("needs_publish");
    expect((await rollbackSuggestionDraft(approved, "22222222-2222-4222-8222-222222222222")).status).toBe("rolled_back");
  });
  it("re-checks rendered JSON-LD before allowing done", async () => {
    const draft = await applySuggestionDraft(syncSuggestions([issue])[0], "22222222-2222-4222-8222-222222222222", context);
    const fetcher = async () => new Response('<html><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script></html>', { status: 200 });
    const validated = await recheckSuggestion(draft, "22222222-2222-4222-8222-222222222222", fetcher as typeof fetch);
    expect(validated.status).toBe("validated");
    expect((await markSuggestionDone(validated, "22222222-2222-4222-8222-222222222222")).status).toBe("done");
  });
});
