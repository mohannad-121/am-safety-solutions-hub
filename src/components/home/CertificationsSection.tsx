import { motion } from "framer-motion";
import { Award, CheckCircle, FileCheck, Shield } from "lucide-react";

const certifications = [
  {
    code: "EN 13374",
    title: "Temporary Edge Protection Systems",
    description: "European standard for temporary edge protection systems used during construction",
    icon: Shield,
  },
  {
    code: "EN 1263-1",
    title: "Safety Nets",
    description: "Safety requirements and test methods for safety nets",
    icon: Shield,
  },
  {
    code: "EN 795",
    title: "Personal Fall Protection",
    description: "Anchor devices for personal fall protection equipment",
    icon: Shield,
  },
  {
    code: "ISO 9001:2015",
    title: "Quality Management",
    description: "International standard for quality management systems",
    icon: Award,
  },
];

const features = [
  "Third-party tested and certified products",
  "Regular quality audits and inspections",
  "Full traceability of materials and components",
  "Comprehensive documentation and certificates",
  "Ongoing compliance monitoring",
  "Technical support and training",
];

export function CertificationsSection() {
  return (
    <section className="section-padding bg-navy text-primary-foreground overflow-hidden">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Certifications */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-accent font-semibold mb-4"
            >
              Certifications & Standards
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              Meeting the Highest
              <span className="text-accent"> Safety Standards</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-primary-foreground/70 mb-8"
            >
              All our products are rigorously tested and certified to meet 
              European and international safety standards, ensuring maximum 
              protection for workers at height.
            </motion.p>

            {/* Certification Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-5 rounded-lg bg-navy-light border border-primary-foreground/10 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <cert.icon className="h-5 w-5 text-accent" />
                    <span className="font-bold text-accent">{cert.code}</span>
                  </div>
                  <h4 className="font-semibold mb-1">{cert.title}</h4>
                  <p className="text-sm text-primary-foreground/60">{cert.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Quality Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-navy-light to-navy border border-primary-foreground/10">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck className="h-8 w-8 text-accent" />
                <h3 className="text-2xl font-bold">Quality Assurance</h3>
              </div>
              
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-primary-foreground/80">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Decorative */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-accent/20 rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
