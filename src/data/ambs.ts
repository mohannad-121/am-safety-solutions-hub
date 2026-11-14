export type Product = {
  name: string;
  slug: string;
  summary: string;
  standard: string;
  image: string;
  alt: string;
  group: "products" | "engineering" | "high-risk" | "fabrication";
};

export const products: Product[] = [
  { name: "Safety Net Systems", slug: "products/safety-nets", summary: "Horizontal catch nets, vertical netting, safety net fans and debris containment for construction work zones.", standard: "EN 1263 reference", image: "/assets/images/safety-net-systems.jpg", alt: "High-rise construction project illustrating safety net planning requirements", group: "products" },
  { name: "Edge Protection Systems", slug: "edge-protection-systems-uae", summary: "Temporary collective fall prevention for concrete slabs, steel structures, stairs, formwork and roofs.", standard: "EN 13374 reference", image: "/assets/images/edge-protection-systems.jpg", alt: "High-rise construction perimeter illustrating temporary edge protection applications", group: "products" },
  { name: "Loading Platforms", slug: "products/loading-platforms", summary: "Project-specific material loading and unloading platforms supported by technical review and documentation.", standard: "Design review", image: "/assets/images/loading-platforms.jpg", alt: "High-rise construction project illustrating material loading logistics", group: "products" },
  { name: "Safety Net Fans & Catch Nets", slug: "products/safety-net-fans", summary: "External projection systems for high-rise perimeter fall and falling-object protection.", standard: "EN 1263 reference", image: "/assets/images/safety-net-systems.jpg", alt: "High-rise perimeter illustrating safety net fan and catch net planning", group: "high-risk" },
  { name: "Vertical Safety Nets", slug: "products/vertical-safety-nets", summary: "Vertical netting for facade works, perimeter containment and project-specific debris control.", standard: "Project-specific review", image: "/assets/images/project-support.jpg", alt: "High-rise facade illustrating vertical safety net and debris containment planning", group: "products" },
  { name: "Horizontal Safety Nets", slug: "products/horizontal-safety-nets", summary: "Collective fall-arrest netting positioned below working areas and open structures.", standard: "EN 1263 reference", image: "/assets/images/safety-net-systems.jpg", alt: "High-rise work area illustrating horizontal safety net planning", group: "products" },
  { name: "Mesh Barrier & Wire Mesh Guard", slug: "mesh-barrier-edge-protection", summary: "Reusable mesh panels, posts, toe boards and site-specific slab or steel fixing options.", standard: "EN 13374 reference", image: "/assets/images/edge-protection-systems.jpg", alt: "Construction perimeter illustrating mesh barrier and wire mesh guard applications", group: "products" },
  { name: "Shaft Protection Gates", slug: "products/shaft-protection-gates", summary: "Controlled protection for lift shafts, stair cores and temporary openings throughout construction.", standard: "Site-specific review", image: "/assets/images/shaft-hoist-gates.jpg", alt: "Construction structure illustrating shaft and opening protection requirements", group: "high-risk" },
  { name: "Hoist Gates", slug: "products/hoist-gates", summary: "Robust access gates for construction hoist landings and controlled material movement zones.", standard: "Site-specific review", image: "/assets/images/shaft-hoist-gates.jpg", alt: "High-rise project illustrating hoist landing gate applications", group: "high-risk" },
  { name: "Crash Decking", slug: "products/crash-decking", summary: "Engineered protection below facade, demolition and high-risk work zones.", standard: "Temporary works review", image: "/assets/images/project-support.jpg", alt: "Construction project illustrating crash decking and falling-object protection zones", group: "high-risk" },
  { name: "Lifting & Crane Bearing Beams", slug: "products/lifting-beams", summary: "Project-specific lifting beams, spreader beams, crane bearing beams and steel interfaces.", standard: "Engineering review", image: "/assets/images/steel-fabrication.jpg", alt: "Construction lifting operation illustrating engineered beam requirements", group: "engineering" },
  { name: "Custom Steel Fabrication", slug: "steel-fabrication", summary: "Custom temporary works steel, gates, brackets, frames and safety components built around project drawings.", standard: "QA/QC documentation", image: "/assets/images/steel-fabrication.jpg", alt: "Construction steelwork illustrating custom fabrication requirements", group: "fabrication" },
];

