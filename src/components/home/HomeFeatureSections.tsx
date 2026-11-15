import { useEffect, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, ClipboardCheck, Factory, FileText, GraduationCap, HardHat, PackageCheck, Ruler, ShieldCheck, Truck, Wrench } from "lucide-react";
import { articles, products } from "@/data/ambs";
import { company, whatsappUrl } from "@/config/company";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useCmsImages } from "@/hooks/use-cms";

const safetyStrip = ["Working at Height Safety", "Fall Prevention", "Fall Protection", "Collective Protection", "Debris Containment", "Load Handling", "Technical Submittals", "Installation Support"];
const services = [
  [Ruler, "Design & Engineering Support", "Review drawings, interfaces, loading requirements and project-specific constraints."],
  [Factory, "Manufacturing & Fabrication", "Standard and custom steel systems produced around approved project information."],
  [Truck, "Supply & Delivery", "Clear coordination for planned UAE and GCC project deliveries."],
  [Wrench, "Installation Support", "System-specific guidance, sequencing and practical coordination with site teams."],
  [ClipboardCheck, "Inspection & Maintenance", "Pre-use, relocation, periodic and post-impact inspection support."],
  [FileText, "Technical Submittals", "Data sheets, drawings, methods, checklists and calculations where applicable."],
  [ShieldCheck, "Method Statements", "Installation, use, relocation and dismantling sequences matched to the system."],
  [GraduationCap, "Product Training", "Awareness, installation and inspection sessions for responsible project teams."],
];

const faqs = [
  ["What safety net systems do you supply in the UAE?", "AMBS supports horizontal safety nets, vertical safety nets, catch nets, safety net fans, facade netting and debris containment solutions. Final selection depends on the hazard, work sequence, clearance, anchorage and required documentation."],
  ["Are your safety nets compliant with EN 1263?", "Relevant AM safety net systems can be supported with EN 1263-related product and installation documentation where applicable. Compliance must be confirmed for the actual product, configuration, test evidence and site installation."],
  ["What is the difference between edge protection and a mesh barrier?", "Edge protection is the complete temporary system protecting an open edge. A mesh barrier or wire mesh guard is one panel component used with compatible posts, toe boards, clamps, sockets or other approved fixings."],
  ["Do you supply mesh guard or Meshguard-type systems in the UAE?", "AM Building Solutions supplies steel mesh barrier and mesh guard type edge protection systems for slab edges, facade perimeters, shaft openings and temporary site safety zones."],
  ["Can AM provide an alternative to Combisafe mesh guard or TSS Meshguard?", "AMBS can review requirements for contractors searching for a Combisafe mesh guard alternative or TSS Meshguard alternative in the UAE. AM is an independent supplier and does not claim affiliation with those brands."],
  ["Can AM provide an alternative to TSS catch net or TSS net?", "AMBS supplies engineered safety net and catch net options for projects searching for TSS catch net alternatives, TSS net alternatives, horizontal nets or vertical nets. Suitability is confirmed from project information."],
  ["Are edge protection systems prepared with EN 13374 documentation?", "Applicable systems can be prepared with EN 13374-related product information, fixing details, inspection records and project-specific submittals. The approved configuration and supporting structure remain critical."],
  ["Do you provide loading platforms with calculations?", "Where required by the project scope, loading platform proposals can include a design basis, structural calculation, drawings, installation method, lifting information and inspection requirements."],
  ["Can you provide consultant-ready technical submittals?", "AMBS can coordinate product data, material information, drawings, method statements, risk assessment inputs, ITPs, inspection checklists and calculations where applicable."],
  ["Do you supply across the UAE and GCC?", "AM Building Solutions is based in Dubai and supports enquiries across Dubai, Abu Dhabi, Sharjah and the wider UAE, as well as GCC projects subject to scope, logistics and technical review."],
];

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) { return <div className="max-w-3xl"><p className="eyebrow text-accent">{eyebrow}</p><h2 className="section-title mt-3">{title}</h2>{copy && <p className="mt-4 text-lg leading-8 text-muted-foreground">{copy}</p>}</div>; }

function StatisticsSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const animationFrameRef = useRef<number>();
  const hasAnimatedRef = useRef(false);
  const [counts, setCounts] = useState({ projects: 0, years: 0, enquiries: 0 });

  useEffect(() => {
    const finalCounts = { projects: 1000, years: 11, enquiries: 24 };

    if (reduced) {
      hasAnimatedRef.current = true;
      setCounts(finalCounts);
      return;
    }

    if (hasAnimatedRef.current || !sectionRef.current) return;

    const duration = 2000;
    const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasAnimatedRef.current) return;

      hasAnimatedRef.current = true;
      observer.disconnect();
      const startTime = performance.now();

      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = easeOutCubic(progress);
        setCounts({
          projects: Math.round(finalCounts.projects * easedProgress),
          years: Math.round(finalCounts.years * easedProgress),
          enquiries: Math.round(finalCounts.enquiries * easedProgress),
        });

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCounts(finalCounts);
          animationFrameRef.current = undefined;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }, { threshold: 0.15 });

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reduced]);

  return <section ref={sectionRef} className="bg-[#171c21] py-8 text-white" aria-label="AM Building Solutions experience">
    <div className="container-wide grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-4">
      <div className="home-stat"><strong aria-label="1,000 plus"><span aria-hidden="true">{counts.projects.toLocaleString()}+</span></strong><span>Projects Supported</span></div>
      <div className="home-stat"><strong aria-label="11 plus"><span aria-hidden="true">{counts.years}+</span></strong><span>Years Experience</span></div>
      <div className="home-stat"><strong>UAE &amp; GCC</strong><span>Regional Supply</span></div>
      <div className="home-stat"><strong aria-label="24 hours a day, 7 days a week"><span aria-hidden="true">{counts.enquiries}</span><span aria-hidden="true">/7</span></strong><span>Project Enquiries</span></div>
    </div>
  </section>;
}

const hoverImages = [
  // IMAGE PLACEHOLDER - replace with AMBS product hover image
  "/assets/images/project-support.jpg",
  "/assets/images/hero-poster.jpg",
  "/assets/images/steel-fabrication.jpg",
  "/assets/images/safety-net-systems.jpg",
  "/assets/images/edge-protection-systems.jpg",
  "/assets/images/loading-platforms.jpg",
  "/assets/images/shaft-hoist-gates.jpg",
];

