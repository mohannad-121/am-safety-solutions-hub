const DEFAULT_SITE_URL = "https://www.ambs.ae";

const TRACKING_PARAMETERS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "session",
  "sessionid",
  "sid",
]);

export type CanonicalOptions = {
  siteUrl?: string;
  allowedQueryParameters?: string[];
  preservePageParameter?: boolean;
};

function configuredSiteUrl() {
  return (import.meta.env.VITE_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim();
}

export function getPublicSiteUrl(siteUrl = configuredSiteUrl()) {
  const candidate = /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`;
  const url = new URL(candidate);
  url.protocol = "https:";
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function isProductionSiteUrlValid(siteUrl = configuredSiteUrl()) {
  try {
    const url = new URL(getPublicSiteUrl(siteUrl));
    return url.protocol === "https:" && !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function normalizePublicPath(pathname: string) {
  const decoded = decodeURI(pathname || "/");
  const withLeadingSlash = decoded.startsWith("/") ? decoded : `/${decoded}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/").toLowerCase();
  return collapsed === "/" ? "/" : collapsed.replace(/\/+$/, "");
}

export function buildCanonicalUrl(pathOrUrl: string, options: CanonicalOptions = {}) {
  const siteUrl = getPublicSiteUrl(options.siteUrl);
  const input = new URL(pathOrUrl || "/", siteUrl);
  const canonical = new URL(normalizePublicPath(input.pathname), siteUrl);
  const allowed = new Set(options.allowedQueryParameters || []);
  if (options.preservePageParameter) allowed.add("page");
  input.searchParams.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (!TRACKING_PARAMETERS.has(normalizedKey) && allowed.has(normalizedKey)) {
      canonical.searchParams.set(normalizedKey, value);
    }
  });
  return canonical.toString();
}

export function isPrivateOrNonIndexablePath(pathname: string) {
  const path = normalizePublicPath(pathname);
  return path.startsWith("/admin") || path.startsWith("/api") || path === "/login";
}

export function canonicalIssueList(value: string, expectedPath?: string) {
  const issues: string[] = [];
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return ["Canonical must be an absolute URL."];
  }
  const master = new URL(getPublicSiteUrl());
  if (url.protocol !== "https:") issues.push("Canonical must use HTTPS.");
  if (url.host !== master.host) issues.push(`Canonical must use ${master.host}.`);
  if (url.pathname !== url.pathname.toLowerCase()) issues.push("Canonical path must be lowercase.");
  if (url.pathname !== "/" && url.pathname.endsWith("/")) issues.push("Canonical must not have a trailing slash.");
  if ([...url.searchParams.keys()].some((key) => TRACKING_PARAMETERS.has(key.toLowerCase()))) {
    issues.push("Canonical must not contain tracking parameters.");
  }
  if (isPrivateOrNonIndexablePath(url.pathname)) issues.push("Canonical cannot target an admin or private route.");
  if (expectedPath && value !== buildCanonicalUrl(expectedPath)) issues.push("Canonical differs from the approved public URL.");
  return issues;
}
