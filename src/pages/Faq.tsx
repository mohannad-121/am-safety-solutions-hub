import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SeoHead } from "@/components/SeoHead";

const faqs = [
  ["What construction safety systems does AM Building Solutions supply?", "AM Building Solutions supports safety net systems, edge protection systems, mesh barriers, loading platforms, crash decking, shaft protection gates, hoist gates and engineered temporary works steel for UAE and GCC projects."],
  ["Can AM review project drawings and site photos?", "Yes. Drawings, dimensions and clear site photographs help the technical team review geometry, interfaces, access, quantities and installation constraints before recommending the next step."],
  ["Does AM provide consultant-ready technical submittals?", "Depending on the agreed scope, support can include product data, drawings, material details, method statements, inspection documents and engineering calculations where applicable."],
  ["Are safety net and edge protection systems project-specific?", "Yes. Selection and fixing arrangements depend on the actual structure, fall risk, loading, access, work sequence and project requirements. Website information does not replace project-specific review."],
  ["Does AM support projects outside Dubai?", "AM Building Solutions is based in Dubai and supports enquiries across Abu Dhabi, Sharjah, the wider UAE and GCC, subject to technical scope and logistics."],
  ["Can I send DWG, DXF, PDF drawings or site images with an enquiry?", "Yes. The Contact and Request a Quote forms accept common drawing and image formats for private technical review, with a maximum of five files and 10 MB per file."],
  ["Does AM offer training and inspection support?", "Training and inspection support can be coordinated for relevant safety systems based on the project, system type and agreed scope."],
  ["How do I request a quotation?", "Use the Request a Quote form and include the project location, required system, quantities, programme and available drawings. This helps the team route the enquiry efficiently."],
] as const;

export default function Faq() {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  return <div className="flex min-h-screen flex-col"><SeoHead title="Construction Safety Systems FAQ UAE | AM Building Solutions" description="Answers about AM Building Solutions safety nets, edge protection, mesh barriers, temporary works, technical submittals, drawings, training and UAE project support." path="/faq" schema={schema}/><Navbar/><main className="flex-1"><section className="bg-[#20262b] py-16 text-white md:py-20"><div className="container-wide"><p className="eyebrow text-[#F9A900]">Project Support</p><h1 className="section-title mt-3 text-white">Frequently Asked Questions</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">Practical answers for contractors, consultants, HSE teams and procurement departments reviewing construction safety systems and temporary works support.</p></div></section><section className="section-band bg-white"><div className="container-wide max-w-5xl"><div className="divide-y divide-border border-y border-border">{faqs.map(([question, answer]) => <details key={question}><summary className="cursor-pointer py-5 font-display text-xl font-bold uppercase">{question}</summary><p className="pb-6 leading-7 text-muted-foreground">{answer}</p></details>)}</div><div className="mt-10 flex flex-wrap gap-3"><Link to="/quote" className="ambs-button">Request a Quote</Link><Link to="/contact" className="secondary-button">Contact the Team</Link></div></div></section></main><Footer/></div>;
}
