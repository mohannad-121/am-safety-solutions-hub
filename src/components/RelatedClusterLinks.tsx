import { Link, useLocation } from "react-router-dom";
import { ArrowRight, BookOpen, FileText, Layers3 } from "lucide-react";
import { clusterForPath } from "@/lib/topicClusters";

export function RelatedClusterLinks() {
  const { pathname } = useLocation();
  const cluster = clusterForPath(pathname);
  if (!cluster) return null;
  const links = [cluster.pillar, ...cluster.supporting, ...cluster.products, ...cluster.resources]
    .filter((link, index, all) => link.path !== pathname && all.findIndex((candidate) => candidate.path === link.path) === index);

  return <section className="section-band bg-[#f4f5f6]" data-topic-cluster={cluster.id} aria-labelledby={`${cluster.id}-links`}>
    <div className="container-wide">
      <p className="eyebrow text-accent">Related technical guidance</p>
      <h2 id={`${cluster.id}-links`} className="section-title mt-3">Explore the {cluster.label} topic</h2>
      <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link, index) => <Link key={link.path} to={link.path} className="flex min-h-20 items-center gap-3 border border-border bg-white p-4 font-semibold hover:border-accent hover:text-accent">
          {index === 0 ? <Layers3 className="shrink-0" /> : index % 2 ? <BookOpen className="shrink-0" /> : <FileText className="shrink-0" />}
          <span>{link.label}</span><ArrowRight className="ml-auto shrink-0" size={17}/>
        </Link>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><Link to="/quote" className="ambs-button">Request a {cluster.label} quotation</Link><Link to="/quote?type=documentation" className="secondary-button">Request technical documentation</Link><Link to="/contact" className="secondary-button">Contact technical support</Link></div>
    </div>
  </section>;
}
