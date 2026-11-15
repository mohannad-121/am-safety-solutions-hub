import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { remoteCmsEnabled } from "@/lib/cms";
import type { SeoIssue } from "@/lib/seoAudit";
import { createArticleDraft, createWebPageDraft, validateSchemaDraft, type PageSchemaContext } from "@/lib/schemaValidation";

const client = supabase as unknown as SupabaseClient;
const STORAGE_KEY = "ambs_seo_suggestions_v3";
const LOG_KEY = "ambs_seo_suggestion_logs_v3";

export type SuggestionStatus = "new" | "reviewed" | "draft_applied" | "draft_reviewed" | "approved_as_draft" | "validated" | "ignored" | "done" | "rolled_back";
export type SeoSuggestion = SeoIssue & {
  status: SuggestionStatus;
  risk: "low" | "medium" | "high";
  confidence: number;
  expectedBenefit: string;
  lastChecked: string;
  draftId?: string;
  proposedDraft?: Record<string, unknown>;
  validation?: "pending" | "passed" | "failed" | "needs_publish";
  beforeSnapshot?: Record<string, unknown>;
  ignoreReason?: string;
  reviewNote?: string;
};
export type SuggestionAction = "reviewed" | "draft_applied" | "draft_reviewed" | "draft_approved" | "draft_rolled_back" | "ignored" | "reopened" | "marked_done" | "exported" | "editor_opened" | "validation_failed" | "validation_passed";
export type SuggestionLog = { id: string; suggestionId: string; pageUrl: string; action: SuggestionAction; beforeStatus: SuggestionStatus; afterStatus: SuggestionStatus; userId: string; createdAt: string };
type PageFetch = typeof fetch;

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]") as T[]; } catch { return []; }
}
function writeSuggestions(items: SeoSuggestion[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 500))); }
export function readSuggestions() { return read<SeoSuggestion>(STORAGE_KEY); }
export function readSuggestionLogs() { return read<SuggestionLog>(LOG_KEY); }
function riskFor(issue: SeoIssue): SeoSuggestion["risk"] { return issue.severity === "urgent" ? "high" : issue.severity === "warning" ? "medium" : "low"; }

export function syncSuggestions(issues: SeoIssue[]) {
  const current = readSuggestions();
  const bySignature = new Map(current.map((item) => [`${item.pageUrl}|${item.title}`, item]));
  const fromAudit = issues.map((issue) => bySignature.get(`${issue.pageUrl}|${issue.title}`) || ({ ...issue, status: "new", risk: riskFor(issue), confidence: issue.category === "structured" ? 92 : 78, expectedBenefit: issue.category === "structured" ? "Improves valid structured-data coverage without changing visible content." : "Creates a reviewable SEO improvement task.", lastChecked: new Date().toISOString() } satisfies SeoSuggestion));
  const activeSignatures = new Set(issues.map((issue) => `${issue.pageUrl}|${issue.title}`));
  const retained = current.filter((item) => item.status !== "new" && !activeSignatures.has(`${item.pageUrl}|${item.title}`));
  const merged = [...fromAudit, ...retained];
  writeSuggestions(merged);
  return merged;
}

function remoteStatus(status: SuggestionStatus) {
  if (status === "draft_applied") return "applied_to_draft";
  if (status === "draft_reviewed") return "reviewed";
  return status;
}
async function requireRemoteSuccess(operation: PromiseLike<{ error: { message?: string } | null }>, label: string) {
  if (!remoteCmsEnabled) return;
  const result = await operation;
  if (result.error) throw new Error(`${label}: ${result.error.message || "Supabase rejected the request."}`);
}
async function persistLog(log: SuggestionLog) {
  await requireRemoteSuccess(client.from("seo_suggestion_audit_logs").insert({ id: log.id, suggestion_id: log.suggestionId, page_url: log.pageUrl, action: log.action, before_status: log.beforeStatus, after_status: log.afterStatus, user_id: log.userId, created_at: log.createdAt }), "Audit log could not be persisted");
  localStorage.setItem(LOG_KEY, JSON.stringify([log, ...readSuggestionLogs()].slice(0, 2000)));
}
async function save(item: SeoSuggestion, action: SuggestionAction, before: SuggestionStatus, userId: string) {
  const persisted: Record<string, unknown> = { id: item.id, page_url: item.pageUrl, issue_type: item.title, current_value: JSON.stringify(item.beforeSnapshot || {}), suggested_value: JSON.stringify(item.proposedDraft || {}), priority: item.severity, confidence: item.confidence, risk_level: item.risk, status: remoteStatus(item.status), requires_admin_approval: true };
  if (item.status === "approved_as_draft") { persisted.approved_by = userId; persisted.approved_at = new Date().toISOString(); }
  await requireRemoteSuccess(client.from("seo_suggestions").upsert(persisted), "Suggestion status could not be persisted");
  const log: SuggestionLog = { id: crypto.randomUUID(), suggestionId: item.id, pageUrl: item.pageUrl, action, beforeStatus: before, afterStatus: item.status, userId, createdAt: new Date().toISOString() };
  await persistLog(log);
  writeSuggestions([item, ...readSuggestions().filter((entry) => entry.id !== item.id)]);
  return item;
}

