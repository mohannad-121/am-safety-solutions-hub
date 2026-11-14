import { useEffect } from "react";

type SeoHeadProps = { title: string; description: string; path: string; schema?: Record<string, unknown> | Record<string, unknown>[]; image?: string; ogType?: "website" | "article" | "product" };

export function SeoHead({ title, description, path, schema, image = "/assets/images/hero-poster.jpg", ogType = "website" }: SeoHeadProps) {
  useEffect(() => {
    document.title = title.includes("AM Building Solutions") ? title : `${title} | AM Building Solutions`;
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
    setMeta('meta[name="robots"]', "name", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", description);
    setMeta('meta[property="og:type"]', "property", ogType);
    setMeta('meta[property="og:site_name"]', "property", "AM Building Solutions");
    setMeta('meta[property="og:locale"]', "property", "en_AE");
    setMeta('meta[property="og:url"]', "property", `https://www.ambs.ae${path}`);
    setMeta('meta[property="og:image"]', "property", `https://www.ambs.ae${image}`);
    setMeta('meta[property="og:image:alt"]', "property", "AM Building Solutions construction safety systems");
    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", title);
    setMeta('meta[name="twitter:description"]', "name", description);
    setMeta('meta[name="twitter:image"]', "name", `https://www.ambs.ae${image}`);
    setMeta('meta[name="twitter:image:alt"]', "name", "AM Building Solutions construction safety systems");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `https://www.ambs.ae${path}`;
    document.querySelectorAll("script[data-ambs-schema]").forEach((node) => node.remove());
    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach((schemaItem) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.ambsSchema = "true";
      script.text = JSON.stringify(schemaItem);
      document.head.appendChild(script);
      });
    }
  }, [title, description, path, image, schema, ogType]);
  return null;
}
