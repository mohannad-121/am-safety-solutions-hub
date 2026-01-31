import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Target, Users, Award, Clock, Globe2, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Worker safety is at the core of everything we do. Every product and solution we develop prioritizes protecting lives.",
  },
  {
    icon: Target,
    title: "Quality Excellence",
    description: "We never compromise on quality. Our products exceed international standards and undergo rigorous testing.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "We work closely with our clients to understand their unique challenges and deliver tailored solutions.",
  },
  {
    icon: Award,
    title: "Innovation",
    description: "Continuous improvement drives us to develop new technologies and better ways to protect workers.",
  },
];

const timeline = [
  { year: "1998", title: "Company Founded", description: "AM Building Solutions established with a mission to improve construction safety." },
  { year: "2005", title: "European Expansion", description: "Expanded operations across Europe, establishing partnerships in 15 countries." },
  { year: "2012", title: "ISO Certification", description: "Achieved ISO 9001 certification, demonstrating our commitment to quality." },
  { year: "2018", title: "Global Reach", description: "Extended our presence to 50+ countries with local support networks." },
  { year: "2024", title: "Industry Leader", description: "Recognized as a leading provider of construction safety solutions worldwide." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy text-primary-foreground py-20 md:py-32">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-block text-accent font-semibold mb-4">About Us</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Protecting Workers
                <span className="text-accent"> Since 1998</span>
              </h1>
              <p className="text-xl text-primary-foreground/70">
                AM Building Solutions is a global leader in construction safety systems, 
                providing comprehensive fall protection and edge safety solutions to 
                construction sites worldwide.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-secondary"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To provide innovative, reliable, and certified safety solutions that 
                  protect workers at height. We are committed to reducing workplace 
                  accidents through superior products, expert guidance, and continuous 
                  innovation in construction safety.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-accent text-accent-foreground"
              >
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-accent-foreground/80">
                  To be the world's most trusted partner in construction safety, setting 
                  the standard for excellence and innovation. We envision a future where 
                  every construction worker returns home safely at the end of each day.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-secondary">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do and shape our approach to 
                protecting workers worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 text-accent mb-6">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Journey</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From a small team with a big vision to a global leader in construction safety.
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`md:flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                      <span className="text-4xl font-bold text-accent">{item.year}</span>
                      <h3 className="text-xl font-bold text-foreground mt-2">{item.title}</h3>
                      <p className="text-muted-foreground mt-2">{item.description}</p>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-4 h-4 rounded-full bg-accent relative z-10" />
                    <div className="md:w-1/2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-navy text-primary-foreground">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Clock, value: "25+", label: "Years of Experience" },
                { icon: Users, value: "5000+", label: "Projects Completed" },
                { icon: Globe2, value: "50+", label: "Countries Served" },
                { icon: Award, value: "100%", label: "Safety Record" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <stat.icon className="h-8 w-8 text-accent mx-auto mb-4" />
                  <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <div className="text-primary-foreground/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-background">
          <div className="container-wide text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Partner With Us
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of companies worldwide who trust AM Building Solutions 
              for their construction safety needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/contact">
                  Contact Our Team
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/products">View Our Products</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
