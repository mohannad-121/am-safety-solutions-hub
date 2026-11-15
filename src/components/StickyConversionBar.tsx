import { Link, NavLink, useLocation } from "react-router-dom";
import { FileUp, House, LayoutGrid, MessageSquareText } from "lucide-react";
import { company, whatsappUrl } from "@/config/company";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function StickyConversionBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  const message = "Hello AM Building Solutions, I would like to discuss a construction safety or temporary works requirement. Project location: ____. Product/system: ____. Required date: ____.";
  return (
    <>
      <aside className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-white/10 bg-[#171c21] text-white shadow-2xl md:block" aria-label="Quick project actions">
        <div className="container-wide flex h-16 items-center justify-between gap-5">
          <p className="text-sm"><strong>Need a consultant-ready solution?</strong> Send drawings, quantities and site photos for review.</p>
          <div className="flex items-center gap-2">
            <Link to="/quote" className="quick-action"><MessageSquareText size={17} /> Request quote</Link>
            <Link to="/quote?type=drawings" className="quick-action"><FileUp size={17} /> Send drawings</Link>
            {company.whatsappNumber && <a href={whatsappUrl(message)} target="_blank" rel="noreferrer" className="quick-action bg-[#25D366] text-[#082b16] hover:bg-[#33e477]"><WhatsAppIcon className="h-5 w-5" /> WhatsApp</a>}
          </div>
        </div>
      </aside>
      <aside className="mobile-action-dock md:hidden" aria-label="Quick project actions">
        <NavLink to="/" end className={({ isActive }) => `mobile-dock-action ${isActive ? "is-active" : ""}`}><House aria-hidden="true" /><span>Home</span></NavLink>
        <NavLink to="/products" className={({ isActive }) => `mobile-dock-action ${isActive ? "is-active" : ""}`}><LayoutGrid aria-hidden="true" /><span>Solutions</span></NavLink>
        <Link to="/quote" className="mobile-dock-action is-primary"><MessageSquareText aria-hidden="true" /><span>Get Quote</span></Link>
        {company.whatsappNumber && <a href={whatsappUrl(message)} target="_blank" rel="noreferrer" className="mobile-dock-action is-whatsapp" aria-label="Message AM Building Solutions on WhatsApp"><WhatsAppIcon aria-hidden="true" /><span>WhatsApp</span></a>}
      </aside>
    </>
  );
}
