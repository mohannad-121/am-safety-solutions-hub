import { useReducer, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, CheckCircle2, ClipboardCheck, Factory, GraduationCap, Lightbulb, Ruler, ShieldCheck, Target, Users, Wrench } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/SeoHead";
import { ManagedBackgroundVideo } from "@/components/video/ManagedBackgroundVideo";
import { useCmsImages } from "@/hooks/use-cms";

const aboutImages = {
  // IMAGE PLACEHOLDER - replace with AMBS team/engineering photo
  aboutTeamImage: "/assets/images/project-support.jpg",
  // IMAGE PLACEHOLDER - replace with AMBS safety net photo
  safetyNetImage: "/assets/images/safety-net-systems.jpg",
  // IMAGE PLACEHOLDER - replace with AMBS edge protection photo
  edgeProtectionImage: "/assets/images/edge-protection-systems.jpg",
  // IMAGE PLACEHOLDER - replace with AMBS project photo
  siteProtectionImage: "/assets/images/hero-poster.jpg",
  // IMAGE PLACEHOLDER - replace with AMBS site installation photo
  engineeringSupportImage: "/assets/images/steel-fabrication.jpg",
  // IMAGE PLACEHOLDER - replace with AMBS project installation image
  ctaBackgroundImage: "/assets/images/landing-hero-poster.jpg",
};

const aboutSchema = [
  { "@context": "https://schema.org", "@type": "Organization", name: "AM Building Solutions DWC LLC", alternateName: "AMBS", url: "https://www.ambs.ae" },
  { "@context": "https://schema.org", "@type": "VideoObject", name: "AM Building Solutions construction safety systems", description: "AM Building Solutions supports safety nets, temporary edge protection systems and temporary works safety solutions for UAE construction projects.", thumbnailUrl: "https://www.ambs.ae/assets/images/about-hero-poster.jpg", contentUrl: "https://www.ambs.ae/assets/videos/about-hero-video.mp4" },
];

const storySteps = [
  { number: "01", label: "Risk scan", title: "Understand the Site Risk", copy: "Review drawings, slab edges, facade zones, openings, debris paths and work-at-height exposure before recommending a protection method.", icon: Ruler },
  { number: "02", label: "System match", title: "Select the Right Protection System", copy: "Match safety net UAE and edge protection UAE requirements with the correct temporary edge protection system, safety catch net or debris safety net.", icon: ShieldCheck },
  { number: "03", label: "Engineering", title: "Support with Engineering & Fabrication", copy: "Coordinate interfaces, installation guidance, technical submissions and custom temporary works fabrication around verified project conditions.", icon: Wrench },
  { number: "04", label: "Execution", title: "Deliver Safer Site Execution", copy: "Support installation, inspection, training and handover so collective protection remains practical through changing construction stages.", icon: CheckCircle2 },
];

const values = [
  [ShieldCheck, "Safety First", "Hazard-led decisions focused on reliable collective protection."],
  [Ruler, "Engineering Support", "Clear technical coordination around real site interfaces."],
  [CheckCircle2, "Quality", "Materials, fabrication and records matched to requirements."],
  [Lightbulb, "Innovation", "Practical improvements shaped by active construction sites."],
  [Users, "Customer Focus", "Responsive support for contractors, consultants and HSE teams."],
  [Target, "Continuous Improvement", "Project feedback strengthens every system and process."],
];

const supportServices = [
  [ClipboardCheck, "Site Safety Review", "Review hazards, drawings and work sequences."],
  [Wrench, "Installation Guidance", "Support fixing, sequencing and safe use."],
  [CheckCircle2, "Inspection Support", "Provide practical checks and maintenance guidance."],
  [GraduationCap, "Training & Awareness", "Build confidence for responsible site teams."],
  [Factory, "Custom Fabrication", "Develop project-specific temporary works steel."],
];

