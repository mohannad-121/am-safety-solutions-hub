import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ArrowRight, Fence, Cable, HardHat, Anchor, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Fence,
    title: "Edge Protection Systems",
    description: "EN 13374 certified temporary and permanent edge protection for construction sites, rooftops, and elevated platforms.",
    href: "/products?category=edge-protection",
    highlight: true,
  },
  {
    icon: Shield,
    title: "Safety Net Systems",
    description: "EN 1263-1 compliant safety nets for fall arrest and debris containment across all construction phases.",
    href: "/products?category=safety-nets",
  },
  {
    icon: Cable,
    title: "Lifeline Systems",
    description: "Horizontal and vertical lifeline solutions for safe access during maintenance and construction work.",
    href: "/products?category=lifelines",
  },
  {
    icon: HardHat,
    title: "Fall Protection",
    description: "Comprehensive personal fall protection equipment and anchor point systems for worker safety.",
    href: "/products?category=fall-protection",
  },
  {
    icon: Anchor,
    title: "Anchor Points",
    description: "Permanent and temporary anchor systems designed for various roof types and building structures.",
    href: "/products?category=anchor-points",
  },
  {
    icon: Building2,
    title: "Custom Solutions",
    description: "Tailored safety systems designed for your specific project requirements and site conditions.",
    href: "/contact",
  },
];

export function ServicesSection() {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4"
          >
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Our Solutions</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Comprehensive Safety
            <span className="text-accent"> Systems</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            From edge protection to safety nets, we provide complete fall prevention 
            solutions meeting the highest international safety standards.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={service.href}
                className={`block h-full p-8 rounded-xl transition-all duration-300 group ${
                  service.highlight
                    ? "bg-navy text-primary-foreground hover:shadow-glow"
                    : "card-industrial hover:border-accent/50"
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-lg mb-6 ${
                    service.highlight
                      ? "bg-accent text-accent-foreground"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  <service.icon className="h-7 w-7" />
                </div>
                
                <h3 className={`text-xl font-bold mb-3 ${
                  service.highlight ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {service.title}
                </h3>
                
                <p className={`mb-6 ${
                  service.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}>
                  {service.description}
                </p>
                
                <div className={`inline-flex items-center gap-2 font-medium transition-colors ${
                  service.highlight
                    ? "text-accent group-hover:text-accent"
                    : "text-accent group-hover:text-accent"
                }`}>
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="safety" size="lg" asChild>
            <Link to="/products">
              Explore All Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
