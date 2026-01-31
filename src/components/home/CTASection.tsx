import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-accent to-safety-orange-dark relative overflow-hidden">
      {/* Safety Stripe Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="safety-stripe h-full" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent-foreground mb-6"
            >
              Ready to Enhance Your
              <span className="block">Worksite Safety?</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-accent-foreground/80 mb-8"
            >
              Get in touch with our safety experts to discuss your project requirements 
              and receive a customized solution quote.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="xl"
                className="bg-navy hover:bg-navy-light text-primary-foreground shadow-xl"
                asChild
              >
                <Link to="/quote">
                  Request a Quote
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-accent-foreground/30 bg-transparent text-accent-foreground hover:bg-accent-foreground/10"
                asChild
              >
                <Link to="/contact">
                  <Phone className="h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <Link
              to="/documentation"
              className="group p-6 rounded-xl bg-accent-foreground/10 border border-accent-foreground/20 hover:bg-accent-foreground/20 transition-colors"
            >
              <FileText className="h-8 w-8 text-accent-foreground mb-4" />
              <h3 className="font-bold text-accent-foreground mb-2">Technical Docs</h3>
              <p className="text-sm text-accent-foreground/70 mb-3">
                Download product datasheets and installation guides
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-foreground group-hover:gap-3 transition-all">
                View Documentation
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              to="/projects"
              className="group p-6 rounded-xl bg-accent-foreground/10 border border-accent-foreground/20 hover:bg-accent-foreground/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent-foreground flex items-center justify-center text-accent font-bold text-sm">
                  5K+
                </div>
              </div>
              <h3 className="font-bold text-accent-foreground mb-2">Case Studies</h3>
              <p className="text-sm text-accent-foreground/70 mb-3">
                Explore our completed projects and success stories
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-foreground group-hover:gap-3 transition-all">
                View Projects
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
