import { Link } from "react-router-dom";
import { ArrowRight, FileUp, ShieldCheck } from "lucide-react";
import { ManagedBackgroundVideo } from "@/components/video/ManagedBackgroundVideo";
import { useCmsImages } from "@/hooks/use-cms";

export function HeroSection() {
  const { image } = useCmsImages();
  const badges = ["EN 1263 Safety Net Systems", "EN 13374 Edge Protection Systems", "UAE & GCC Delivery", "Consultant-Ready Submittals", "Engineering Support"];
  return <ManagedBackgroundVideo id="landingHeroVideo" className="hero-video-section landing-video-frame premium-video-frame" videoClassName="hero-bg-video" poster={image("/assets/images/landing-hero-poster.jpg")} webmSrc="/assets/videos/landing-hero-video.webm" mp4Src="/assets/videos/landing-hero-video.mp4" mobileMp4Src="/assets/videos/landing-hero-video-mobile.mp4" buttonClassName="landing-sound-btn" loop>
    <div className="container-wide relative z-10 py-24 md:py-32 lg:py-36">
      <div className="max-w-5xl"><p className="eyebrow text-[#F9A900]">AM Building Solutions | Dubai, UAE</p><h1 className="hero-title mt-5">Engineered Safety Systems for Safer UAE Construction Sites</h1><p className="mt-6 max-w-4xl text-lg leading-8 text-white/90 md:text-xl">AM Building Solutions supplies and supports Safety Nets, Edge Protection Systems, Mesh Barriers, Loading Platforms, Crash Decking, Shaft Protection Gates, Hoist Gates, and engineered temporary works solutions for construction projects across the UAE and GCC.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><Link to="/quote" className="ambs-button min-h-12">Request a Quote <ArrowRight size={18} /></Link><Link to="/products" className="ambs-button-yellow min-h-12">Explore Products & Solutions</Link><Link to="/quote?type=drawings" className="hero-secondary-button min-h-12"><FileUp size={18} /> Send Drawings for Review</Link></div>
        <div className="mt-10 flex flex-wrap gap-2">{badges.map((badge) => <span key={badge} className="hero-badge"><ShieldCheck size={16} />{badge}</span>)}</div>
      </div>
    </div>
    <a href="#solutions" className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-xs font-bold uppercase text-white/70 hover:text-white">Explore systems</a>
  </ManagedBackgroundVideo>;
}
