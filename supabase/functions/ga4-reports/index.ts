import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const roles = new Set(["super_admin", "admin", "seo_reviewer"]);
const propertyId = Deno.env.get("GA4_PROPERTY_ID") || "565406561";
const siteUrl = "https://am-safety-solutions-hub.vercel.app";
type ReportRow = { dimensionValues?: Array<{ value: string }>; metricValues?: Array<{ value: string }> };
type GoogleReport = { rows?: ReportRow[] };

function base64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function accessToken() {
  const raw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!raw) throw new Error("Google service account is not configured.");
  const account = JSON.parse(raw) as { client_email?: string; private_key?: string };
  if (!account.client_email || !account.private_key) throw new Error("Google service account JSON is incomplete.");
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = "https://oauth2.googleapis.com/token";
  const unsigned = `${base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64Url(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: tokenUri, iat: now, exp: now + 3600 }))}`;
  const pem = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), (letter) => letter.charCodeAt(0)), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)));
  const response = await fetch(tokenUri, { method: "POST", signal: AbortSignal.timeout(15000), headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64Url(signature)}` }) });
  if (!response.ok) throw new Error(`Google service account authentication failed (HTTP ${response.status}).`);
  const result = await response.json() as { access_token?: string };
  if (!result.access_token) throw new Error("Google did not return an access token.");
  return result.access_token;
}

async function googleReport(token: string, kind: "runReport" | "runRealtimeReport", request: Record<string, unknown>): Promise<GoogleReport> {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${kind}`, { method: "POST", signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(request) });
  if (!response.ok) {
    if (response.status === 403) throw new Error("Google Analytics access denied. Grant the service account Viewer access to this GA4 property and enable the Google Analytics Data API.");
    if (response.status === 404) throw new Error("GA4 property was not found. Check GA4_PROPERTY_ID in Supabase Edge Function secrets.");
    throw new Error(`Google Analytics Data API returned HTTP ${response.status}.`);
  }
  return await response.json() as GoogleReport;
}

const numberAt = (report: GoogleReport, index = 0) => Number(report.rows?.[0]?.metricValues?.[index]?.value || 0);
const breakdown = (report: GoogleReport) => (report.rows || []).map((row) => ({ name: row.dimensionValues?.[0]?.value || "Unknown", value: Number(row.metricValues?.[0]?.value || 0) }));
const range = (startDate: string) => [{ startDate, endDate: "today" }];

async function readAnalytics(token: string) {
  const [today, sevenDays, thirtyDays, realtime, whatsapp, pages, channels, countries, devices] = await Promise.all([
    googleReport(token, "runReport", { dateRanges: range("today"), metrics: [{ name: "sessions" }, { name: "screenPageViews" }] }),
    googleReport(token, "runReport", { dateRanges: range("6daysAgo"), metrics: [{ name: "activeUsers" }] }),
    googleReport(token, "runReport", { dateRanges: range("29daysAgo"), metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }, { name: "engagementRate" }] }),
    googleReport(token, "runRealtimeReport", { metrics: [{ name: "activeUsers" }] }),
    googleReport(token, "runReport", { dateRanges: range("29daysAgo"), dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "whatsapp_click" } } } }),
    googleReport(token, "runReport", { dateRanges: range("29daysAgo"), dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "10" }),
    googleReport(token, "runReport", { dateRanges: range("29daysAgo"), dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: "10" }),
    googleReport(token, "runReport", { dateRanges: range("29daysAgo"), dimensions: [{ name: "country" }], metrics: [{ name: "activeUsers" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: "10" }),
    googleReport(token, "runReport", { dateRanges: range("29daysAgo"), dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "activeUsers" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: "10" }),
  ]);
  return { connected: true, checkedAt: new Date().toISOString(), propertyId, summary: { sessionsToday: numberAt(today), pageViewsToday: numberAt(today, 1), activeUsers30m: numberAt(realtime), users7d: numberAt(sevenDays), users30d: numberAt(thirtyDays), pageViews30d: numberAt(thirtyDays, 1), engagementRate30d: numberAt(thirtyDays, 2), whatsappClicks30d: numberAt(whatsapp) }, topPages: breakdown(pages), channels: breakdown(channels), countries: breakdown(countries), devices: breakdown(devices) };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Authentication required" }, 401);
    const client = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_ANON_KEY") || "", { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return json({ error: "Invalid session" }, 401);
    const { data: profile } = await client.from("cms_admin_profiles").select("role").eq("user_id", user.id).maybeSingle();
    if (!profile || !roles.has(profile.role)) return json({ error: "Admin analytics access required" }, 403);
    const body = await request.json() as { action?: string; force?: boolean };
    if (body.action !== "report") return json({ error: "Unknown action" }, 400);
    if (!/^\d+$/.test(propertyId)) return json({ connected: false, reason: "Set the numeric GA4_PROPERTY_ID in Supabase Edge Function secrets." });
    if (!Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")) return json({ connected: false, reason: "Add GOOGLE_SERVICE_ACCOUNT_JSON to Supabase Edge Function secrets and grant that service account Viewer access to the GA4 property." });
    const cacheKey = `ga4:${propertyId}`;
    if (!body.force) {
      const { data: cached } = await client.from("seo_integration_cache").select("payload,expires_at").eq("cache_key", cacheKey).maybeSingle();
      if (cached && new Date(cached.expires_at).getTime() > Date.now()) return json(cached.payload);
    }
    const report = await readAnalytics(await accessToken());
    const saved = await client.from("seo_integration_cache").upsert({ cache_key: cacheKey, action: "ga4_report", site_url: siteUrl, payload: report, expires_at: new Date(Date.now() + 2 * 60_000).toISOString(), updated_by: user.id, updated_at: new Date().toISOString() });
    if (saved.error) console.error("GA4 cache write failed", saved.error.message);
    return json(report);
  } catch (error) {
    console.error("GA4 report failed", error);
    return json({ connected: false, error: error instanceof Error ? error.message : "GA4 report failed" }, 502);
  }
});
