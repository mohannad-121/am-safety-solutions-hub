import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SeoHead } from "@/components/SeoHead";
import { TechnicalReviewBlock } from "@/components/TechnicalReviewBlock";
import { getPublicSiteUrl } from "@/lib/canonical";

type Faq = readonly [string, string];
type LinkItem = readonly [string, string];
type PageConfig = {
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  image: string;
  shortAnswer: string;
  standard: string;
  insights: readonly (readonly [string, string])[];
  checks: readonly string[];
  workflow: readonly string[];
  faqs: readonly Faq[];
  related: readonly LinkItem[];
  article?: boolean;
};

const pages: Record<string, PageConfig> = {
  "/safety-net-uae": {
    metaTitle: "Safety Net UAE & Dubai | EN 1263 Safety Nets | AMBS",
    title: "Safety Nets for UAE Construction Projects",
    description: "AMBS supplies safety nets, safety catch nets, vertical netting, debris containment and EN 1263 safety net support for construction projects across Dubai and the UAE.",
    eyebrow: "Safety net UAE",
    image: "/assets/images/safety-net-systems.jpg",
    standard: "EN 1263 reference",
    shortAnswer: "AM Building Solutions supplies safety nets, catch nets, vertical safety netting and debris containment for UAE construction. The correct arrangement depends on fall height, catching width, anchorage, clearance, facade exposure, debris risk and the approved inspection and rescue plan.",
    insights: [["Start with the fall path", "Net selection should begin with the work level, likely fall trajectory, available clearance and rescue access rather than elevation length alone."], ["Separate fall arrest from debris control", "A safety net intended to arrest a person requires different evidence and planning from fine debris containment."], ["Review the complete system", "Border ropes, coupling, supports, ties, anchor spacing and interfaces with the structure must be checked together."], ["Plan relocation and inspection", "Floor-cycle changes, impact, high wind and alteration require defined inspection and handover controls."]],
    checks: ["Intended use and net system", "Fall height, catching width and clearance", "EN 1263 labels and product evidence", "Anchorage and border-rope condition", "Inspection, rescue and exclusion-zone plan"],
    workflow: ["Share drawings, levels and work sequence.", "Identify fall and falling-object hazards.", "Review system type, anchorage and clearances.", "Prepare project-specific documents and installation plan.", "Inspect, hand over and record changes during use."],
    faqs: [["Who supplies safety nets in the UAE?", "AM Building Solutions supports UAE contractors with safety nets, safety catch nets, vertical netting, debris containment and project-specific technical coordination."], ["What is EN 1263?", "EN 1263 is a European reference covering safety-net product requirements and installation principles. The actual site arrangement still requires project-specific review."], ["Is a debris net the same as a safety net?", "No. Debris netting is selected for material containment, while a fall-arrest safety net is selected and documented for a person's fall risk."], ["What information is needed for a quotation?", "Send drawings, work levels, approximate dimensions, fall height, access constraints, programme, project location and consultant requirements."], ["When should safety nets be inspected?", "Inspect before use, after installation or relocation, after impact, after severe weather and at the frequency in the approved project procedure."]],
    related: [["Safety Catch Nets Dubai", "/safety-catch-net-dubai"], ["Vertical Safety Netting", "/vertical-safety-net"], ["EN 1263 Guide", "/what-is-en-1263-safety-net"], ["Safety Net RAMS", "/resources/safety-net-risk-assessment-method-statement"]],
  },
  "/safety-catch-net-dubai": {
    metaTitle: "Safety Catch Net Dubai | Fall Arrest & Net Fan Systems | AMBS",
    title: "Safety Catch Nets and Net Fan Systems for Dubai Construction",
    description: "Safety catch nets, safety net fans and EN 1263 fall-arrest support for high-rise, facade and temporary works applications in Dubai and the UAE.",
    eyebrow: "Safety catch net Dubai",
    image: "/assets/images/safety-net-systems.jpg",
    standard: "EN 1263 reference",
    shortAnswer: "A safety catch net is a load-tested collective protection system positioned to arrest a fall or contain heavier falling objects. AMBS reviews catching width, projection, fall height, fixing points, overlaps, clearance, debris layers and rescue access before proposing a Dubai project arrangement.",
    insights: [["Catch nets are not debris nets", "Confirm whether the primary duty is person fall arrest, heavy falling-object protection, fine debris containment or a layered combination."], ["Projection depends on the fall", "The forward movement of a falling person and the vertical fall distance influence the necessary catching zone."], ["Interfaces need drawings", "Facade brackets, slab edges, cranes, mast climbers and access routes can all affect the system layout."], ["Impact changes status", "Any impacted system must be isolated and inspected before being returned to service."]],
    checks: ["Fall arrest or debris-only purpose", "Projection and catching width", "Support frame and fixing interface", "Net overlap and border-rope connections", "Rescue, impact and inspection controls"],
    workflow: ["Survey the elevation and active work zones.", "Confirm system duty and available projection.", "Review supports, anchor details and lifting access.", "Coordinate installation, exclusion zones and handover.", "Inspect after impact, relocation and severe weather."],
    faqs: [["What is a safety catch net?", "It is a collective net system used below or outside work areas to arrest falls or reduce falling-object exposure."], ["Can a debris net catch a person?", "A debris-only net must not be assumed suitable for a person's fall. Product evidence and the complete installed arrangement must support the intended duty."], ["Where are catch nets used?", "Common applications include high-rise slabs, facade work, formwork, demolition interfaces and public-facing elevations."], ["Does AMBS provide installation documentation?", "Project support can include drawings, method inputs, inspection checklists and technical submittal information according to the agreed scope."], ["What should happen after an impact?", "Stop work in the affected area, isolate the system and arrange competent inspection before reuse."]],
    related: [["Safety Nets UAE", "/safety-net-uae"], ["Safety Net Systems", "/products/safety-nets"], ["EN 1263 Guide", "/what-is-en-1263-safety-net"], ["Request a Quote", "/quote"]],
  },
  "/temporary-edge-protection-dubai": {
    metaTitle: "Temporary Edge Protection Dubai | EN 13374 Systems | AMBS",
    title: "Temporary Edge Protection Systems for Dubai Construction",
    description: "EN 13374 temporary edge protection, mesh barriers, guardrails, posts, clamps and toe boards for slab edges, stairs, roofs and openings in Dubai.",
    eyebrow: "Temporary edge protection Dubai",
    image: "/assets/images/edge-protection-systems.jpg",
    standard: "EN 13374 reference",
    shortAnswer: "Temporary edge protection is a collective fall-prevention system for open slabs, stairs, roofs and openings. AMBS reviews the substrate, fixing method, EN 13374 class, post spacing, edge geometry, trade access and permit-to-remove controls before proposing a Dubai site arrangement.",
    insights: [["The substrate controls the fixing", "Concrete strength, slab geometry, steel sections, parapets and formwork interfaces determine which fixing options are practical."], ["Continuity matters", "Corners, stairs, loading zones and facade interfaces are common locations for unsafe gaps."], ["Removal needs authorization", "The method should define who can remove protection, what alternative control applies and how reinstatement is checked."], ["Test evidence has limits", "Evidence should match the components, spacing and fixing configuration used on site."]],
    checks: ["EN 13374 class and evidence", "Supporting structure and fixing method", "Posts, barriers, rails and toe boards", "Corners, openings and access interfaces", "Removal permit and reinstatement inspection"],
    workflow: ["Survey every edge and opening.", "Select the compatible fixing and system class.", "Coordinate installation before exposure begins.", "Inspect and release the protected area.", "Control alteration, removal and reinstatement."],
    faqs: [["What is temporary edge protection?", "It is a temporary collective barrier that helps prevent people and materials from falling at construction edges."], ["What does EN 13374 cover?", "EN 13374 defines product and test requirements for temporary edge protection systems and their classes."], ["Can edge protection be installed without drilling?", "Clamp, parapet or compression-post arrangements may avoid drilling where the structure and approved system allow it."], ["Can workers remove a barrier temporarily?", "Only through an approved process with alternative protection, responsible-person authorization and a reinstatement inspection."], ["What documents should be submitted?", "Typical documents include product data, layout and fixing drawings, test evidence, method statement, risk assessment, ITP and inspection records."]],
    related: [["Edge Protection Systems UAE", "/edge-protection-systems-uae"], ["EN 13374 Guide", "/what-is-en-13374-edge-protection"], ["Inspection Guidance", "/edge-protection-inspection"], ["Edge Protection RAMS", "/resources/edge-protection-risk-assessment-method-statement"]],
  },
  "/vertical-safety-net": {
    metaTitle: "Vertical Safety Net UAE | Facade Netting & Debris Control | AMBS",
    title: "Vertical Safety Netting for Facade and Debris Control",
    description: "Vertical safety netting, facade netting and debris containment support for high-rise, scaffold and public-interface construction zones across the UAE.",
    eyebrow: "Vertical safety net UAE",
    image: "/assets/images/project-support.jpg",
    standard: "Project-specific review",
    shortAnswer: "Vertical safety netting is installed at facades, scaffolds and open perimeters to reduce debris and falling-object exposure. Selection depends on the intended duty, debris size, wind exposure, support arrangement, tie spacing, overlaps, access openings and interfaces with mast climbers or edge protection.",
    insights: [["Define the duty first", "Vertical debris containment and person fall arrest are different duties and should not be confused."], ["Wind creates system loads", "Net permeability, facade exposure and accumulated material influence the support and inspection plan."], ["Moving equipment creates interfaces", "Mast climbers, cradles and scaffold alterations need coordinated openings and reinstatement controls."], ["Relocation needs handover", "Each floor-to-floor move should include condition, fixing and overlap checks."]],
    checks: ["Containment or fall-arrest intent", "Net material, mesh and permeability", "Ties, cables, overlaps and corners", "Wind and debris accumulation", "Scaffold, facade and access interfaces"],
    workflow: ["Survey facade and public-interface risks.", "Select net type and support arrangement.", "Coordinate access equipment and edge protection.", "Install, tension and inspect all terminations.", "Reinspect after wind, impact or relocation."],
    faqs: [["What is vertical safety netting?", "It is netting installed on facades, scaffolds or perimeters to help contain debris and reduce falling-object exposure."], ["Is vertical netting a safety catch net?", "Not necessarily. A vertical debris net and a load-tested fall-arrest net have different intended duties."], ["Where is it commonly used?", "High-rise facade work, scaffold elevations, mast-climber zones, demolition interfaces and public-facing perimeters."], ["When should it be inspected?", "Before use, after installation or relocation, after high wind or impact and whenever debris accumulation or damage is observed."], ["Can it work with edge protection?", "Yes, when the interfaces, attachment points and combined inspection requirements are reviewed together."]],
    related: [["Safety Nets UAE", "/safety-net-uae"], ["Catch Nets Dubai", "/safety-catch-net-dubai"], ["Safety Net Systems", "/products/safety-nets"], ["RAMS Guide", "/resources/safety-net-risk-assessment-method-statement"]],
  },
  "/loading-platforms-uae": {
    metaTitle: "Construction Loading Platforms UAE | Temporary Works | AMBS",
    title: "Construction Loading Platforms for UAE Projects",
    description: "Construction loading platform support for UAE high-rise projects, including temporary works review, crane coordination, SWL control, inspection and documentation.",
    eyebrow: "Loading platform UAE",
    image: "/assets/images/loading-platforms.jpg",
    standard: "Temporary works design review",
    shortAnswer: "A construction loading platform is a temporary works platform used to transfer materials between a crane and upper floors. Safe use depends on design load, slab and fixing capacity, crane radius, load distribution, gates, edge protection, exclusion zones, inspection and permit-to-load control.",
    insights: [["Capacity is not the whole design", "Load type, distribution, impact, projection, floor geometry and support details all affect platform suitability."], ["Crane logistics shape location", "Tower-crane radius, lifting path, visibility and adjacent platforms should be reviewed before fixing locations are finalized."], ["Access needs collective protection", "Gates, guardrails, toe boards and transition points must remain effective throughout loading."], ["Relocation resets approval", "A moved platform requires the same installation, inspection and permit-to-load discipline as a new installation."]],
    checks: ["Approved drawings and safe working load", "Slab, anchors, brackets and supports", "Deck, welds, gates and guardrails", "Crane plan, banksman and exclusion zone", "Permit-to-load and inspection status"],
    workflow: ["Share loads, floor plans and crane information.", "Review platform type, support and installation method.", "Coordinate lifting and exclusion zones.", "Install, inspect and issue permit-to-load.", "Control use, relocation, impact and removal."],
    faqs: [["What is a construction loading platform?", "It is a temporary platform fixed or supported at a building level so cranes can transfer materials safely."], ["What is a permit-to-load?", "It is a documented confirmation that the installed platform has been inspected and is ready for controlled use within its approved limits."], ["What should be displayed?", "The safe working load, platform identification, restrictions and current inspection status should be clear to users."], ["Can AMBS review custom requirements?", "AMBS can review drawings, intended loads, floor levels, crane logistics and required documentation according to the agreed scope."], ["When is reinspection required?", "After installation, relocation, impact, alteration, severe weather or any concern about structural condition."]],
    related: [["Loading Platform Product", "/products/loading-platforms"], ["Temporary Works Safety", "/temporary-works-safety-solutions-uae"], ["Work at Height Safety", "/work-at-height-safety-uae"], ["Loading Platform RAMS", "/resources/loading-platform-risk-assessment-method-statement"]],
  },
  "/work-at-height-safety-uae": {
    metaTitle: "Work at Height Safety UAE | Fall Prevention Systems | AMBS",
    title: "Work at Height Safety for UAE Construction",
    description: "Work at height safety support for UAE construction through edge protection, safety nets, loading platforms, opening protection, training and inspection planning.",
    eyebrow: "Work at height safety UAE",
    image: "/assets/images/project-support.jpg",
    standard: "Hierarchy of control",
    shortAnswer: "Work at height safety is the planning and control of activities where a person or object could fall between levels. Strong plans avoid work at height where practical, prioritize collective fall prevention, add fall arrest where needed, control falling objects and maintain each system through training and inspection.",
    insights: [["Prevent before arrest", "Guardrails, edge protection, covers and safe access should be prioritized before relying on systems that act after a fall begins."], ["Combine controls deliberately", "Safety nets, debris containment, gates and exclusion zones can address different parts of one risk."], ["Rescue is part of planning", "Fall-arrest arrangements require realistic access, communication and rescue controls."], ["Site changes need review", "Openings, facade work, logistics and temporary removal can invalidate an earlier assessment."]],
    checks: ["Avoidance and sequencing options", "Collective fall-prevention systems", "Fall-arrest clearance and rescue", "Falling-object containment", "Competence, inspection and records"],
    workflow: ["Identify each work-at-height activity.", "Apply the hierarchy of control.", "Select compatible collective systems.", "Prepare RAMS, rescue and inspection controls.", "Monitor changes and close corrective actions."],
    faqs: [["What is work at height?", "It is work where a person could fall a distance capable of causing injury, including edges, openings, roofs, platforms and access routes."], ["What is the difference between prevention and arrest?", "Fall prevention stops a fall from starting; fall arrest reduces the consequences after a fall begins."], ["Which collective systems does AMBS support?", "Safety nets, edge protection, mesh barriers, loading platforms, shaft and hoist gates, debris containment and custom temporary works interfaces."], ["Why are inspections important?", "Temporary systems can be moved, damaged or altered as construction progresses, so their condition and configuration must be checked."], ["Does website guidance replace RAMS?", "No. Final controls must be project-specific and approved by competent project personnel."]],
    related: [["Edge Protection UAE", "/edge-protection-systems-uae"], ["Safety Nets UAE", "/safety-net-uae"], ["Loading Platforms UAE", "/loading-platforms-uae"], ["RAMS Resource Hub", "/resources/risk-assessment-method-statement"]],
  },
  "/temporary-works-safety-solutions-uae": {
    metaTitle: "Temporary Works Safety Solutions UAE | AMBS",
    title: "Integrated Temporary Works Safety Support",
    description: "Temporary works safety solutions for UAE projects including safety nets, edge protection, loading platforms, gates, steel fabrication, RAMS and inspection support.",
    eyebrow: "Temporary works safety UAE",
    image: "/assets/images/steel-fabrication.jpg",
    standard: "Project-specific technical review",
    shortAnswer: "Temporary works safety covers the systems used to support construction activities before the permanent works are complete. AMBS coordinates safety nets, edge protection, loading platforms, gates, crash decking and fabricated steel with drawings, RAMS, inspection and handover requirements.",
    insights: [["Interfaces create risk", "A loading platform affects edge protection; a shaft gate affects access; a safety net affects rescue and lifting zones."], ["Design assumptions must be visible", "Loads, geometry, support condition, use limits and inspection requirements should be clear to site teams."], ["Documentation follows the system", "Drawings, method, risk controls and inspection records should describe the actual proposed arrangement."], ["Removal is a work stage", "Dismantling and replacement protection need the same planning discipline as installation."]],
    checks: ["Design responsibility and approved information", "Loads and supporting structure", "Interfaces between temporary systems", "Installation, use and alteration controls", "Inspection, handover and removal records"],
    workflow: ["Define scope, responsibility and programme.", "Coordinate drawings, loads and interfaces.", "Review fabrication or supplied components.", "Plan installation, use and inspection.", "Control alteration, handover and removal."],
    faqs: [["What are temporary works?", "They are engineered or controlled systems needed during construction but not normally part of the completed permanent structure."], ["Which AMBS systems are temporary works?", "Examples include loading platforms, edge protection, safety-net supports, gates, crash decking, brackets and custom steel interfaces."], ["What documents are commonly required?", "Drawings, design basis, calculations where applicable, product data, RAMS, ITPs, checklists and handover records."], ["Who approves temporary works?", "Approval responsibilities are defined by the project and may involve the temporary works coordinator, designer, main contractor and consultant."], ["Can systems be modified on site?", "Not without review and authorization. Unauthorized drilling, cutting, welding or relocation can invalidate the approved arrangement."]],
    related: [["Engineering Support", "/engineering-solutions"], ["Loading Platforms", "/loading-platforms-uae"], ["Edge Protection", "/edge-protection-systems-uae"], ["RAMS Resource Hub", "/resources/risk-assessment-method-statement"]],
  },
  "/what-is-en-1263-safety-net": {
    metaTitle: "What Is EN 1263? Safety Net Standard Guide | AMBS",
    title: "What Is EN 1263? Safety Net Standard Explained",
    description: "Practical EN 1263 safety net guide covering product evidence, net systems, installation principles, catching width, labels, inspection and UAE project review.",
    eyebrow: "EN 1263 safety net guide",
    image: "/assets/images/safety-net-systems.jpg",
    standard: "Standards guide",
    article: true,
    shortAnswer: "EN 1263 is the European reference for safety nets used in construction. Part 1 addresses product requirements and test methods; Part 2 addresses positioning limits and installation principles. A compliant product still needs a suitable support, layout, clearance, attachment method, inspection and rescue plan.",
    insights: [["Part 1 and Part 2 serve different roles", "Product performance evidence and safe positioning or installation principles should both be considered."], ["Labels support traceability", "Identification, manufacturer information and test status help project teams confirm which net is in service."], ["Catching width matters", "The horizontal distance available to intercept a falling person increases with fall height and work geometry."], ["Installation can invalidate a product", "Wrong ties, excessive gaps, insufficient clearance or weak supports can make a certified net arrangement unsafe."]],
    checks: ["EN 1263-1 product evidence", "EN 1263-2 layout principles", "System type, mesh and border rope", "Fall height, catching width and clearance", "Labels, inspection and test status"],
    workflow: ["Confirm intended safety-net duty.", "Review product evidence and traceability.", "Develop the project layout and supports.", "Verify clearance, ties and rescue access.", "Inspect and document the installed system."],
    faqs: [["What does EN 1263 cover?", "It covers construction safety-net product requirements, testing, positioning limits and installation principles."], ["Does EN 1263 certification approve any installation?", "No. Product evidence does not automatically approve the supports, fixings, layout or site conditions."], ["What is catching width?", "It is the horizontal distance available for a net to intercept a falling person based on fall height and trajectory."], ["Why are labels important?", "They support identification, traceability and confirmation of the net's test or inspection status."], ["When should an EN 1263 net be inspected?", "Before use, after installation or relocation, after impact or severe weather and at the approved project frequency."]],
    related: [["Safety Nets UAE", "/safety-net-uae"], ["Catch Nets Dubai", "/safety-catch-net-dubai"], ["Safety Net Systems", "/products/safety-nets"], ["Safety Net RAMS", "/resources/safety-net-risk-assessment-method-statement"]],
  },
  "/what-is-en-13374-edge-protection": {
    metaTitle: "What Is EN 13374? Edge Protection Standard Guide | AMBS",
    title: "What Is EN 13374? Edge Protection Standard Explained",
    description: "Practical EN 13374 edge protection guide covering Classes A, B and C, system components, tested configurations, fixings, inspection and UAE applications.",
    eyebrow: "EN 13374 edge protection guide",
    image: "/assets/images/edge-protection-systems.jpg",
    standard: "Standards guide",
    article: true,
    shortAnswer: "EN 13374 is the European product specification and test-method reference for temporary edge protection systems. It defines Classes A, B and C for different working-surface and dynamic demands. Compliance depends on the complete tested configuration and a suitable project installation, not an individual component alone.",
    insights: [["Classes are application-based", "Class selection considers slope, potential movement and the performance demanded from the barrier."], ["The complete configuration matters", "Posts, barriers, rails, toe boards, fixings and spacing should match supported evidence."], ["Fixings need substrate review", "Concrete strength, edge distance, steel geometry and formwork interfaces can control suitability."], ["The 2025 edition needs project review", "Specifications should identify the edition required by the contract and the evidence applicable to the selected system."]],
    checks: ["Required EN 13374 class", "Tested components and spacing", "Fixing method and supporting structure", "Barrier continuity and toe-board control", "Inspection, alteration and removal process"],
    workflow: ["Define edge, slope and work activity.", "Select the required system class.", "Match components and fixings to evidence.", "Install and inspect the complete arrangement.", "Control alteration, removal and reinstatement."],
    faqs: [["What is EN 13374?", "It is a European standard for temporary edge protection product requirements and test methods."], ["What are Classes A, B and C?", "They represent different performance demands based on work-surface slope and the system's need to resist or arrest movement."], ["Does one certified component make a system compliant?", "No. Evidence should cover the complete configuration, spacing, fixing and installation conditions."], ["What changed in BS EN 13374:2025?", "Projects should review the current edition and confirm that specified evidence and system documentation correspond to the contractual requirement."], ["How often should edge protection be inspected?", "Before use, after installation or relocation, after impact or severe weather and at the approved site frequency."]],
    related: [["Edge Protection UAE", "/edge-protection-systems-uae"], ["Temporary Edge Protection Dubai", "/temporary-edge-protection-dubai"], ["BS EN 13374:2025", "/standards/en-13374-edge-protection"], ["Edge Protection RAMS", "/resources/edge-protection-risk-assessment-method-statement"]],
  },
};

