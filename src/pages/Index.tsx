import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeFeatureSections } from "@/components/home/HomeFeatureSections";
import { SeoHead } from "@/components/SeoHead";
import { Chatbot } from "@/components/ChatbotEnhanced";

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "name": "AM Building Solutions DWC LLC", "alternateName": "AMBS", "url": "https://www.ambs.ae", "email": "malheeh@ambs.ae", "address": { "@type": "PostalAddress", "addressLocality": "Dubai", "addressCountry": "AE" } },
    { "@type": "WebSite", "name": "AM Building Solutions", "url": "https://www.ambs.ae", "potentialAction": { "@type": "SearchAction", "target": "https://www.ambs.ae/products?search={search_term_string}", "query-input": "required name=search_term_string" } }
  ]
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SeoHead title="AM Building Solutions | Safety Nets & Edge Protection UAE" description="AM Building Solutions provides safety nets, temporary edge protection systems, debris containment, loading platforms, and custom temporary works safety solutions for construction projects across the UAE and Middle East." path="/" schema={homeSchema} />
      <main className="flex-1">
        <HeroSection />
        <HomeFeatureSections />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
