import { articles, products } from "@/data/ambs";

export type SiteSearchItem = {
  title: string;
  path: string;
  text: string;
  label: "Page" | "Product" | "Article";
};

const corePages: SiteSearchItem[] = [
  { title: "About AM Building Solutions", path: "/about", text: "company engineering safety standards UAE GCC", label: "Page" },
  { title: "Projects & Applications", path: "/projects", text: "high-rise facade demolition infrastructure industrial temporary works", label: "Page" },
  { title: "Engineering Solutions", path: "/engineering-solutions", text: "technical submittals drawings calculations method statements inspections", label: "Page" },
  { title: "Edge Protection Types", path: "/edge-protection-systems/types-of-edge-protection-systems", text: "slab concrete steel stair formwork roof guardrail comparison EN 13374", label: "Page" },
  { title: "High-Risk Products", path: "/high-risk-products", text: "crash decking shaft gates hoist gates safety net fans", label: "Page" },
  { title: "Steel Fabrication & Customization", path: "/steel-fabrication", text: "custom steel fabrication lifting beams brackets frames", label: "Page" },
  { title: "Training Center", path: "/edge-protection-training", text: "safety net edge protection installation inspection training Dubai", label: "Page" },
  { title: "BS EN 13374:2025 Edge Protection Guide", path: "/standards/en-13374-edge-protection", text: "class A B C edge protection standard consultant approval", label: "Page" },
  { title: "Technical Download Center", path: "/edge-protection-downloads", text: "data sheets checklists method statements risk assessments", label: "Page" },
  { title: "Frequently Asked Questions", path: "/faq", text: "safety nets edge protection training drawings quotations", label: "Page" },
  { title: "Contact AMBS", path: "/contact", text: "contact quote send drawings WhatsApp Dubai UAE", label: "Page" },
];

export const siteSearchIndex: SiteSearchItem[] = [
  ...corePages,
  ...products.map((item): SiteSearchItem => ({ title: item.name, path: `/${item.slug}`, text: `${item.summary} ${item.standard} ${item.alt}`, label: "Product" })),
  ...articles.map((item): SiteSearchItem => ({ title: item.title, path: `/articles/${item.slug}`, text: `${item.category} ${item.summary}`, label: "Article" })),
];

const aliases: Record<string, string> = {
  saftey: "safety",
  nett: "net",
  nets: "net",
  protction: "protection",
  protecton: "protection",
  debries: "debris",
  gaurdrail: "guardrail",
  meshgaurd: "meshguard",
  qoute: "quote",
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function distance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, (_, row) => Array<number>(b.length + 1).fill(0));
  for (let row = 0; row <= a.length; row += 1) matrix[row][0] = row;
  for (let column = 0; column <= b.length; column += 1) matrix[0][column] = column;
  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
    }
  }
  return matrix[a.length][b.length];
}

function tokenScore(queryToken: string, candidateTokens: string[]) {
  const corrected = aliases[queryToken] ?? queryToken;
  let best = 0;
  for (const candidate of candidateTokens) {
    if (candidate === corrected) return 1;
    if (candidate.includes(corrected) || corrected.includes(candidate)) best = Math.max(best, 0.82);
    const allowed = corrected.length <= 4 ? 1 : Math.max(1, Math.floor(corrected.length * 0.3));
    const editDistance = distance(corrected, candidate);
    if (editDistance <= allowed) best = Math.max(best, 0.72 - editDistance * 0.08);
  }
  return best;
}

export function searchSite(query: string, limit = 12) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return siteSearchIndex.slice(0, limit);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  return siteSearchIndex
    .map((item) => {
      const haystack = normalize(`${item.title} ${item.text}`);
      const candidateTokens = haystack.split(" ");
      const scores = queryTokens.map((token) => tokenScore(token, candidateTokens));
      const matched = scores.filter((score) => score >= 0.55).length;
      const phraseBoost = haystack.includes(queryTokens.map((token) => aliases[token] ?? token).join(" ")) ? 1 : 0;
      return { item, score: matched / queryTokens.length + phraseBoost * 0.35 + (item.label === "Product" ? 0.03 : 0) };
    })
    .filter(({ score }) => score >= 0.55)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map(({ item }) => item);
}
