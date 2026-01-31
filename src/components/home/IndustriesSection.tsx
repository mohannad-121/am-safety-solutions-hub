import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Factory, Ship, Plane, Train, Power, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const industries = [
  {
    icon: Building2,
    title: "Commercial Construction",
    description: "High-rise buildings, offices, shopping centers",
  },
  {
    icon: Factory,
    title: "Industrial Facilities",
    description: "Manufacturing plants, warehouses, refineries",
  },
  {
    icon: Ship,
    title: "Maritime & Offshore",
    description: "Shipyards, oil platforms, port facilities",
  },
  {
    icon: Plane,
    title: "Aviation",
    description: "Airports, hangars, control towers",
  },
  {
    icon: Train,
    title: "Infrastructure",
    description: "Bridges, tunnels, railway stations",
  },
  {
    icon: Power,
    title: "Energy Sector",
    description: "Power plants, wind farms, solar installations",
  },
];

export function IndustriesSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-steel-pattern opacity-50" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-accent font-semibold mb-4"
            >
              Industries We Serve
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            >
              Safety Solutions for
              <span className="text-accent"> Every Sector</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
            >
              From commercial construction to specialized industrial applications, 
              AM Building Solutions delivers tailored safety systems that meet 
              the unique requirements of each industry.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="navy" size="lg" asChild>
                <Link to="/industries">
                  View All Industries
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Industries Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <industry.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{industry.title}</h3>
                <p className="text-sm text-muted-foreground">{industry.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
