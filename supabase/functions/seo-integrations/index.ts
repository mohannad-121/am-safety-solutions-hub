import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const allowedRoles = new Set(["super_admin", "admin", "seo_reviewer"]);
const blockedExtensions = /\.(?:pdf|docx?|xlsx?|zip|rar|7z|png|jpe?g|gif|webp|svg|mp4|webm|mp3|woff2?|ttf)$/i;

type AdminContext = { user: User; client: SupabaseClient };
type RequestBody = { action: string; siteUrl?: string; urls?: string[]; sitemapUrl?: string; startDate?: string; endDate?: string; maxPages?: number; force?: boolean; device?: "mobile" | "desktop" };

async function authenticateAdmin(request: Request): Promise<AdminContext> {
  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Authentication required.");
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const client = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) throw new Error("The Supabase session is invalid or expired.");
  const profile = await client.from("cms_admin_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (profile.error || !profile.data || !allowedRoles.has(profile.data.role)) throw new Error("An SEO reviewer role is required.");
  return { user, client };
}

function approvedOrigin(requested?: string) {
  const configured = Deno.env.get("PUBLIC_SITE_URL") || "";
  if (!configured) throw new Error("PUBLIC_SITE_URL is not configured on the server.");
  const approved = new URL(configured);
  if (approved.protocol !== "https:" || /^(?:localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|169\.254\.)/i.test(approved.hostname)) {
    throw new Error("PUBLIC_SITE_URL must be an approved public HTTPS origin.");
  }
  if (requested && new URL(requested).origin !== approved.origin) throw new Error("The requested URL is outside the approved production origin.");
  return approved.origin;
}

function approvedUrl(value: string, origin: string) {
  const url = new URL(value, origin);
  if (url.origin !== origin) throw new Error("Cross-origin URL rejected.");
  if (url.protocol !== "https:") throw new Error("Only HTTPS URLs are allowed.");
  if (/^\/(?:admin|api|login)(?:\/|$)/i.test(url.pathname) || blockedExtensions.test(url.pathname)) return "";
  url.hash = "";
  ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"].forEach((key) => url.searchParams.delete(key));
  return url.toString();
}

