import { useEffect } from "react";
import { buildCanonicalUrl, getPublicSiteUrl } from "@/lib/canonical";

function alignSchemaUrls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(alignSchemaUrls);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, alignSchemaUrls(child)]));
  if (typeof value === "string" && /^https?:\/\/(?:www\.)?ambs\.ae(?:\/|$)/i.test(value)) {
    const parsed = new URL(value);
    return `${getPublicSiteUrl()}${parsed.pathname}${parsed.search}${parsed.hash}`;
  }
  return value;
}

type SeoHeadProps = { title: string; description: string; path: string; schema?: Record<string, unknown> | Record<string, unknown>[]; image?: string; ogType?: "website" | "article" | "product"; noindex?: boolean; includeCanonical?: boolean };

function schemaHasType(schema: Record<string, unknown>[], type: string) {
  const visit = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.some(visit);
    if (!value || typeof value !== "object") return false;
    const record = value as Record<string, unknown>;
    const ownType = record["@type"];
    return ownType === type || (Array.isArray(ownType) && ownType.includes(type)) || visit(record["@graph"]);
  };
  return schema.some(visit);
}

export function SeoHead({ title, description, path, schema, image = "/assets/images/hero-poster.jpg", ogType = "website", noindex = false, includeCanonical = true }: SeoHeadProps) {
  useEffect(() => {
    const canonicalUrl = buildCanonicalUrl(path);
    const imageUrl = buildCanonicalUrl(image);
    const cleanTitle = title.replace(/\s*\|\s*AMBS\s*$/i, "").replace(/\s*\|\s*AM Building Solutions\s*$/i, "").trim();
    const brandedTitle = `${cleanTitle} | AM Building Solutions`;
    const compactTitle = brandedTitle.length <= 65 ? brandedTitle : cleanTitle;
    document.title = compactTitle.length <= 65 ? compactTitle : `${compactTitle.slice(0, 66).replace(/\s+\S*$/, "").trim()}`;
    const setMeta = (selector: string, attribute: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, selector.match(/"([^"]+)"/)?.[1] || "");
        document.head.appendChild(element);
      }
      element.content = content;
    };
    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[name="robots"]', "name", noindex ? "noindex, nofollow, noarchive" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", description);
    setMeta('meta[property="og:type"]', "property", ogType);
    setMeta('meta[property="og:site_name"]', "property", "AM Building Solutions");
    setMeta('meta[property="og:locale"]', "property", "en_AE");
    setMeta('meta[property="og:url"]', "property", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", imageUrl);
    setMeta('meta[property="og:image:alt"]', "property", "AM Building Solutions construction safety systems");
    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", title);
    setMeta('meta[name="twitter:description"]', "name", description);
    setMeta('meta[name="twitter:image"]', "name", imageUrl);
    setMeta('meta[name="twitter:image:alt"]', "name", "AM Building Solutions construction safety systems");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!includeCanonical) canonical?.remove();
    else {
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
      canonical.href = canonicalUrl;
    }
    document.querySelectorAll("script[data-ambs-schema]").forEach((node) => node.remove());
    {
      const supplied = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
      const schemas = noindex ? [] : [...supplied];
      if (!noindex && !schemaHasType(schemas, "WebPage")) schemas.unshift({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: canonicalUrl,
        isPartOf: { "@type": "WebSite", name: "AM Building Solutions", url: buildCanonicalUrl("/") },
        publisher: { "@type": "Organization", name: "AM Building Solutions DWC LLC", url: buildCanonicalUrl("/") },
      });
      if (!noindex && ogType === "article" && !schemaHasType(schemas, "Article") && !schemaHasType(schemas, "BlogPosting")) schemas.push({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        author: { "@type": "Organization", name: "AM Building Solutions Technical Content Team" },
        publisher: { "@type": "Organization", name: "AM Building Solutions DWC LLC", url: buildCanonicalUrl("/") },
      });
      const alignedSchemas = schemas.map((item) => alignSchemaUrls(item) as Record<string, unknown>);
      alignedSchemas.forEach((schemaItem) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.ambsSchema = "true";
      script.text = JSON.stringify(schemaItem);
      document.head.appendChild(script);
      });
    }
  }, [title, description, path, image, schema, ogType, noindex, includeCanonical]);
  return null;
}
