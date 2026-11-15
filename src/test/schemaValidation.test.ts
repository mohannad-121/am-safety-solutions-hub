import { describe, expect, it } from "vitest";
import { createArticleDraft, createWebPageDraft, validateSchemaDraft } from "@/lib/schemaValidation";

describe("schema draft safety", () => {
  it("creates a valid WebPage draft aligned to canonical", () => {
    const draft = createWebPageDraft("/About/?utm_source=test", "About", "About AMBS");
    expect(validateSchemaDraft(draft)).toEqual({ valid: true, errors: [] });
    expect(draft.url).toBe("https://www.ambs.ae/about");
  });
  it("creates Article schema without inventing dates or people", () => {
    const draft = createArticleDraft("/articles/example", "Example", "Description");
    expect(validateSchemaDraft(draft).valid).toBe(true);
    expect(draft).not.toHaveProperty("datePublished");
    expect(draft.author).toEqual({ "@type": "Organization", name: "AM Building Solutions DWC LLC" });
  });
  it("blocks unverified ratings and prices", () => {
    const result = validateSchemaDraft({ "@context": "https://schema.org", "@type": "Product", ratingValue: 5, price: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/verified commercial source data/);
  });
  it("blocks duplicate high-level schema drafts", () => {
    const draft = createWebPageDraft("/about", "About", "About AMBS");
    expect(validateSchemaDraft(draft, ["Organization", "WebPage"]).errors.join(" ")).toMatch(/already exists/);
  });
  it("uses real optional dates and breadcrumb values without inventing them", () => {
    const draft = createArticleDraft("/articles/example", "Fallback", "Fallback", { url: "https://www.ambs.ae/articles/example", title: "Real title", description: "Real description", author: "Editorial Team", datePublished: "2026-11-01", breadcrumbs: [{ name: "Articles", url: "/articles" }] });
    expect(draft).toMatchObject({ headline: "Real title", description: "Real description", datePublished: "2026-11-01", author: { name: "Editorial Team" } });
    expect(draft).not.toHaveProperty("dateModified");
    expect(draft).toHaveProperty("breadcrumb");
  });
});
