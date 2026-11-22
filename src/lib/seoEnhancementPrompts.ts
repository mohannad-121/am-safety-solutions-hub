export type EnhancementDraft = {
  id: string;
  pageUrl: string;
  priority: string;
  title: string;
  heading: string;
  paragraph: string;
  placement: string;
  reason: string;
  competitorUrl: string;
};

export function enhancementPrompt(draft: EnhancementDraft) {
  return `Please implement this SEO improvement on my AM Building Solutions website.

Our page: ${draft.pageUrl}
Competitor page used for comparison: ${draft.competitorUrl}
Goal: ${draft.title}
Why this may help: ${draft.reason}
Suggested placement: ${draft.placement}

Proposed heading: ${draft.heading}
Proposed copy (a starting draft, not approved fact):
${draft.paragraph}

Inspect the current page and its source code first. Check that the improvement is still needed and that every technical or company claim is supported by our existing content or reliable source material. Adapt the wording to fit the page, avoid copying the competitor, and preserve the current design and unrelated content. Implement the improvement in the website source, verify the built page and SEO metadata, then push the change and confirm the live deployment. If a claim cannot be verified, omit it and explain what evidence is needed.`;
}

export function allEnhancementPrompts(drafts: EnhancementDraft[]) {
  return drafts.map((draft, index) => `SEO improvement ${index + 1} of ${drafts.length}\n\n${enhancementPrompt(draft)}`).join("\n\n---\n\n");
}
