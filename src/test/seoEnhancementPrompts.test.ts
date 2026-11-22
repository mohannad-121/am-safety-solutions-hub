import { describe, expect, it } from "vitest";
import { allEnhancementPrompts, enhancementPrompt, type EnhancementDraft } from "@/lib/seoEnhancementPrompts";

const draft: EnhancementDraft = {
  id: "draft-1",
  pageUrl: "https://am-safety-solutions-hub.vercel.app/products/safety-nets",
  competitorUrl: "https://competitor.example/safety-nets",
  priority: "warning",
  title: "Explain safety net types",
  heading: "Types of Construction Safety Nets",
  paragraph: "Horizontal nets and vertical nets serve different project needs.",
  placement: "After the introduction",
  reason: "The current page lists applications separately.",
};

describe("SEO implementation prompts", () => {
  it("includes the change, evidence and verification instructions", () => {
    const prompt = enhancementPrompt(draft);
    expect(prompt).toContain(draft.pageUrl);
    expect(prompt).toContain(draft.competitorUrl);
    expect(prompt).toContain(draft.heading);
    expect(prompt).toContain(draft.paragraph);
    expect(prompt).toContain(draft.placement);
    expect(prompt).toContain("If a claim cannot be verified");
  });

  it("combines multiple enhancements in order", () => {
    const prompts = allEnhancementPrompts([draft, { ...draft, id: "draft-2", title: "Improve product grouping" }]);
    expect(prompts).toContain("SEO improvement 1 of 2");
    expect(prompts).toContain("SEO improvement 2 of 2");
    expect(prompts.indexOf("Explain safety net types")).toBeLessThan(prompts.indexOf("Improve product grouping"));
  });
});
