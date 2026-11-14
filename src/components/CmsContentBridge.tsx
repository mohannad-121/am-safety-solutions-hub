import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCmsContent } from "@/hooks/use-cms";

function normalizeSlug(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

export function CmsContentBridge() {
  const records = useCmsContent();
  const location = useLocation();

  useEffect(() => {
    const slug = normalizeSlug(location.pathname);
    const record = records.find(item => item.status === "published" && normalizeSlug(item.slug) === slug);
    if (!record) return;
    const heading = document.querySelector<HTMLElement>("main h1");
    if (!heading) return;
    if (!heading.dataset.cmsOriginal) heading.dataset.cmsOriginal = heading.textContent || "";
    heading.dataset.cmsContentKey = record.contentKey;
    heading.textContent = record.title || heading.dataset.cmsOriginal;

    const summary = typeof record.publishedData.summary === "string" ? record.publishedData.summary.trim() : "";
    const paragraphs = Array.from(heading.parentElement?.querySelectorAll<HTMLElement>("p") || []);
    const lead = paragraphs.find(element => Boolean(heading.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) && !element.classList.contains("eyebrow"));
    if (lead && summary) {
      if (!lead.dataset.cmsOriginal) lead.dataset.cmsOriginal = lead.textContent || "";
      lead.dataset.cmsContentKey = record.contentKey;
      lead.textContent = summary;
    }

    return () => {
      if (heading.dataset.cmsOriginal) heading.textContent = heading.dataset.cmsOriginal;
      if (lead?.dataset.cmsOriginal) lead.textContent = lead.dataset.cmsOriginal;
    };
  }, [location.pathname, records]);

  return null;
}
