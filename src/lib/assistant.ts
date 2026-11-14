import { searchSite, type SiteSearchItem } from "@/lib/siteSearch";

export type AssistantReply = {
  text: string;
  links: Pick<SiteSearchItem, "title" | "path" | "label">[];
};

function linksFor(query: string, count = 3) {
  return searchSite(query, count).map(({ title, path, label }) => ({ title, path, label }));
}

export function answerCustomer(query: string): AssistantReply {
  const value = query.toLowerCase().trim();
  if (!value) return { text: "Tell me about the project, hazard, structure or product you are reviewing.", links: [] };

  if (/^(hi|hello|hey|good morning|good afternoon|how are you)\b/.test(value)) {
    return { text: "Hello. I am ready to help with AM Building Solutions products and construction-safety planning. What are you working on today?", links: linksFor("products safety") };
  }
  if (/quote|price|cost|quotation|qoute|buy|availability/.test(value)) {
    return { text: "For an accurate quotation, send the product or hazard, approximate quantities, project location, required date, drawings and site photos. The AMBS team can then review the technical and commercial scope.", links: [{ title: "Request a Quotation", path: "/quote", label: "Page" }, { title: "Contact AMBS", path: "/contact", label: "Page" }] };
  }
  if (/en\s*13374|class\s*[abc]|edge standard/.test(value)) {
    return { text: "EN 13374 covers temporary edge-protection product requirements and test methods. Class selection depends on slope and dynamic risk, while project acceptance must also confirm the actual posts, panels, fixings, spacing, substrate and installation.", links: linksFor("EN 13374 edge protection types") };
  }
  if (/en\s*1263|safety net standard/.test(value)) {
    return { text: "EN 1263 is the key reference for safety nets and their installation. Selection should consider the hazard, net system, fall clearance, support arrangement, mesh and border rope, inspection status and project-specific installation method.", links: linksFor("EN 1263 safety net") };
  }
  if (/slab|balcony|open edge|perimeter|formwork|stair|roof|steel beam|i-beam|guardrail|edge prot/.test(value)) {
    return { text: "A collective edge-protection system is normally the first option for an exposed edge. The correct fixing depends on whether the support is concrete, steel, formwork, a stair, parapet or roof. Final selection must be checked against the structure and approved work sequence.", links: linksFor("edge protection types slab steel") };
  }
  if (/net|debris|facade|fall arrest|catch|fan/.test(value)) {
    return { text: "Start with the hazard: horizontal nets can arrest a fall below a work area; vertical nets support facade or debris containment; fan systems project from a building perimeter; and debris mesh controls smaller material. Clearance, anchorage and inspection requirements decide the final arrangement.", links: linksFor(`${value} safety net`) };
  }
  if (/shaft|hoist|opening|gate/.test(value)) {
    return { text: "Shaft and hoist openings need controlled access, robust fixing, suitable infill, a positive-closing gate where access is required, and documented inspections. Share the opening dimensions and access method for a project review.", links: linksFor("shaft hoist gate opening") };
  }
  if (/loading platform|material platform|lifting beam|crane|fabricat|custom steel/.test(value)) {
    return { text: "Loading platforms, lifting beams and custom temporary-works steel require project-specific geometry, loads, interfaces, drawings and engineering review. Send the intended use, dimensions, load information and supporting structure.", links: linksFor("loading platform lifting steel fabrication") };
  }
  if (/training|inspection|checklist|method statement|submittal|drawing/.test(value)) {
    return { text: "AMBS can discuss installation and inspection awareness, technical submittals, drawings, method statements and checklists. Tell me the system and the documents your consultant or HSE team requires.", links: linksFor(value) };
  }

  const results = linksFor(value);
  if (results.length) return { text: "I found related AMBS pages below. Open the closest result, or tell me the structure, hazard and project stage for a more specific recommendation.", links: results };
  return { text: "This assistant focuses on AM Building Solutions products and construction safety. Ask about safety nets, edge protection, gates, loading platforms, fabrication, inspections, training or technical documents.", links: [{ title: "Explore Products", path: "/products", label: "Page" }, { title: "Contact the Technical Team", path: "/contact", label: "Page" }] };
}
