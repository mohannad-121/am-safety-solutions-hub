import { Link, useLocation } from "react-router-dom";
import { FileUp, MessageSquareText } from "lucide-react";
import { whatsappUrl } from "@/config/company";
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
            <a href={whatsappUrl(message)} target="_blank" rel="noreferrer" className="quick-action bg-[#25D366] text-[#082b16] hover:bg-[#33e477]"><WhatsAppIcon className="h-5 w-5" /> WhatsApp</a>
          </div>
        </div>
      </aside>
      <a href={whatsappUrl(message)} target="_blank" rel="noreferrer" className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 md:bottom-20 md:right-6" aria-label="Message AM Building Solutions on WhatsApp" title="WhatsApp AMBS">
        <WhatsAppIcon className="h-8 w-8" />
      </a>
    </>
  );
}