export const articles = [
  { slug: "edge-protection-system-uae-components", category: "Edge Protection", title: "Edge Protection System UAE: Mesh Barrier, Toe Board, Posts and Fixing Options", summary: "A practical guide to selecting mesh barriers, posts, toe boards, slab clamps and concrete fixings for UAE sites.", image: "/assets/images/edge-protection-systems.jpg" },
  { slug: "safety-net-systems-explained", category: "Safety Nets", title: "Safety Net Systems Explained: Vertical Nets, Horizontal Nets, Catch Nets and Debris Nets", summary: "Compare common safety net arrangements by direction, application, installation interface and inspection need.", image: "/assets/images/safety-net-systems.jpg" },
  { slug: "en-1263-safety-nets-consultant-checklist", category: "Standards", title: "EN 1263 Safety Nets: What Contractors and Consultants Should Check", summary: "A consultant-focused review of product evidence, installation methodology, inspection and traceability.", image: "/assets/images/project-support.jpg" },
  { slug: "en-13374-edge-protection-classes", category: "Standards", title: "EN 13374 Edge Protection: Class A, Class B and Site Applications", summary: "Understand the role of system classes and why the approved installation must match the tested configuration.", image: "/assets/images/edge-protection-systems.jpg" },
  { slug: "loading-platform-inspection-checklist", category: "Loading Platforms", title: "Loading Platform Design and Inspection Checklist for UAE Projects", summary: "Key information for drawings, calculations, lifting, erection, use and routine inspection.", image: "/assets/images/loading-platforms.jpg" },
  { slug: "mesh-barrier-vs-guardrail", category: "Edge Protection", title: "Mesh Barrier vs Guardrail: Which Edge Protection System Is Better?", summary: "Compare containment, visibility, toe-board integration, fixing and relocation requirements.", image: "/assets/images/edge-protection-systems.jpg" },
  { slug: "fall-prevention-protection-arrest", category: "Working at Height", title: "Fall Prevention vs Fall Protection vs Fall Arrest: What Is the Difference?", summary: "Clear terminology for project managers, HSE teams and temporary works coordinators.", image: "/assets/images/project-support.jpg" },
  { slug: "select-safety-net-facade-demolition-high-rise", category: "Safety Nets", title: "How to Select a Safety Net for Facade, Demolition and High-Rise Works", summary: "Start with the hazard, work sequence, clearances, anchorage, debris size and inspection regime.", image: "/assets/images/safety-net-systems.jpg" },
  { slug: "shaft-protection-hoist-gates", category: "High-Risk Products", title: "Shaft Protection Gates and Hoist Gates for Safer Openings", summary: "Plan controlled access, positive closing, edge interfaces and inspection for openings and landings.", image: "/assets/images/shaft-hoist-gates.jpg" },
  { slug: "construction-debris-containment", category: "Debris Protection", title: "Construction Debris Containment: Nets, Mesh, Toe Boards and Sheeting", summary: "Build layered protection around the material size, wind exposure, public interface and work method.", image: "/assets/images/project-support.jpg" },
];

