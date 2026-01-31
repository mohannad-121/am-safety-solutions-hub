import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Shield, Award, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/hero-edge-protection.mp4";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-navy">
      {/* Content Container - Split Layout */}
      <div className="container-wide relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="order-2 lg:order-1">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent mb-8"
          >
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">EN 13374 Certified Systems</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6"
          >
            Building Safety
            <span className="block text-accent">Without Compromise</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl"
          >
            AM Building Solutions provides industry-leading edge protection, safety nets, 
            and fall prevention systems. Trusted by construction companies worldwide 
            for uncompromising worker safety.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/quote">
                Request a Quote
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/products">
                <Play className="h-5 w-5" />
                View Our Systems
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "25+", label: "Years Experience" },
              { value: "5000+", label: "Projects Completed" },
              { value: "100%", label: "Safety Record" },
              { value: "50+", label: "Countries Served" },
            ].map((stat, index) => (
              <div key={index} className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
          </div>

          {/* Right Side - Video */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-[400px] lg:h-[600px] object-cover"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-tr from-navy/30 to-transparent" />
              
              {/* Certification Badges on Video */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                {["EN 13374", "ISO 9001", "EN 1263-1"].map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg glass-dark backdrop-blur-md"
                  >
                    <Award className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-primary-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
