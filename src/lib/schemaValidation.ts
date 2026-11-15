import { buildCanonicalUrl, getPublicSiteUrl } from "@/lib/canonical";

export type SchemaValidation = { valid: boolean; errors: string[] };
export type PageSchemaContext = {
  url: string;
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  existingTypes?: string[];
};

function visit(value: unknown, errors: string[], key = "root") {
  if (Array.isArray(value)) return value.forEach((item, index) => visit(item, errors, `${key}[${index}]`));
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  for (const [childKey, childValue] of Object.entries(record)) {
    if (["url", "image", "item", "mainEntityOfPage"].includes(childKey) && typeof childValue === "string") {
      try {
        const url = new URL(childValue);
        if (!/^https:$/.test(url.protocol)) errors.push(`${key}.${childKey} must use HTTPS.`);
      } catch {
        errors.push(`${key}.${childKey} must be an absolute URL.`);
      }
    }
    if (["ratingValue", "reviewCount", "price", "offers"].includes(childKey)) {
      errors.push(`${key}.${childKey} requires verified commercial source data and cannot be AI-generated.`);
    }
    visit(childValue, errors, `${key}.${childKey}`);
  }
}

export function validateSchemaDraft(schema: unknown, existingTypes: string[] = []): SchemaValidation {
  const errors: string[] = [];
  if (!schema || typeof schema !== "object") errors.push("Schema must be a JSON object.");
  const record = schema as Record<string, unknown>;
  if (record?.["@context"] !== "https://schema.org") errors.push("@context must be https://schema.org.");
  if (!record?.["@type"] && !record?.["@graph"]) errors.push("Schema requires @type or @graph.");
  const type = typeof record?.["@type"] === "string" ? record["@type"] : "";
  if (type && existingTypes.includes(type) && ["WebPage", "Article", "BlogPosting", "Organization"].includes(type)) {
    errors.push(`${type} schema already exists on this page; a duplicate draft was blocked.`);
  }
  visit(schema, errors);
  return { valid: errors.length === 0, errors };
}

function breadcrumbSchema(items: PageSchemaContext["breadcrumbs"]) {
  if (!items?.length) return undefined;
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.url),
    })),
  };
}

export function createWebPageDraft(pageUrl: string, title: string, description: string, context: Partial<PageSchemaContext> = {}) {
  const url = buildCanonicalUrl(context.url || pageUrl);
  const draft: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: context.title || title,
    description: context.description || description,
    url,
    isPartOf: { "@type": "WebSite", name: "AM Building Solutions", url: `${getPublicSiteUrl()}/` },
  };
  const breadcrumb = breadcrumbSchema(context.breadcrumbs);
  if (breadcrumb) draft.breadcrumb = breadcrumb;
  return draft;
}

export function createArticleDraft(pageUrl: string, title: string, description: string, context: Partial<PageSchemaContext> = {}) {
  const draft: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: context.title || title,
    description: context.description || description,
    mainEntityOfPage: buildCanonicalUrl(context.url || pageUrl),
    author: { "@type": context.author ? "Person" : "Organization", name: context.author || "AM Building Solutions DWC LLC" },
    publisher: { "@type": "Organization", name: "AM Building Solutions DWC LLC", url: `${getPublicSiteUrl()}/` },
  };
  if (context.datePublished) draft.datePublished = context.datePublished;
  if (context.dateModified) draft.dateModified = context.dateModified;
  const breadcrumb = breadcrumbSchema(context.breadcrumbs);
  if (breadcrumb) draft.breadcrumb = breadcrumb;
  return draft;
}