function InteractiveProductCard({ product, index }: { product: (typeof products)[number]; index: number }) {
  const { image } = useCmsImages();
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const href = `/${product.slug}`;
  const hoverImage = hoverImages[index % hoverImages.length];
  const activate = (event: MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches || (event.target as HTMLElement).closest("a")) return;
    if (!flipped) { event.preventDefault(); setFlipped(true); }
    else navigate(href);
  };
  return <motion.article className={`interactive-product-card group ${flipped ? "is-flipped" : ""}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .45, delay: Math.min(index, 7) * .035 }} onClick={activate} onMouseLeave={() => setFlipped(false)}>
    <div className="interactive-product-media">
      {/* IMAGE PLACEHOLDER - replace with AMBS product front image */}
      <img src={image(product.image)} alt={product.alt} loading="lazy" width="1200" height="800" className="product-front-image" />
      {/* IMAGE PLACEHOLDER - replace with AMBS product detail photo */}
      <img src={image(hoverImage)} alt={`${product.name} installation and technical detail`} loading="lazy" width="1200" height="800" className="product-hover-image" />
      <span className="product-media-label">Project view</span>
    </div>
    <div className="flex min-h-[220px] flex-col p-5"><span className="standard-tag">{product.standard}</span><h3 className="mt-4 font-display text-[1.35rem] font-bold uppercase leading-tight">{product.name}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.summary}</p><Link to={href} className="ambs-text-link mt-auto pt-5">View Solution <ArrowRight className="product-arrow" size={17}/></Link></div>
  </motion.article>;
}

export function HomeFeatureSections() {
  const { image } = useCmsImages();
  return <>
    <section className="border-y border-[#e2b100]/25 bg-[#F9A900] py-4" aria-label="AMBS safety capabilities"><div className="container-wide grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4 lg:grid-cols-8">{safetyStrip.map((item) => <div key={item} className="flex items-center gap-2 text-xs font-bold text-[#171c21]"><CheckCircle2 size={16} />{item}</div>)}</div></section>

    <StatisticsSection />

    <section id="solutions" className="section-band bg-white"><div className="container-wide"><SectionIntro eyebrow="Products & Solutions" title="Construction Safety Systems Built Around Site Reality" copy="Select a system by hazard and application, then send drawings for a project-specific proposal, fixing review and consultant-ready technical package." /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product, index) => <InteractiveProductCard key={product.slug} product={product} index={index}/>)}</div></div></section>

    <section className="section-band bg-[#f3f4f4]"><div className="container-wide grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]"><div><p className="eyebrow text-accent">Temporary Edge Protection UAE</p><h2 className="section-title mt-3">Edge Protection Systems, Mesh Barriers & Wire Mesh Guards</h2><p className="mt-5 leading-8 text-muted-foreground">Our edge protection system range is intended for slab edges, stair openings, lift shafts, facade perimeters and temporary construction zones. A project arrangement may use a steel mesh barrier, wire mesh barrier, safety mesh barrier, mesh guard, integrated toe board, socket post, clamp socket, slab clamp, concrete fixing or formwork attachment.</p><p className="mt-4 leading-8 text-muted-foreground">For contractors searching for an edge guard system, temporary mesh barrier, Combisafe mesh guard alternative or TSS Meshguard alternative in the UAE, AM Building Solutions provides an independent, engineered option supported by practical design, fabrication and technical submittal review. AMBS is not affiliated with those competitor brands.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/edge-protection-systems-uae" className="ambs-button">Explore Edge Protection</Link><Link to="/standards/en-13374-edge-protection" className="secondary-button">Understand EN 13374</Link></div></div><img src={image("/assets/images/edge-protection-systems.jpg")} alt="High-rise construction perimeter illustrating edge protection planning" className="aspect-[4/3] w-full object-cover" loading="lazy" /></div></section>

    <section className="section-band bg-[#20262b] text-white"><div className="container-wide grid items-center gap-12 lg:grid-cols-[.95fr_1.05fr]"><img src={image("/assets/images/safety-net-systems.jpg")} alt="High-rise construction work area illustrating safety net planning" className="aspect-[4/3] w-full object-cover" loading="lazy" /><div><p className="eyebrow text-[#F9A900]">Safety Net Systems UAE</p><h2 className="section-title mt-3 text-white">Safety Nets, Catch Nets, Vertical Nets & Horizontal Fall Protection Nets</h2><p className="mt-5 leading-8 text-white/70">AM Building Solutions supplies construction safety net systems for fall protection, debris containment, facade protection, demolition work and high-rise construction. The range includes horizontal safety nets, vertical safety nets, catch nets, safety net fans, fall arrest nets, perimeter nets, under-deck nets, debris nets and project-specific AM Net solutions.</p><p className="mt-4 leading-8 text-white/70">For projects searching for TSS catch net alternatives, TSS net alternatives or Combisafe safety net alternatives in the UAE, AMBS can review System S, System T or System U requirements, mesh and border-rope details, secondary debris layers, anchorage and installation methodology. Any standard or performance claim must match the selected product evidence.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/products/safety-nets" className="ambs-button">Explore Safety Nets</Link><Link to="/articles/safety-net-systems-explained" className="hero-secondary-button">Read the System Guide</Link></div></div></div></section>

    <section className="section-band bg-white"><div className="container-wide"><SectionIntro eyebrow="Search Intent, Explained" title="Searching for Mesh Guard, Catch Net, or Edge Protection Alternatives?" copy="Different contractors use different product names. AMBS helps translate those search terms into a suitable, documented system rather than assuming products are interchangeable." /><div className="mt-8 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3"><div className="bg-white p-6"><h3 className="font-display text-xl font-bold uppercase">Mesh & Edge Terms</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Mesh barrier, wire mesh barrier, Meshguard, mesh guard, edge guard, guardrail and temporary edge protection can describe components or complete systems.</p></div><div className="bg-white p-6"><h3 className="font-display text-xl font-bold uppercase">Netting Terms</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Catch net, falling net, fall protection net, horizontal net, vertical net and safety net fan describe different arrangements and hazards.</p></div><div className="bg-white p-6"><h3 className="font-display text-xl font-bold uppercase">Independent Alternatives</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">AMBS can offer UAE-based alternatives for searches mentioning Combisafe or TSS, without implying affiliation, equivalence or approval without evidence.</p></div></div></div></section>

    <section className="section-band bg-[#f3f4f4]"><div className="container-wide"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><SectionIntro eyebrow="Technical Knowledge" title="Technical Articles & Safety Guides" copy="Clear guidance for contractors, consultants, HSE teams, procurement teams and temporary works coordinators." /><Link to="/articles" className="secondary-button shrink-0">View All Articles</Link></div><div className="mt-10 grid gap-6 lg:grid-cols-3">{articles.slice(0, 3).map((article) => <article key={article.slug} className="article-card"><img src={image(article.image)} alt={`${article.title} technical guide`} className="aspect-[16/9] w-full object-cover" loading="lazy" /><div className="p-6"><span className="text-xs font-bold uppercase text-accent">{article.category}</span><h3 className="mt-3 font-display text-2xl font-bold uppercase leading-tight">{article.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{article.summary}</p><Link to={`/articles/${article.slug}`} className="ambs-text-link mt-5">Read Guide <ArrowRight size={17} /></Link></div></article>)}</div></div></section>

    <section className="section-band bg-white"><div className="container-wide"><SectionIntro eyebrow="Technical Confidence" title="Systems, Components & Consultant Documents" copy="Readable technical tables help project teams identify what each component does and which documents should follow the selected system." />
      <div className="mt-10 space-y-10"><div><h3 className="table-title">Edge Protection System Components</h3><div className="technical-table-wrap"><table className="technical-table"><thead><tr><th>Component</th><th>Purpose</th><th>Typical Application</th><th>Technical Notes</th></tr></thead><tbody>{[["Mesh Barrier","Helps prevent personnel and object falls","Slab edges and perimeter areas","Also searched as mesh guard, wire mesh barrier or Meshguard"],["Toe Board","Helps contain small tools and materials","Bottom of edge barrier","May be integrated or removable"],["Socket Post","Supports the barrier system","Concrete slab or temporary base","Used with compatible clamp or socket systems"],["Clamp Socket","Fixes to slab, upstand or formwork","Slab edge and formwork areas","Reusable when approved for the interface"],["Shaft Gate","Controls access to an opening","Lift shafts and staircase cores","Also searched as shaftgate or lift shaft gate"],["Core Protection","Provides fixed opening protection","Stair core and lift core","Steel mesh opening protection"]].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></div>
      <div><h3 className="table-title">Safety Net System Types</h3><div className="technical-table-wrap"><table className="technical-table"><thead><tr><th>System Type</th><th>Main Use</th><th>Direction</th><th>Technical Notes</th></tr></thead><tbody>{[["Horizontal Safety Net","Fall arrest below a work area","Horizontal","Also searched as horizontal net or fall protection net"],["Vertical Safety Net","Facade and debris containment","Vertical","Also searched as vertical net or facade net"],["Catch Net","Person or falling-object protection","Horizontal / angled","Requires project-specific positioning and support"],["Safety Net Fan","External facade protection","Projection from building","Common on high-rise perimeters"],["Debris Net","Smaller debris containment","Vertical or horizontal","Often a secondary layer"],["Work Positioning Net","Access or positioning support","Project-specific","Scope and use require specialist review"]].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></div>
      <div><h3 className="table-title">Standards and Documents</h3><div className="technical-table-wrap"><table className="technical-table"><thead><tr><th>Product</th><th>Relevant Reference</th><th>Documents to Provide</th><th>Consultant Value</th></tr></thead><tbody>{[["Safety Net","EN 1263-1 / EN 1263-2","Applicable test evidence, method statement, inspection checklist","Supports product and installation review"],["Edge Protection","BS EN 13374:2025 / project requirement","Product data, fixing details, test evidence, inspection records","Supports temporary edge protection review"],["Loading Platform","Approved temporary works design basis","Calculation, drawings, method statement, lifting information","Supports design and erection review"],["Hoist / Shaft Gate","Project HSE and temporary works requirements","Drawing, material details, inspection checklist","Controls access and opening risk"],["Steel Fabrication","Project specification; EN 1090 where applicable","Material certificates, WPS where applicable, QC records","Improves traceability"]].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></div></div>
    </div></section>

    <section className="section-band bg-[#20262b] text-white"><div className="container-wide"><SectionIntro eyebrow="One Project Partner" title="From Engineering Review to Site Support" copy="AMBS supports the practical chain around a system: selection, documentation, fabrication, supply, installation planning, inspection and training." /><div className="mt-10 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:grid-cols-4">{services.map(([Icon, title, copy]) => <div key={String(title)} className="bg-[#20262b] p-6"><Icon className="text-[#F9A900]" /><h3 className="mt-5 font-display text-xl font-bold uppercase">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-white/65">{String(copy)}</p></div>)}</div></div></section>

    <section className="section-band bg-white"><div className="container-wide"><SectionIntro eyebrow="Frequently Asked Questions" title="Answers for Contractors, Consultants & HSE Teams" /><div className="mt-8 max-w-5xl divide-y divide-border border-y border-border">{faqs.map(([question, answer]) => <details key={question} className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-xl font-bold uppercase"><span>{question}</span><span className="text-accent transition-transform group-open:rotate-45">+</span></summary><p className="max-w-4xl pb-6 leading-7 text-muted-foreground">{answer}</p></details>)}</div></div></section>

    <section className="bg-[#C51A14] py-14 text-white"><div className="container-wide flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center"><div><h2 className="font-display text-4xl font-extrabold uppercase md:text-5xl">Need a consultant-ready safety or temporary works solution?</h2><p className="mt-3 max-w-3xl text-white/80">Send drawings, site photos, quantities, project location and required delivery date. AMBS will review the requirement and propose the next technical step.</p></div><div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col"><Link to="/quote" className="ambs-button-yellow">Request a Quote</Link><Link to="/quote?type=drawings" className="hero-secondary-button">Send Project Drawings</Link>{company.whatsappNumber && <a href={whatsappUrl("Hello AM Building Solutions, I need a consultant-ready safety or temporary works solution. Project: ____. Location: ____. Required date: ____. ")} target="_blank" rel="noreferrer" className="hero-secondary-button"><WhatsAppIcon className="h-5 w-5" /> WhatsApp Our Engineer</a>}</div></div></section>
  </>;
}