function schemaTypes(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(schemaTypes);
  const record = value as Record<string, unknown>;
  const own = Array.isArray(record["@type"]) ? (record["@type"] as unknown[]).map(String) : typeof record["@type"] === "string" ? [record["@type"]] : [];
  return [...own, ...schemaTypes(record["@graph"])];
}

export async function loadPageSchemaContext(item: SeoSuggestion, fetcher: PageFetch = fetch): Promise<PageSchemaContext> {
  const response = await fetcher(item.pageUrl, { cache: "no-store", redirect: "follow" });
  if (!response.ok) throw new Error(`Affected page returned HTTP ${response.status}; a trustworthy schema draft could not be generated.`);
  const document = new DOMParser().parseFromString(await response.text(), "text/html");
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || item.pageUrl;
  const title = document.querySelector("h1")?.textContent?.trim() || document.querySelector("title")?.textContent?.trim() || "";
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content.trim() || "";
  if (!title || !description) throw new Error("The affected page must have a real title and description before a schema draft can be created.");
  const parsedSchemas: unknown[] = [];
  for (const node of document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
    try { parsedSchemas.push(JSON.parse(node.textContent || "")); } catch { /* Invalid source blocks are never copied. */ }
  }
  const breadcrumbs = Array.from(document.querySelectorAll<HTMLElement>('[aria-label*="breadcrumb" i] a[href], nav.breadcrumb a[href]')).map((link) => ({ name: link.textContent?.trim() || "", url: (link as HTMLAnchorElement).href })).filter((entry) => entry.name && entry.url);
  return { url: canonical, title, description, author: document.querySelector<HTMLMetaElement>('meta[name="author"]')?.content.trim() || undefined, datePublished: document.querySelector<HTMLMetaElement>('meta[property="article:published_time"]')?.content.trim() || undefined, dateModified: document.querySelector<HTMLMetaElement>('meta[property="article:modified_time"]')?.content.trim() || undefined, breadcrumbs, existingTypes: [...new Set(parsedSchemas.flatMap(schemaTypes))] };
}

export function canGenerateSuggestionDraft(item: SeoSuggestion) { return /missing webpage schema|structured data not detected|missing article schema/i.test(item.title); }
export async function reviewSuggestion(item: SeoSuggestion, userId: string) { return save({ ...item, status: "reviewed" }, "reviewed", item.status, userId); }
export function buildSuggestionDraft(item: SeoSuggestion, context?: PageSchemaContext) {
  if (!canGenerateSuggestionDraft(item)) throw new Error("This finding requires manual schema repair because an automatic draft could overwrite or duplicate existing structured data.");
  const pathname = new URL(item.pageUrl).pathname;
  const title = context?.title || item.title.replace(/^Missing\s+/i, "");
  const description = context?.description || item.detail;
  if (/article/i.test(item.title)) {
    if (!pathname.startsWith("/articles/") && !pathname.startsWith("/resources/")) throw new Error("Article schema can only be drafted for article or resource pages.");
    return createArticleDraft(item.pageUrl, title, description, context);
  }
  return createWebPageDraft(item.pageUrl, title, description, context);
}

export async function applySuggestionDraft(item: SeoSuggestion, userId: string, suppliedContext?: PageSchemaContext) {
  const context = suppliedContext || await loadPageSchemaContext(item);
  const proposedDraft = buildSuggestionDraft(item, context);
  const validation = validateSchemaDraft(proposedDraft, context.existingTypes || []);
  if (!validation.valid) throw new Error(validation.errors.join(" "));
  const beforeSnapshot = { pageUrl: item.pageUrl, title: context.title, description: context.description, canonical: context.url, existingSchemaTypes: context.existingTypes || [], canonicalProtected: true, metadataProtected: true, headingsProtected: true, internalLinksProtected: true, visibleContentProtected: true };
  const draftId = crypto.randomUUID();
  await requireRemoteSuccess(client.from("seo_schema_drafts").insert({ id: draftId, suggestion_id: item.id, page_url: item.pageUrl, before_snapshot: beforeSnapshot, proposed_schema: proposedDraft, validation_status: "needs_publish", status: "draft", created_by: userId }), "Schema draft could not be persisted");
  return save({ ...item, draftId, status: "draft_applied", proposedDraft, beforeSnapshot, validation: "needs_publish" }, "draft_applied", item.status, userId);
}

