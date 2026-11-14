import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, BookOpen, ChevronDown, ClipboardCheck, Layers3, Mail, Menu, Search, ShieldCheck, Sparkles, Wrench, X } from "lucide-react";
import { SiteSearch } from "@/components/layout/SiteSearch";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { company, whatsappUrl } from "@/config/company";
import { warmRoute } from "@/lib/siteAccelerator";
import { useCmsImages } from "@/hooks/use-cms";

type NavChild = { name: string; href: string; description: string; badge: string; icon: typeof ShieldCheck };
type NavItem = { name: string; href: string; children?: NavChild[] };

const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Solutions", href: "/products", children: [
    { name: "Safety Net Systems", href: "/products/safety-nets", description: "Catch, horizontal, vertical and debris netting.", badge: "EN 1263", icon: ShieldCheck },
    { name: "Edge Protection", href: "/edge-protection-systems-uae", description: "Mesh barriers, posts, toe boards and fixings.", badge: "EN 13374", icon: Layers3 },
    { name: "Loading Platforms", href: "/products/loading-platforms", description: "Material access with technical review.", badge: "Engineering", icon: Wrench },
    { name: "High-Risk Protection", href: "/high-risk-products", description: "Crash decks, shaft gates and hoist gates.", badge: "Site review", icon: ShieldCheck },
    { name: "Custom Fabrication", href: "/steel-fabrication", description: "Project-specific steel and temporary works.", badge: "Custom", icon: Sparkles },
    { name: "All Products", href: "/products", description: "Explore the complete AMBS system range.", badge: "12 systems", icon: Layers3 },
  ] },
  { name: "Services", href: "/engineering-solutions", children: [
    { name: "Engineering & Submittals", href: "/engineering-solutions", description: "Technical coordination, drawings and submittal support.", badge: "Engineering", icon: Wrench },
    { name: "Inspection Support", href: "/edge-protection-inspection", description: "Inspection guidance, checklists and handover support.", badge: "Inspection", icon: ClipboardCheck },
    { name: "Training Center", href: "/edge-protection-training", description: "Installation and inspection learning for site teams.", badge: "Training", icon: BookOpen },
    { name: "Work at Height Safety", href: "/work-at-height-safety-uae", description: "Collective fall prevention, arrest and inspection guidance.", badge: "UAE", icon: ShieldCheck },
    { name: "Temporary Works Safety", href: "/temporary-works-safety-solutions-uae", description: "Integrated systems, interfaces and technical controls.", badge: "Temporary works", icon: Wrench },
  ] },
  { name: "Projects", href: "/projects" },
  { name: "Resources", href: "/articles", children: [
    { name: "Technical Articles", href: "/articles", description: "Practical safety guides for UAE construction teams.", badge: "Guides", icon: BookOpen },
    { name: "RAMS Resource Hub", href: "/resources/risk-assessment-method-statement", description: "Risk assessment and method statement guidance.", badge: "RAMS", icon: ClipboardCheck },
    { name: "Standards", href: "/standards/en-13374-edge-protection", description: "BS EN 13374:2025 edge protection guidance.", badge: "Standards", icon: ShieldCheck },
    { name: "Downloads", href: "/edge-protection-downloads", description: "Request current technical documents and checklists.", badge: "Documents", icon: ClipboardCheck },
    { name: "FAQ", href: "/faq", description: "Answers for contractors, consultants and HSE teams.", badge: "FAQ", icon: BookOpen },
  ] },
  { name: "Contact", href: "/contact" },
];

function activeFor(item: NavItem, pathname: string) {
  return pathname === item.href || Boolean(item.children?.some((child) => pathname === child.href));
}

