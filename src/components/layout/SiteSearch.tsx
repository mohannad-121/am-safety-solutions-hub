import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowUpRight, Sparkles } from "lucide-react";
import { searchSite } from "@/lib/siteSearch";

export function SiteSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchSite(query, query ? 12 : 8), [query]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 30);
    const keydown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", keydown); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-[#101418]/80 backdrop-blur-sm p-4 md:p-10" role="dialog" aria-modal="true" aria-label="Search the AMBS website" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 md:px-6">
          <Search className="text-accent" aria-hidden="true" />
          <label htmlFor="site-search" className="sr-only">Search products, standards, articles and services</label>
          <input ref={inputRef} id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} className="h-16 flex-1 bg-transparent text-lg outline-none" placeholder="Try safety net, edge protction, debries net..." autoComplete="off" />
          <button type="button" onClick={onClose} aria-label="Close search" className="icon-button"><X /></button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-3 md:p-5">
          <p className="flex items-center gap-2 px-3 pb-3 text-xs font-bold uppercase text-muted-foreground"><Sparkles size={14}/>{query ? `${results.length} predicted results` : "Popular pages"}</p>
          {results.map((item) => (
            <Link key={`${item.label}-${item.path}`} to={item.path} onClick={onClose} className="group flex items-center justify-between gap-4 rounded-sm px-3 py-4 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-accent">
              <span><span className="block text-xs font-bold uppercase text-accent">{item.label}</span><span className="mt-1 block font-semibold">{item.title}</span></span>
              <ArrowUpRight className="shrink-0 text-muted-foreground group-hover:text-accent" size={19} />
            </Link>
          ))}
          {!results.length && <div className="px-3 py-10"><p className="font-semibold">No close match found.</p><p className="mt-2 text-muted-foreground">Try a product, application, standard, document or project type. Spelling mistakes are handled automatically.</p><Link to="/contact" onClick={onClose} className="ambs-text-link mt-4">Ask the AMBS team</Link></div>}
        </div>
      </div>
    </div>
  );
}