function base64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function googleAccessToken() {
  const raw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!raw) throw new Error("Google service account is not configured.");
  const account = JSON.parse(raw) as { client_email: string; private_key: string; token_uri?: string };
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = account.token_uri || "https://oauth2.googleapis.com/token";
  const unsigned = `${base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64Url(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/webmasters", aud: tokenUri, iat: now, exp: now + 3600 }))}`;
  const pem = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const keyBytes = Uint8Array.from(atob(pem), (character) => character.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", keyBytes, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)));
  const response = await fetch(tokenUri, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64Url(signature)}` }) });
  if (!response.ok) throw new Error(`Google authentication failed with HTTP ${response.status}.`);
  return (await response.json() as { access_token: string }).access_token;
}

async function google(path: string, init: RequestInit = {}) {
  const response = await fetch(path, { ...init, headers: { Authorization: `Bearer ${await googleAccessToken()}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Google API returned HTTP ${response.status}.`);
  return body;
}

function attributes(tag: string) {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)) result[match[1].toLowerCase()] = match[2];
  return result;
}
function meta(html: string, key: string) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) { const attrs = attributes(match[0]); if (attrs.name === key || attrs.property === key) return attrs.content || ""; }
  return "";
}
function canonicalLinks(html: string) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0])).filter((attrs) => attrs.rel?.toLowerCase() === "canonical" && attrs.href).map((attrs) => attrs.href);
}
function anchorLinks(html: string, base: string, origin: string) {
  const links: Array<{ url: string; anchorText: string }> = [];
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attributes(match[1]).href;
    if (!href) continue;
    try { const url = approvedUrl(href, origin); if (url) links.push({ url, anchorText: match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() }); } catch { /* External or unsafe target. */ }
  }
  return links;
}
function imageSignals(html: string, base: string) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => { const attrs = attributes(match[0]); let url = ""; try { url = new URL(attrs.src || "", base).toString(); } catch { /* Invalid image URL. */ } return { url, alt: attrs.alt || "" }; }).filter((image) => image.url);
}
function schemaSignals(html: string) {
  const types: string[] = [];
  const urls: string[] = [];
  let invalidJsonLd = 0;
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const type = record["@type"];
    const typeList = Array.isArray(type) ? type.map(String) : typeof type === "string" ? [type] : [];
    types.push(...typeList);
    if (typeof record.mainEntityOfPage === "string") urls.push(record.mainEntityOfPage);
    if (typeList.some((item) => ["WebPage", "Article", "BlogPosting"].includes(item)) && typeof record.url === "string") urls.push(record.url);
    visit(record["@graph"]);
  };
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) { try { visit(JSON.parse(match[1])); } catch { invalidJsonLd += 1; } }
  return { types, urls: [...new Set(urls)], invalidJsonLd };
}
function robotsRules(text: string) {
  const disallowed: string[] = [];
  let applies = false;
  for (const rawLine of text.split(/\r?\n/)) { const line = rawLine.replace(/#.*/, "").trim(); const [field, ...rest] = line.split(":"); const value = rest.join(":").trim(); if (field?.toLowerCase() === "user-agent") applies = value === "*" || /googlebot/i.test(value); if (applies && field?.toLowerCase() === "disallow" && value) disallowed.push(value); }
  return disallowed;
}
function isDisallowed(url: string, rules: string[]) { return rules.some((rule) => rule !== "/" && new URL(url).pathname.startsWith(rule)); }

async function checkTarget(url: string) {
  let response = await fetch(url, { method: "HEAD", redirect: "follow" }).catch(() => null);
  if (response?.status === 405) response = await fetch(url, { method: "GET", redirect: "follow" }).catch(() => null);
  return { url, status: response?.status || 0, finalUrl: response?.url || url };
}

async function liveCrawl(siteUrl: string, maxPages = 100) {
  const origin = approvedOrigin(siteUrl);
  const limit = Math.min(Math.max(maxPages, 1), 250);
  const robotsText = await fetch(`${origin}/robots.txt`).then((response) => response.ok ? response.text() : "").catch(() => "");
  const disallowed = robotsRules(robotsText);
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`, { redirect: "follow" });
  if (!sitemapResponse.ok) throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}.`);
  const xml = await sitemapResponse.text();
  const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => approvedUrl(match[1], origin)).filter(Boolean).slice(0, limit);
  const sitemapSet = new Set(sitemapUrls);
  const queue = [`${origin}/`, ...sitemapUrls];
  const queued = new Set(queue);
  const pages: Array<Record<string, unknown> & { requestedUrl: string; finalUrl: string; title: string; description: string; canonical: string; links: Array<{ url: string; anchorText: string }>; images: Array<{ url: string; alt: string }> }> = [];
  while (queue.length && pages.length < limit) {
    const requestedUrl = queue.shift()!;
    if (isDisallowed(requestedUrl, disallowed)) continue;
    const started = Date.now();
    const response = await fetch(requestedUrl, { redirect: "follow", headers: { "User-Agent": "AMBS-SEO-Audit/2.0" } });
    const html = await response.text();
    const finalUrl = response.url;
    const links = anchorLinks(html, finalUrl, origin);
    for (const link of links) if (!queued.has(link.url) && queue.length + pages.length < limit) { queued.add(link.url); queue.push(link.url); }
    const images = imageSignals(html, finalUrl);
    const schemas = schemaSignals(html);
    const canonicalValues = canonicalLinks(html);
    const canonicals = canonicalValues.map((value) => { try { return new URL(value, finalUrl).toString(); } catch { return value; } });
    const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    const h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() || "";
    const description = meta(html, "description");
    const robots = meta(html, "robots");
    const ogUrlValue = meta(html, "og:url");
    const ogUrl = (() => { try { return ogUrlValue ? new URL(ogUrlValue, finalUrl).toString() : ""; } catch { return ogUrlValue; } })();
    const visibleText = html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const topicClusterIds = [...html.matchAll(/data-topic-cluster=["']([^"']+)["']/gi)].map((match) => match[1]);
    const issues: string[] = [];
    if (!response.ok) issues.push(`HTTP ${response.status}`);
    if (!title) issues.push("Missing title");
    if (!description) issues.push("Missing meta description");
    if (canonicals.length !== 1) issues.push(`Expected one canonical, found ${canonicals.length}`);
    if (h1.length !== 1) issues.push(`Expected one H1, found ${h1.length}`);
    if (/noindex/i.test(robots)) issues.push("Page is noindex");
    if (!meta(html, "viewport")) issues.push("Missing viewport meta");
    if (schemas.invalidJsonLd) issues.push(`${schemas.invalidJsonLd} invalid JSON-LD block(s)`);
    if (images.some((image) => !image.alt.trim())) issues.push(`${images.filter((image) => !image.alt.trim()).length} image(s) missing alt text`);
    const genericAnchorCount = links.filter((link) => /^(learn more|click here|read more|view|more)$/i.test(link.anchorText)).length;
    if (genericAnchorCount) issues.push(`${genericAnchorCount} generic internal-link anchor(s)`);
    if (links.length < 3) issues.push(`Only ${links.length} internal link(s)`);
    pages.push({ requestedUrl, finalUrl, status: response.status, redirected: requestedUrl !== finalUrl, responseMs: Date.now() - started, title, description, canonical: canonicals[0] || "", canonicalRaw: canonicalValues[0] || "", canonicalCount: canonicals.length, ogUrl, robots, indexable: response.ok && !/noindex/i.test(robots), h1, h2, schemaTypes: schemas.types, schemaUrls: schemas.urls, invalidJsonLd: schemas.invalidJsonLd, textLength: visibleText.length, topicClusterIds, reviewSignal: /written by|technical review|reviewed by|content review/i.test(visibleText), helpfulContentSignal: /short answer|frequently asked|checklist|what project teams|what you need|required sections|before installation|scope review|applications/i.test(visibleText), internalLinks: links.length, genericAnchorCount, links, imageCount: images.length, images, imagesMissingAlt: images.filter((image) => !image.alt.trim()).map((image) => image.url), issues });
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const inbound = new Map<string, number>();
  const graph = new Map<string, string[]>();
  pages.forEach((page) => { const targets = page.links.map((link) => link.url); graph.set(page.finalUrl, targets); targets.forEach((url) => inbound.set(url, (inbound.get(url) || 0) + 1)); });
  const depths = new Map<string, number>([[`${origin}/`, 0], [origin, 0]]);
  const depthQueue = [...depths.keys()];
  while (depthQueue.length) { const current = depthQueue.shift()!; const depth = depths.get(current)!; for (const target of graph.get(current) || []) if (!depths.has(target)) { depths.set(target, depth + 1); depthQueue.push(target); } }
  const titleGroups = new Map<string, string[]>();
  const descriptionGroups = new Map<string, string[]>();
  const canonicalGroups = new Map<string, string[]>();
  pages.forEach((page) => { titleGroups.set(page.title || "(missing)", [...(titleGroups.get(page.title || "(missing)") || []), page.finalUrl]); descriptionGroups.set(page.description || "(missing)", [...(descriptionGroups.get(page.description || "(missing)") || []), page.finalUrl]); canonicalGroups.set(page.canonical || "(missing)", [...(canonicalGroups.get(page.canonical || "(missing)") || []), page.finalUrl]); });
  const duplicates = (groups: Map<string, string[]>) => [...groups.entries()].filter(([, urls]) => urls.length > 1).map(([value, urls]) => ({ value, urls }));
  const linkDetails = new Map<string, Array<{ sourcePage: string; anchorText: string }>>();
  pages.forEach((page) => page.links.forEach((link) => linkDetails.set(link.url, [...(linkDetails.get(link.url) || []), { sourcePage: page.finalUrl, anchorText: link.anchorText }])));
  const linkTargets = [...linkDetails.keys()].slice(0, 500);
  const brokenLinks = [];
  const redirectedLinks = [];
  for (const url of linkTargets) { const result = await checkTarget(url); if (result.status >= 400 || !result.status) brokenLinks.push({ ...result, sources: linkDetails.get(url) }); else if (result.finalUrl !== url) redirectedLinks.push({ ...result, sources: linkDetails.get(url) }); }
  const imageTargets = [...new Set(pages.flatMap((page) => page.images.map((image) => image.url)))].slice(0, 300);
  const brokenImages = [];
  for (const url of imageTargets) { const result = await checkTarget(url); if (result.status >= 400 || !result.status) brokenImages.push(result); }
  const publicPages = pages.map(({ links, images, ...page }) => ({ ...page, inboundLinks: inbound.get(page.finalUrl) || 0, clickDepth: depths.get(page.finalUrl) ?? null, orphanStatus: sitemapSet.has(page.requestedUrl) && !inbound.get(page.finalUrl) && page.finalUrl !== `${origin}/` ? "orphan" : depths.has(page.finalUrl) ? "linked" : "sitemap_only", internalLinkList: links }));
  return { siteUrl: origin, checkedAt: new Date().toISOString(), pages: publicPages, sitemapCount: sitemapUrls.length, sitemapUrls, discoveredCount: queued.size, orphanPages: publicPages.filter((page) => page.orphanStatus === "orphan").map((page) => page.finalUrl), sitemapOnlyPages: publicPages.filter((page) => page.orphanStatus === "sitemap_only").map((page) => page.finalUrl), weaklyLinkedPages: publicPages.filter((page) => page.finalUrl !== `${origin}/` && Number(page.inboundLinks) < 3).map((page) => page.finalUrl), deepPages: publicPages.filter((page) => typeof page.clickDepth === "number" && page.clickDepth > 3).map((page) => page.finalUrl), genericAnchorPages: publicPages.filter((page) => Number(page.genericAnchorCount) > 0).map((page) => page.finalUrl), crawledMissingFromSitemap: publicPages.filter((page) => !sitemapSet.has(page.finalUrl)).map((page) => page.finalUrl), brokenLinks, redirectedLinks, brokenImages, duplicateTitles: duplicates(titleGroups), duplicateDescriptions: duplicates(descriptionGroups), duplicateCanonicals: duplicates(canonicalGroups), robots: { fetched: Boolean(robotsText), disallowed }, limits: { maxPages: limit, delayMs: 100, linkChecks: 500, imageChecks: 300 } };
}

async function cacheGet(client: SupabaseClient, cacheKey: string) {
  const result = await client.from("seo_integration_cache").select("payload,expires_at").eq("cache_key", cacheKey).maybeSingle();
  if (!result.error && result.data && new Date(result.data.expires_at).getTime() > Date.now()) return result.data.payload;
  return null;
}
async function cacheSet(client: SupabaseClient, userId: string, cacheKey: string, action: string, siteUrl: string, payload: unknown, ttlMinutes: number) {
  const result = await client.from("seo_integration_cache").upsert({ cache_key: cacheKey, action, site_url: siteUrl, payload, expires_at: new Date(Date.now() + ttlMinutes * 60_000).toISOString(), updated_by: userId, updated_at: new Date().toISOString() });
  if (result.error) throw new Error(`Integration cache failed: ${result.error.message}`);
}
async function withRun(context: AdminContext, body: RequestBody, siteUrl: string, operation: () => Promise<unknown>) {
  const id = crypto.randomUUID();
  const started = await context.client.from("seo_integration_runs").insert({ id, action: body.action, status: "running", site_url: siteUrl, request_summary: { urlCount: body.urls?.length || 0, maxPages: body.maxPages || null }, created_by: context.user.id });
  if (started.error) throw new Error(`Integration run could not be recorded: ${started.error.message}`);
  try {
    const result = await operation();
    const completed = await context.client.from("seo_integration_runs").update({ status: "completed", result_summary: { completed: true, itemCount: Array.isArray((result as Record<string, unknown>)?.results) ? ((result as Record<string, unknown>).results as unknown[]).length : undefined }, completed_at: new Date().toISOString() }).eq("id", id);
    if (completed.error) throw new Error(`Integration completion could not be recorded: ${completed.error.message}`);
    return result;
  } catch (error) {
    await context.client.from("seo_integration_runs").update({ status: "failed", error_message: error instanceof Error ? error.message : "Integration failed", completed_at: new Date().toISOString() }).eq("id", id);
    throw error;
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const context = await authenticateAdmin(request);
    const body = await request.json() as RequestBody;
    const publicSiteUrl = approvedOrigin(body.siteUrl);
    const gscSiteUrl = Deno.env.get("GSC_SITE_URL") || "";
    const configured = Boolean(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON") && gscSiteUrl);
    if (body.action === "status") {
      const usage = await context.client.from("seo_url_inspection_usage").select("requests_used").eq("usage_date", new Date().toISOString().slice(0, 10)).maybeSingle();
      return json({ searchConsole: configured, pageSpeed: Boolean(Deno.env.get("PAGESPEED_API_KEY")), crux: Boolean(Deno.env.get("CRUX_API_KEY") || Deno.env.get("PAGESPEED_API_KEY")), siteUrl: publicSiteUrl, gscProperty: gscSiteUrl || null, inspectionQuota: { used: usage.data?.requests_used || 0, safetyBudget: 200 } });
    }
    if (body.action === "live_crawl") return json(await withRun(context, body, publicSiteUrl, async () => { const key = `crawl:${publicSiteUrl}:${body.maxPages || 100}`; if (!body.force) { const cached = await cacheGet(context.client, key); if (cached) return { ...(cached as Record<string, unknown>), cached: true }; } const result = await liveCrawl(publicSiteUrl, body.maxPages); await cacheSet(context.client, context.user.id, key, body.action, publicSiteUrl, result, 30); return result; }));
    if (body.action === "pagespeed") return json(await withRun(context, body, publicSiteUrl, async () => { const key = Deno.env.get("PAGESPEED_API_KEY"); if (!key) throw new Error("PageSpeed API is not configured."); const target = approvedUrl(body.urls?.[0] || publicSiteUrl, publicSiteUrl); const strategy = body.device === "desktop" ? "desktop" : "mobile"; const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(target)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${encodeURIComponent(key)}`); if (!response.ok) throw new Error(`PageSpeed returned HTTP ${response.status}.`); return { ...(await response.json()), strategy, checkedAt: new Date().toISOString() }; }));
    if (body.action === "crux") return json(await withRun(context, body, publicSiteUrl, async () => { const key = Deno.env.get("CRUX_API_KEY") || Deno.env.get("PAGESPEED_API_KEY"); if (!key) throw new Error("CrUX API is not configured."); const target = approvedUrl(body.urls?.[0] || publicSiteUrl, publicSiteUrl); const response = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: target, formFactor: body.device === "desktop" ? "DESKTOP" : "PHONE", metrics: ["largest_contentful_paint", "interaction_to_next_paint", "cumulative_layout_shift", "first_contentful_paint"] }) }); if (!response.ok) throw new Error(`CrUX returned HTTP ${response.status}. Field data may be unavailable for this URL.`); return { ...(await response.json()), device: body.device === "desktop" ? "desktop" : "mobile", checkedAt: new Date().toISOString() }; }));
    if (!configured) throw new Error("Google Search Console is not configured on the server.");
    const encodedSite = encodeURIComponent(gscSiteUrl);
    if (body.action === "search_analytics") return json(await withRun(context, body, publicSiteUrl, async () => { const key = `gsc:${gscSiteUrl}:${body.startDate}:${body.endDate}`; if (!body.force) { const cached = await cacheGet(context.client, key); if (cached) return { ...(cached as Record<string, unknown>), cached: true }; } const result = await google(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, { method: "POST", body: JSON.stringify({ startDate: body.startDate, endDate: body.endDate, dimensions: ["page", "query", "device", "country"], rowLimit: 25000 }) }); await cacheSet(context.client, context.user.id, key, body.action, publicSiteUrl, result, 360); return result; }));
    if (body.action === "inspect") return json(await withRun(context, body, publicSiteUrl, async () => { const urls = [...new Set(body.urls || [])].slice(0, 20).map((url) => approvedUrl(url, publicSiteUrl)).filter(Boolean); if (!urls.length) throw new Error("Select at least one approved production URL."); const usage = await context.client.rpc("increment_seo_url_inspection_usage", { request_count: urls.length }); if (usage.error) throw new Error(usage.error.message); const results = []; for (const inspectionUrl of urls) { const key = `inspect:${inspectionUrl}`; const cached = body.force ? null : await cacheGet(context.client, key); const result = cached || await google("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { method: "POST", body: JSON.stringify({ inspectionUrl, siteUrl: gscSiteUrl }) }); if (!cached) await cacheSet(context.client, context.user.id, key, body.action, publicSiteUrl, result, 1440); results.push({ url: inspectionUrl, data: result, cached: Boolean(cached) }); } return { results, quotaUsed: usage.data, safetyBudget: 200 }; }));
    if (body.action === "sitemaps") return json(await withRun(context, body, publicSiteUrl, () => google(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`)));
    if (body.action === "submit_sitemap") return json(await withRun(context, body, publicSiteUrl, async () => { const sitemapUrl = approvedUrl(body.sitemapUrl || `${publicSiteUrl}/sitemap.xml`, publicSiteUrl); if (!sitemapUrl.endsWith("/sitemap.xml")) throw new Error("Only the approved production sitemap can be submitted."); await google(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodeURIComponent(sitemapUrl)}`, { method: "PUT" }); return { submitted: true, sitemapUrl, note: "Sitemap submission is a hint and does not guarantee indexing." }; }));
    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Integration request failed";
    const status = /Authentication|session/i.test(message) ? 401 : /role|required|outside|rejected|approved/i.test(message) ? 403 : 500;
    return json({ error: message }, status);
  }
});
