import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/SeoHead";
import { useCmsContent } from "@/hooks/use-cms";
const docs = [
  "Edge Protection Catalogue UAE",
  "Mesh Barrier Technical Data Sheet",
  "Safety Post and Socket Base Data Sheets",
  "Slab Grab and I-Beam Clamp Data Sheets",
  "EN 13374 Edge Protection Guide",
  "Edge Protection Method Statement Sample",
  "Edge Protection Risk Assessment Sample",
  "Edge Protection Inspection Checklist",
  "Edge Protection Handover Checklist",
  "Safety Net Technical Data Sheet",
  "Safety Net Inspection Checklist",
  "Safety Net Risk Assessment Checklist",
  "Safety Net Method Statement Checklist",
  "Loading Platform Inspection Checklist",
  "Loading Platform Permit-to-Load Checklist",
  "General RAMS Preparation Checklist",
  "Training Center Brochure",
];
export default function Downloads() {
  const records = useCmsContent();
  const publishedDocuments = records.filter(
    (item) => item.contentType === "document" && item.status === "published" && item.publishedData.fileUrl,
  );
  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Technical Downloads"
        description="Request AMBS edge protection and safety net technical data, inspection checklists and project submittal documents."
        path="/edge-protection-downloads"
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy text-white py-20">
          <div className="container-wide">
            <h1 className="text-4xl md:text-5xl font-bold">
              Technical Download Center
            </h1>
            <p className="text-white/75 mt-5 max-w-2xl">
              Request current technical sheets and project documents from AMBS.
              Documents are issued for the selected system and reviewed against
              site conditions.
            </p>
          </div>
        </section>
        <section className="py-16">
          <div className="container-wide grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedDocuments.map((document) => (
              <article key={document.id} className="border border-border bg-white rounded-md p-6">
                <p className="text-xs font-bold text-accent mb-3">PUBLISHED DOCUMENT</p>
                <h2 className="font-bold text-lg mb-3">{document.title}</h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {String(document.publishedData.summary || "Current AMBS technical document.")}
                </p>
                <a href={String(document.publishedData.fileUrl)} target="_blank" rel="noreferrer" className="font-semibold text-accent">
                  Open document
                </a>
              </article>
            ))}
            {docs.map((d) => (
              <article
                key={d}
                className="border border-border bg-white rounded-md p-6"
              >
                <p className="text-xs font-bold text-accent mb-3">
                  TECHNICAL DOCUMENT
                </p>
                <h2 className="font-bold text-lg mb-3">{d}</h2>
                <p className="text-muted-foreground text-sm mb-5">
                  Availability and revision are confirmed for your project
                  enquiry.
                </p>
                <Link to="/contact" className="font-semibold text-accent">
                  Request document
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