function Reveal({ children, direction = "up", delay = 0, className = "" }: { children: ReactNode; direction?: "up" | "left" | "right"; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  const offset = direction === "left" ? { x: -28, y: 0 } : direction === "right" ? { x: 28, y: 0 } : { x: 0, y: 24 };
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, ...offset }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, amount: .22 }} transition={{ duration: .65, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function ImageFrame({ src, alt, label, side = "right" }: { src: string; alt: string; label: string; side?: "left" | "right" }) {
  const { image } = useCmsImages();
  const reduced = useReducedMotion();
  return <motion.figure className="about-image-frame group" initial={reduced ? false : { opacity: 0, clipPath: side === "right" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }} whileInView={{ opacity: 1, clipPath: "inset(0 0 0 0)" }} viewport={{ once: true, amount: .18 }} transition={{ duration: .9, ease: [0.22, 1, 0.36, 1] }}>
    <img src={image(src)} alt={alt} loading="lazy" width="1200" height="900" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
    <figcaption className="absolute bottom-5 left-5 bg-[#171c21]/88 px-4 py-2 text-xs font-bold uppercase text-white backdrop-blur-sm">{label}</figcaption>
    <span className="about-corner about-corner-top" aria-hidden="true" /><span className="about-corner about-corner-bottom" aria-hidden="true" />
  </motion.figure>;
}

function ScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 58%", "end 58%"] });
  const [, forceRender] = useReducer((value) => value + 1, 0);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(storySteps.length - 1, Math.max(0, Math.floor(progress * storySteps.length)));
    if (next !== activeRef.current) { activeRef.current = next; forceRender(); }
  });

  const active = activeRef.current;
  const ActiveIcon = storySteps[active].icon;
  return <section ref={sectionRef} className="about-grid-dark overflow-clip bg-[#151b21] py-16 text-white md:py-20">
    <div className="container-wide">
      <Reveal><p className="eyebrow text-[#F9A900]">Scroll Story</p><h2 className="section-title mt-3 text-white">From Site Risk to Safer Execution</h2></Reveal>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)] lg:gap-12">
        <div className="lg:sticky lg:top-[116px]">
          <motion.div className="story-visual" layout transition={{ type: "spring", stiffness: 170, damping: 24 }}>
            <div className="story-rail" aria-label={`Active story step ${active + 1} of 4`}>{storySteps.map((step, index) => { const Icon = step.icon; return <div key={step.number} className={`story-rail-item ${index === active ? "is-active" : ""}`}><span><Icon size={21} /></span><small>{step.label}</small></div>; })}</div>
            <motion.div key={storySteps[active].number} initial={reduced ? false : { opacity: 0, y: 18, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .42, ease: [0.22, 1, 0.36, 1] }} className="story-visual-content">
              <div className="flex items-center gap-4"><span className="story-icon"><ActiveIcon size={32} /></span><div><p className="text-xs font-bold uppercase text-[#F9A900]">{storySteps[active].label}</p><p className="mt-1 text-sm text-white/60">Technical review stage {active + 1} of 4</p></div></div>
              <span className="mt-8 inline-flex bg-[#F9A900] px-4 py-2 text-xs font-bold uppercase text-[#171c21]">Active step {active + 1}</span>
              <h3 className="mt-5 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold uppercase leading-[.98] text-white">{storySteps[active].title}</h3>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/70">{storySteps[active].copy}</p>
            </motion.div>
          </motion.div>
        </div>
        <div className="grid gap-5 lg:gap-[28vh] lg:pb-[18vh]">
          {storySteps.map((step, index) => <motion.article key={step.number} className={`story-step ${index === active ? "is-active" : ""}`} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: .55 }} transition={{ duration: .48 }}>
            <span className="text-xs font-bold uppercase text-[#F9A900]">Step {step.number}</span><h3 className="mt-3 font-display text-2xl font-bold uppercase text-white md:text-3xl">{step.title}</h3><p className="mt-3 leading-7 text-white/65">{step.copy}</p>
          </motion.article>)}
        </div>
      </div>
    </div>
  </section>;
}

