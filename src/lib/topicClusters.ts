export type TopicCluster = {
  id: string;
  label: string;
  pillar: { label: string; path: string };
  supporting: Array<{ label: string; path: string }>;
  products: Array<{ label: string; path: string }>;
  resources: Array<{ label: string; path: string }>;
};

export const topicClusters: TopicCluster[] = [
  {
    id: "safety-nets",
    label: "Safety net systems",
    pillar: { label: "Safety net systems for UAE projects", path: "/safety-net-uae" },
    supporting: [
      { label: "Safety catch net selection guidance", path: "/safety-catch-net-dubai" },
      { label: "Vertical safety net applications", path: "/vertical-safety-net" },
      { label: "EN 1263 safety net guidance", path: "/what-is-en-1263-safety-net" },
    ],
    products: [{ label: "View AMBS safety net products", path: "/products/safety-nets" }],
    resources: [{ label: "Read the safety net RAMS guide", path: "/resources/safety-net-risk-assessment-method-statement" }],
  },
  {
    id: "edge-protection",
    label: "Temporary edge protection",
    pillar: { label: "Temporary edge protection systems", path: "/edge-protection-systems-uae" },
    supporting: [
      { label: "Temporary edge protection in Dubai", path: "/temporary-edge-protection-dubai" },
      { label: "Compare edge protection system types", path: "/edge-protection-systems/types-of-edge-protection-systems" },
      { label: "BS EN 13374:2025 guidance", path: "/standards/en-13374-edge-protection" },
    ],
    products: [{ label: "View mesh barrier edge protection products", path: "/mesh-barrier-edge-protection" }],
    resources: [{ label: "Read the edge protection RAMS guide", path: "/resources/edge-protection-risk-assessment-method-statement" }],
  },
  {
    id: "loading-platforms",
    label: "Loading platforms",
    pillar: { label: "Loading platforms for UAE construction", path: "/loading-platforms-uae" },
    supporting: [
      { label: "Loading platform product options", path: "/products/loading-platforms" },
      { label: "Loading platform RAMS guidance", path: "/resources/loading-platform-risk-assessment-method-statement" },
    ],
    products: [{ label: "Compare loading platform systems", path: "/products/loading-platforms" }],
    resources: [{ label: "Request loading platform documentation", path: "/edge-protection-downloads" }],
  },
  {
    id: "temporary-works",
    label: "Temporary works safety",
    pillar: { label: "Temporary works safety solutions", path: "/temporary-works-safety-solutions-uae" },
    supporting: [
      { label: "Engineering and submittal support", path: "/engineering-solutions" },
      { label: "Work at height safety guidance", path: "/work-at-height-safety-uae" },
      { label: "RAMS resource hub", path: "/resources/risk-assessment-method-statement" },
    ],
    products: [{ label: "Explore temporary works products", path: "/products" }],
    resources: [{ label: "Browse the technical library", path: "/resources/technical-library" }],
  },
  {
    id: "custom-fabrication",
    label: "Custom steel fabrication",
    pillar: { label: "Custom steel fabrication support", path: "/steel-fabrication" },
    supporting: [
      { label: "Custom brackets for temporary works", path: "/resources/custom-brackets-temporary-works" },
      { label: "Welded frames for temporary works", path: "/resources/welded-frames-temporary-works" },
      { label: "Project application examples", path: "/projects" },
    ],
    products: [{ label: "View lifting and crane bearing beams", path: "/products/lifting-beams" }],
    resources: [{ label: "Review ISO 3834 welding quality guidance", path: "/resources/iso-3834-welding-quality" }],
  },
];

export function clusterForPath(pathname: string) {
  return topicClusters.find((cluster) => [cluster.pillar, ...cluster.supporting, ...cluster.products, ...cluster.resources].some((link) => link.path === pathname));
}
