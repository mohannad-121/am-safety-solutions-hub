import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/SeoHead";
import { articles } from "@/data/ambs";
import { useCmsImages } from "@/hooks/use-cms";

export default function Articles() {
  const { image } = useCmsImages();
  return (
    <div className="flex min-h-screen flex-col">
      <SeoHead title="Technical Articles & Construction Safety Guides UAE" description="AMBS technical guides for safety nets, EN 1263, edge protection, BS EN 13374, mesh barriers, loading platforms, shaft gates and construction debris containment." path="/articles" />
      <Navbar />
      <main className="flex-1">
        <section className="bg-[#20262b] py-20 text-white">
          <div className="container-wide">
            <p className="eyebrow text-[#F9A900]">AMBS Knowledge Center</p>
            <h1 className="hero-title mt-4 text-[52px] md:text-[70px]">Technical Articles & Safety Guides</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">Practical information for contractors, consultants, HSE managers, procurement teams and temporary works coordinators across the UAE and GCC.</p>
          </div>
        </section>
        <section className="section-band bg-[#f3f4f4]">
          <div className="container-wide grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map(article => (
              <article key={article.slug} className="article-card">
                <img src={image(article.image)} alt={`${article.title} guide`} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                <div className="p-6">
                  <span className="text-xs font-bold uppercase text-accent">{article.category}</span>
                  <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-tight">{article.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.summary}</p>
                  <Link to={`/articles/${article.slug}`} className="ambs-text-link mt-5">Read Article <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
