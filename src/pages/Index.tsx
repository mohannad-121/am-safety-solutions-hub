import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { CertificationsSection } from "@/components/home/CertificationsSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { CTASection } from "@/components/home/CTASection";
import { Chatbot } from "@/components/ChatbotEnhanced";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <IndustriesSection />
        <CertificationsSection />
        <WhyUsSection />
        <CTASection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