export default function About() {
  const { image } = useCmsImages();
  return <div className="flex min-h-screen flex-col"><SeoHead title="About AM Building Solutions | Safety Nets & Edge Protection UAE" description="AM Building Solutions provides engineered safety nets, temporary edge protection systems, fall prevention, debris containment, and temporary works safety solutions for construction projects across the UAE and Middle East." path="/about" schema={aboutSchema} /><Navbar/><main className="flex-1 overflow-clip">
    <div className="about-video-section"><ManagedBackgroundVideo id="aboutHeroVideo" className="about-video-frame premium-video-frame" videoClassName="about-bg-video" poster={image("/assets/images/about-hero-poster.jpg")} webmSrc="/assets/videos/about-hero-video.webm" mp4Src="/assets/videos/about-hero-video.mp4" mobileMp4Src="/assets/videos/about-hero-video-mobile.mp4" buttonClassName="about-sound-btn" /></div>

    <section className="about-grid-dark bg-[#171c21] py-16 text-white md:py-20"><div className="container-wide"><Reveal className="max-w-5xl"><p className="eyebrow text-[#F9A900]">AM Building Solutions | Dubai, UAE</p><h1 className="mt-4 font-display text-[clamp(2.7rem,6vw,5.4rem)] font-extrabold uppercase leading-[.96] text-white">Engineering Safer Construction Environments</h1><p className="mt-6 max-w-4xl text-lg leading-8 text-white/72">AM Building Solutions delivers practical safety net, edge protection and temporary works solutions designed to support safer, faster and better-controlled construction sites across the UAE and Middle East.</p><div className="mt-8 flex flex-wrap gap-2">{["Safety Nets","Edge Protection","Temporary Works","Fall Prevention","Site Protection"].map((label, index) => <motion.span key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .2 + index * .07 }} className="technical-chip">{label}</motion.span>)}</div></Reveal></div></section>

    <section className="section-band bg-white"><div className="container-wide grid items-center gap-10 lg:grid-cols-2 lg:gap-16"><Reveal direction="left"><p className="eyebrow text-accent">Built Around Safety</p><h2 className="section-title mt-3">Practical Protection for Active Sites</h2><p className="mt-5 leading-8 text-muted-foreground">AM Building Solutions develops and supplies practical construction safety solutions for active sites, including construction safety net systems, safety catch nets, fall arrest safety nets, debris safety nets, edge protection systems and temporary works support.</p><p className="mt-4 leading-8 text-muted-foreground">AMBS supports contractors looking for a safety net in Dubai or across the UAE with project-specific review, installation guidance and a clear path toward an EN 1263 safety net arrangement where applicable.</p></Reveal><ImageFrame src={aboutImages.aboutTeamImage} alt="AM Building Solutions construction safety solutions" label="AMBS project support" /></div></section>

    <section className="section-band bg-[#f3f4f4]"><div className="container-wide grid items-center gap-10 lg:grid-cols-2 lg:gap-16"><div className="relative grid gap-4 sm:grid-cols-[1fr_.42fr] lg:grid-cols-1"><ImageFrame src={aboutImages.edgeProtectionImage} alt="Temporary edge protection system for construction site" label="Edge protection UAE" side="left" /><figure className="relative hidden aspect-[4/3] overflow-hidden rounded-md border border-border sm:block lg:absolute lg:-bottom-8 lg:-right-4 lg:h-36 lg:w-48 lg:shadow-xl"><img src={image(aboutImages.safetyNetImage)} alt="Safety net installation for construction site" loading="lazy" className="h-full w-full object-cover"/><figcaption className="absolute bottom-0 left-0 bg-[#171c21]/90 px-3 py-2 text-[10px] font-bold uppercase text-white">Safety net UAE</figcaption></figure></div><Reveal direction="right"><p className="eyebrow text-accent">Developed Through Site Experience</p><h2 className="section-title mt-3">Engineering Knowledge Meets Product Development</h2><p className="mt-5 leading-8 text-muted-foreground">Our solutions are shaped by real site requirements, fabrication knowledge, engineering coordination and continuous product improvement. Temporary edge protection systems, construction edge protection and EN 13374 edge protection require the complete system and fixing interface to be reviewed, not only an individual component.</p><div className="mt-7 flex flex-wrap gap-2">{["Safety Nets","Edge Protection","Temporary Works","Fall Prevention","Site Protection"].map((label) => <span key={label} className="keyword-chip">{label}</span>)}</div></Reveal></div></section>

    <ScrollStory />

    <section className="section-band bg-white"><div className="container-wide"><Reveal><p className="eyebrow text-accent">AMBS Strengths</p><h2 className="section-title mt-3">Principles Behind Every Safer Site</h2></Reveal><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{values.map(([Icon, title, copy], index) => <motion.article key={String(title)} className="value-card" initial={{ opacity: 0, y: 22, scale: .985 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .06, duration: .45 }}><span className="value-icon"><Icon size={23}/></span><h3>{String(title)}</h3><p>{String(copy)}</p></motion.article>)}</div></div></section>

    <section className="section-band bg-[#f3f4f4]"><div className="container-wide grid items-start gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16"><ImageFrame src={aboutImages.engineeringSupportImage} alt="Engineering support for temporary works safety" label="Engineering support" side="left" /><div><Reveal direction="right"><p className="eyebrow text-accent">Complete Safety Support</p><h2 className="section-title mt-3">More Than Products, Complete Safety Support</h2><p className="mt-5 leading-8 text-muted-foreground">AM Building Solutions supports contractors with product selection, site safety review, installation guidance, inspection support, technical coordination, training and custom temporary works fabrication.</p></Reveal><div className="mt-8 grid gap-3 sm:grid-cols-2">{supportServices.map(([Icon, title, copy], index) => <motion.article key={String(title)} className="support-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ delay: index * .06 }}><Icon size={21}/><div><h3>{String(title)}</h3><p>{String(copy)}</p></div></motion.article>)}</div></div></div></section>

    <section className="relative isolate overflow-hidden py-20 text-white md:py-28"><img src={image(aboutImages.siteProtectionImage)} alt="Fall prevention and site protection solutions" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover"/><div className="absolute inset-0 -z-10 bg-[#111]/78"/><div className="container-wide"><Reveal className="max-w-4xl"><p className="eyebrow text-[#F9A900]">Middle East Construction Safety</p><h2 className="section-title mt-3 text-white">Trusted for Demanding Construction Environments</h2><p className="mt-5 text-lg leading-8 text-white/72">Our site protection systems support high-rise buildings, facade works, slab edge protection, debris containment, loading platforms and temporary works safety requirements across the UAE and Middle East.</p></Reveal></div></section>

    <section className="relative isolate overflow-hidden py-16 text-white md:py-20"><img src={image(aboutImages.ctaBackgroundImage)} alt="AM Building Solutions construction safety solutions" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover"/><div className="absolute inset-0 -z-10 bg-[#9f0906]/92"/><div className="container-wide"><Reveal className="max-w-4xl"><h2 className="section-title text-white">Let's Build Safer Sites Together</h2><p className="mt-5 text-lg leading-8 text-white/82">Whether your project requires safety nets, temporary edge protection, debris containment, loading platforms or custom temporary works solutions, AM Building Solutions is ready to support.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/products" className="ambs-button-yellow">Explore Products & Solutions <ArrowRight size={17}/></Link><Link to="/contact" className="hero-secondary-button">Contact Us</Link></div></Reveal></div></section>
  </main><Footer/></div>;
}


