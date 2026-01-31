import { motion } from "framer-motion";
import { Clock, Users, Wrench, HeartHandshake, TrendingUp, Globe2 } from "lucide-react";

const reasons = [
  {
    icon: Clock,
    title: "25+ Years Experience",
    description: "Decades of expertise in construction safety systems across diverse projects and industries.",
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "Certified safety professionals providing consultation, installation, and training services.",
  },
  {
    icon: Wrench,
    title: "Custom Solutions",
    description: "Tailored safety systems designed to meet your specific site requirements and challenges.",
  },
  {
    icon: HeartHandshake,
    title: "Full Support",
    description: "Comprehensive after-sales support including maintenance, inspection, and recertification.",
  },
  {
    icon: TrendingUp,
    title: "Quality Products",
    description: "Premium materials and components meeting the highest European safety standards.",
  },
  {
    icon: Globe2,
    title: "Global Reach",
    description: "Serving clients in over 50 countries with reliable delivery and local support.",
  },
];

export function WhyUsSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-accent font-semibold mb-4"
          >
            Why Choose Us
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Your Trusted Partner in
            <span className="text-accent"> Construction Safety</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            AM Building Solutions combines technical expertise with unwavering commitment 
            to worker safety, delivering solutions you can trust.
          </motion.p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <reason.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{reason.title}</h3>
                  <p className="text-muted-foreground">{reason.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-2xl bg-secondary"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5000+", label: "Projects Delivered" },
              { value: "100%", label: "Safety Record" },
              { value: "24/7", label: "Support Available" },
              { value: "50+", label: "Countries" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