export const projects = [
  { title: "High-Rise Perimeter Protection", type: "High-rise", location: "UAE", summary: "A coordinated concept combining perimeter edge protection, mesh barriers and controlled relocation by work stage.", image: "/assets/images/edge-protection-systems.jpg" },
  { title: "Facade Works Debris Containment", type: "Facade", location: "Dubai", summary: "Vertical netting and debris containment planned around facade access and public-interface risks.", image: "/assets/images/safety-net-systems.jpg" },
  { title: "Material Loading Platform Package", type: "Material handling", location: "UAE", summary: "Loading platform planning supported by drawings, design basis, installation method and inspection records.", image: "/assets/images/loading-platforms.jpg" },
  { title: "Lift Shaft and Hoist Landing Protection", type: "Openings", location: "UAE", summary: "Steel gates and barrier interfaces developed around temporary access, handover and inspection requirements.", image: "/assets/images/shaft-hoist-gates.jpg" },
  { title: "Custom Temporary Works Steel", type: "Fabrication", location: "GCC", summary: "Project-specific brackets, frames and beams fabricated from approved drawings and material requirements.", image: "/assets/images/steel-fabrication.jpg" },
  { title: "Demolition Falling-Object Protection", type: "Demolition", location: "UAE", summary: "A layered protection concept using catch systems, debris containment and exclusion-zone coordination.", image: "/assets/images/project-support.jpg" },
];

export const edgeTopics = [
  { slug: "temporary-edge-protection-uae", title: "Temporary Edge Protection UAE", detail: "Select fixing methods by substrate, construction sequence, exposure and reuse plan." },
  { slug: "en-13374-edge-protection", title: "EN 13374 Edge Protection", detail: "Understand the standard, system classes and the evidence needed for project approval." },
  { slug: "bs-en-13374-2025-edge-protection", title: "BS EN 13374:2025", detail: "Review the current temporary edge protection product specification and test-method reference with the project team." },
  { slug: "mesh-barrier-edge-protection", title: "Mesh Barrier Edge Protection", detail: "Mesh panels, posts, toe boards and compatible slab or steel fixings." },
  { slug: "slab-edge-protection", title: "Slab Edge Protection", detail: "Bolt-down bases, slab grabs and edge brackets for concrete floors and openings." },
  { slug: "concrete-edge-protection", title: "Concrete Edge Protection", detail: "Review anchors, edge distances, concrete strength and relocation sequence." },
  { slug: "steel-edge-protection", title: "Steel Edge Protection", detail: "Clamp-on arrangements for steel beams, erection work and facade steel interfaces." },
  { slug: "stair-edge-protection", title: "Stair Edge Protection", detail: "Protect flights, landings and temporary access routes between floors." },
  { slug: "formwork-edge-protection", title: "Formwork Edge Protection", detail: "Coordinate guardrails with formwork suppliers before each pour and relocation." },
  { slug: "guardrail-systems", title: "Guardrail Systems", detail: "Parapet, roof and walkway barriers selected for the supporting structure." },
  { slug: "compression-post-edge-protection", title: "Compression Post Edge Protection", detail: "Consider between-slab compression posts when drilling is restricted and the structure is suitable." },
  { slug: "edge-protection-inspection", title: "Edge Protection Inspection", detail: "Pre-use, relocation and periodic checks for posts, panels, pins, toe boards and fixings." },
];

export const faqs = [
  ["What is temporary edge protection?", "A temporary collective barrier that helps prevent falls at open construction edges. The final arrangement must suit the structure, fixing and work sequence."],
  ["What is EN 13374?", "EN 13374 is a product specification and test-method reference for temporary edge protection systems. A reference to it does not by itself prove a particular installation complies."],
  ["Which edge protection system suits a slab?", "Bolt-down bases, slab grabs and edge brackets are common options. Selection depends on slab geometry, concrete condition, anchor design and the approved method statement."],
  ["Can edge protection be installed without drilling?", "Some slab clamps, steel clamps, parapet clamps or compression posts may avoid drilling where the substrate and design allow it."],
  ["What documents should a consultant review?", "A typical package includes product data sheets, drawings, fixing details, test information where applicable, method statement, risk assessment, inspection plan and handover records."],
  ["When should edge protection be inspected?", "Inspect before first use, after relocation or impact, and at the frequency required by the approved site procedure. Remove damaged components from service."],
  ["Can safety nets work with edge protection?", "Yes. They can serve different fall and falling-object risks, provided their interfaces and installation methods are reviewed together."],
  ["Does AMBS offer training?", "AMBS can discuss edge protection and safety net awareness, installation, inspection and toolbox-talk requirements for UAE site teams."],
] as const;