async function updateDraft(item: SeoSuggestion, values: Record<string, unknown>, label: string) {
  if (!item.draftId) throw new Error("No persisted schema draft is attached to this suggestion.");
  await requireRemoteSuccess(client.from("seo_schema_drafts").update(values).eq("id", item.draftId), label);
}
export async function reviewSuggestionDraft(item: SeoSuggestion, userId: string, note: string) {
  if (item.status !== "draft_applied") throw new Error("Create the schema draft before reviewing it.");
  if (!note.trim()) throw new Error("A review note is required.");
  await updateDraft(item, { status: "reviewed", reviewed_by: userId, review_note: note, updated_at: new Date().toISOString() }, "Draft review could not be persisted");
  return save({ ...item, status: "draft_reviewed", reviewNote: note }, "draft_reviewed", item.status, userId);
}
export async function approveSuggestionDraft(item: SeoSuggestion, userId: string) {
  if (item.status !== "draft_reviewed") throw new Error("The schema draft must be reviewed before approval.");
  await updateDraft(item, { status: "approved", reviewed_by: userId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }, "Draft approval could not be persisted");
  return save({ ...item, status: "approved_as_draft", validation: "needs_publish" }, "draft_approved", item.status, userId);
}
export async function rollbackSuggestionDraft(item: SeoSuggestion, userId: string) {
  if (!item.draftId) throw new Error("No schema draft is available to roll back.");
  await updateDraft(item, { status: "rolled_back", rolled_back_at: new Date().toISOString(), updated_at: new Date().toISOString() }, "Draft rollback could not be persisted");
  return save({ ...item, status: "rolled_back", validation: "failed" }, "draft_rolled_back", item.status, userId);
}
export async function ignoreSuggestion(item: SeoSuggestion, userId: string, reason: string) { if (!reason.trim()) throw new Error("An ignore reason is required."); return save({ ...item, status: "ignored", ignoreReason: reason }, "ignored", item.status, userId); }
export async function reopenSuggestion(item: SeoSuggestion, userId: string) { return save({ ...item, status: "new", ignoreReason: undefined }, "reopened", item.status, userId); }

function resolvedByRenderedPage(item: SeoSuggestion, html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const parsed: unknown[] = [];
  let invalidBlocks = 0;
  for (const node of document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) { try { parsed.push(JSON.parse(node.textContent || "")); } catch { invalidBlocks += 1; } }
  const types = parsed.flatMap(schemaTypes);
  if (/invalid json-ld/i.test(item.title)) return invalidBlocks === 0;
  if (/article schema/i.test(item.title)) return types.some((type) => type === "Article" || type === "BlogPosting");
  if (/webpage schema/i.test(item.title)) return types.includes("WebPage");
  if (/structured data not detected/i.test(item.title)) return parsed.length > 0;
  return false;
}
export async function recheckSuggestion(item: SeoSuggestion, userId: string, fetcher: PageFetch = fetch) {
  const response = await fetcher(item.pageUrl, { cache: "no-store", redirect: "follow" });
  if (!response.ok) throw new Error(`Re-check failed because the affected page returned HTTP ${response.status}.`);
  const passed = resolvedByRenderedPage(item, await response.text());
  const updated: SeoSuggestion = { ...item, status: passed ? "validated" : item.status, validation: passed ? "passed" : item.proposedDraft ? "needs_publish" : "failed", lastChecked: new Date().toISOString() };
  return save(updated, passed ? "validation_passed" : "validation_failed", item.status, userId);
}
export async function markSuggestionDone(item: SeoSuggestion, userId: string) { if (item.status !== "validated" || item.validation !== "passed") throw new Error("Re-check must confirm that the issue is resolved before marking it done."); return save({ ...item, status: "done" }, "marked_done", item.status, userId); }
export async function logSuggestionUtilityAction(item: SeoSuggestion, action: "exported" | "editor_opened", userId: string) { await persistLog({ id: crypto.randomUUID(), suggestionId: item.id, pageUrl: item.pageUrl, action, beforeStatus: item.status, afterStatus: item.status, userId, createdAt: new Date().toISOString() }); }
export function suggestionEditorUrl(item: SeoSuggestion) { const path = new URL(item.pageUrl).pathname; if (path.startsWith("/articles/") || path.startsWith("/resources/")) return `/admin/articles?path=${encodeURIComponent(path)}`; if (path.startsWith("/products/") || item.category === "image") return `/admin/products?path=${encodeURIComponent(path)}`; return `/admin/pages?path=${encodeURIComponent(path)}`; }