function pageSchema(path: string, page: PageConfig) {
  const base = getPublicSiteUrl();
  const primary = page.article ? {
    "@context": "https://schema.org", "@type": "Article", headline: page.title, description: page.description,
    author: { "@type": "Organization", name: "AM Building Solutions DWC LLC", url: base },
    publisher: { "@type": "Organization", name: "AM Building Solutions DWC LLC", url: base }, mainEntityOfPage: `${base}${path}`,
  } : {
    "@context": "https://schema.org", "@type": "Service", name: page.title, description: page.description,
    provider: { "@type": "Organization", name: "AM Building Solutions DWC LLC", url: base, address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" } },
    areaServed: ["Dubai", "Abu Dhabi", "Sharjah", "United Arab Emirates"], url: `${base}${path}`,
  };
  return [primary, {
    "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: page.article ? "Articles" : "Solutions", item: `${base}/${page.article ? "articles" : "products"}` },
      { "@type": "ListItem", position: 3, name: page.title, item: `${base}${path}` },
    ],
  }];
}

export default function TechnicalSeoLanding() {
  const { pathname } = useLocation();
  const page = pages[pathname] ?? pages["/safety-net-uae"];
  return <div className="flex min-h-screen flex-col"><SeoHead title={page.metaTitle} description={page.description} path={pathname} schema={pageSchema(pathname, page)} image={page.image} ogType={page.article ? "article" : "website"}/><Navbar/><main className="flex-1"><TechnicalReviewBlock/>
    <section className="relative isolate overflow-hidden bg-[#20262b] text-white"><img src={page.image} alt={`${page.title} by AM Building Solutions`} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"/><div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111]/95 via-[#111]/80 to-[#111]/35"/><div className="container-wide py-20 md:py-24"><nav aria-label="Breadcrumb" className="text-sm text-white/60"><Link to="/">Home</Link> / <Link to={page.article ? "/articles" : "/products"}>{page.article ? "Articles" : "Solutions"}</Link> / {page.title}</nav><p className="eyebrow mt-8 text-[#F9A900]">{page.eyebrow}</p><h1 className="hero-title mt-4">{page.title}</h1><p className="mt-6 max-w-4xl text-lg leading-8 text-white/75">{page.description}</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/quote" className="ambs-button">Request Project Review <ArrowRight size={17}/></Link><Link to="/contact" className="hero-secondary-button">Contact AMBS</Link></div></div></section>
    <section className="section-band bg-white"><div className="container-wide grid gap-10 lg:grid-cols-[.85fr_1.15fr]"><div><p className="eyebrow text-accent">Short answer</p><h2 className="section-title mt-3">What project teams need to know</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">{page.shortAnswer}</p><span className="standard-tag mt-6 inline-flex">{page.standard}</span></div><div className="grid gap-4 sm:grid-cols-2">{page.insights.map(([title, copy])=><article key={title} className="rounded-md border border-border bg-[#f5f6f7] p-5"><ShieldCheck className="text-accent"/><h3 className="mt-4 font-display text-xl font-bold uppercase">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></article>)}</div></div></section>
    <section className="section-band bg-[#f3f4f4]"><div className="container-wide grid gap-10 lg:grid-cols-2"><div><p className="eyebrow text-accent">Technical review</p><h2 className="section-title mt-3">Site information and checks</h2><div className="mt-7 grid gap-3">{page.checks.map(item=><div key={item} className="flex gap-3 rounded-md border border-border bg-white p-4 font-semibold"><ClipboardCheck className="shrink-0 text-accent" size={20}/>{item}</div>)}</div></div><div><p className="eyebrow text-accent">Workflow</p><h2 className="section-title mt-3">From enquiry to handover</h2><ol className="mt-7 grid gap-3">{page.workflow.map((step,index)=><li key={step} className="flex gap-4 rounded-md border border-border bg-white p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{index+1}</span><span className="leading-7 text-muted-foreground">{step}</span></li>)}</ol></div></div></section>
    <section className="section-band bg-white"><div className="container-wide"><p className="eyebrow text-accent">Related technical guidance</p><h2 className="section-title mt-3">Continue your project review</h2><div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{page.related.map(([label, href])=><Link key={href} to={href} className="group rounded-md border border-border bg-white p-5 font-display text-lg font-bold uppercase transition hover:border-accent hover:text-accent">{label}<ArrowRight className="mt-4 transition-transform group-hover:translate-x-1" size={18}/></Link>)}</div></div></section>
    <section className="section-band bg-[#f3f4f4]"><div className="container-wide max-w-5xl"><p className="eyebrow text-accent">Frequently asked questions</p><h2 className="section-title mt-3">Practical answers for UAE project teams</h2><div className="mt-7 divide-y divide-border border-y border-border">{page.faqs.map(([question,answer])=><details key={question}><summary className="cursor-pointer py-5 font-display text-xl font-bold uppercase">{question}</summary><p className="pb-6 leading-7 text-muted-foreground">{answer}</p></details>)}</div></div></section>
    <section className="bg-accent py-12 text-white"><div className="container-wide flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><h2 className="font-display text-4xl font-extrabold uppercase">Send drawings for project-specific review</h2><p className="mt-2 text-white/80">Include location, quantities, programme, work sequence and consultant requirements.</p></div><Link to="/quote?type=drawings" className="ambs-button-yellow"><FileText size={18}/>Start Technical Enquiry</Link></div></section>
  </main><Footer/></div>;
}