export function Navbar() {
  const { image } = useCmsImages();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>("Solutions");
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); setOpenMenu(null); }, [location.pathname]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpenMenu(null); setMobileOpen(false); }
      if ((event.key === "/" || (event.ctrlKey && event.key.toLowerCase() === "k")) && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  const whatsappMessage = "Hello AM Building Solutions, I need support for a UAE construction project. Please contact me about safety nets, edge protection or temporary works.";
  return <>
    <div className="hidden bg-[#151a1f] text-white/70 lg:block"><div className="container-wide flex h-9 items-center justify-between text-xs"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#F9A900]"/>Dubai, UAE | Engineered construction safety systems</span><a href={`mailto:${company.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-white"><Mail size={14}/>{company.email}</a></div></div>
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 shadow-[0_8px_30px_rgba(17,24,39,.06)] backdrop-blur-xl">
      <nav className="container-wide flex min-h-[72px] items-center gap-3" aria-label="Main navigation">
        <Link to="/" className="mr-auto flex shrink-0 items-center rounded-sm bg-white p-1" aria-label="AM Building Solutions home" onPointerEnter={() => warmRoute("/")}><img src={image("/assets/brand/ambs-logo.svg")} alt="AM Building Solutions" width="184" height="69" className="h-12 w-auto max-w-[150px]" loading="eager"/></Link>

        <div className="hidden items-center rounded-md border border-border/80 bg-[#f5f6f7] p-1 xl:flex">
          {navigation.map((item) => item.children ? <div key={item.name} className="relative" onPointerEnter={() => setOpenMenu(item.name)} onPointerLeave={() => setOpenMenu(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null); }}>
            <button type="button" className={`modern-nav-link flex items-center gap-1 ${activeFor(item, location.pathname) ? "is-active" : ""}`} aria-expanded={openMenu === item.name} aria-controls={`${item.name.toLowerCase()}-menu`} onClick={() => setOpenMenu((current) => current === item.name ? null : item.name)}>{item.name}<ChevronDown size={14} className={`transition-transform ${openMenu === item.name ? "rotate-180" : ""}`}/></button>
            {openMenu === item.name && <div id={`${item.name.toLowerCase()}-menu`} className={`absolute top-full pt-3 ${item.name === "Solutions" ? "left-1/2 w-[760px] -translate-x-[38%]" : "left-0 w-[440px]"}`}><div className="mega-menu-panel"><div className="flex items-end justify-between border-b border-slate-200 px-6 pb-4"><div><p className="text-xs font-bold uppercase text-[#b10b08]">{item.name}</p><p className="mt-1 text-sm text-slate-600">Explore AM Building Solutions support and resources.</p></div><Link to={item.href} className="mega-menu-all" onClick={() => setOpenMenu(null)}>View all <ArrowRight size={15}/></Link></div><div className={`grid gap-2 p-4 ${item.name === "Solutions" ? "grid-cols-2" : "grid-cols-1"}`}>{item.children.map(({ icon: Icon, ...child }) => <Link key={child.href} to={child.href} className="mega-product-link" onPointerEnter={() => warmRoute(child.href)} onClick={() => setOpenMenu(null)}><span className="mega-product-icon"><Icon size={20}/></span><span className="min-w-0"><strong>{child.name}</strong><small>{child.description}</small></span><em>{child.badge}</em></Link>)}</div></div></div>}
          </div> : <NavLink key={item.href} to={item.href} onPointerEnter={() => warmRoute(item.href)} className={({ isActive }) => `modern-nav-link ${isActive ? "is-active" : ""}`}>{item.name}</NavLink>)}
        </div>

        <button type="button" onClick={() => setSearchOpen(true)} className="icon-button" aria-label="Search the website" title="Search"><Search size={21}/></button>
        <a href={whatsappUrl(whatsappMessage)} target="_blank" rel="noreferrer" className="icon-button bg-[#16883f]/[.08] text-[#16883f]" aria-label="WhatsApp AM Building Solutions" title="WhatsApp"><WhatsAppIcon className="h-5 w-5"/></a>
        <Link to="/quote" className="ambs-button hidden 2xl:inline-flex">Request a Quote</Link>
        <button type="button" className="icon-button xl:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X/> : <Menu/>}</button>
      </nav>

      {mobileOpen && <div className="max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t border-border bg-[#f5f6f7] px-4 py-5 xl:hidden"><div className="mx-auto max-w-3xl"><p className="px-3 pb-3 text-xs font-bold uppercase text-muted-foreground">Explore AMBS</p>{navigation.map((item) => item.children ? <div key={item.name} className="mb-2"><button type="button" className="mobile-products-toggle" aria-expanded={mobileSection === item.name} onClick={() => setMobileSection((current) => current === item.name ? null : item.name)}>{item.name}<ChevronDown className={`h-4 w-4 transition-transform ${mobileSection === item.name ? "rotate-180" : ""}`}/></button>{mobileSection === item.name && <div className="mt-2 grid gap-2 sm:grid-cols-2"><Link to={item.href} className="mobile-nav-card" onClick={() => setMobileOpen(false)}>View all {item.name}<ArrowRight size={16}/></Link>{item.children.map((child) => <Link key={child.href} to={child.href} className="mobile-nav-card" onClick={() => setMobileOpen(false)}><span>{child.name}<small>{child.badge}</small></span><ArrowRight size={16}/></Link>)}</div>}</div> : <Link key={item.href} to={item.href} className="mobile-nav-card mb-2" onClick={() => setMobileOpen(false)}>{item.name}<ArrowRight size={16}/></Link>)}<div className="sticky bottom-0 mt-5 grid grid-cols-2 gap-2 bg-[#f5f6f7] py-2"><a href={whatsappUrl(whatsappMessage)} target="_blank" rel="noreferrer" className="secondary-button text-[#16883f]"><WhatsAppIcon className="h-5 w-5"/>WhatsApp</a><Link to="/quote" className="ambs-button" onClick={() => setMobileOpen(false)}>Request a Quote</Link></div></div></div>}
    </header>
    <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)}/>
  </>;
}
