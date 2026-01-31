import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Send, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productOptions = [
  "Edge Protection Systems",
  "Safety Net Systems",
  "Fall Protection Equipment",
  "Lifeline Systems",
  "Anchor Points",
  "Custom Safety Solution",
];

export default function QuotePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    products: [] as string[],
    projectType: "",
    projectLocation: "",
    timeline: "",
    budget: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Quote Request Received!",
      description: "Our team will contact you within 24-48 hours with a detailed quote.",
    });
    
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      products: [],
      projectType: "",
      projectLocation: "",
      timeline: "",
      budget: "",
      description: "",
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProductToggle = (product: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy text-primary-foreground py-20">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-block text-accent font-semibold mb-4">Request a Quote</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Get Your Custom
                <span className="text-accent"> Quote</span>
              </h1>
              <p className="text-xl text-primary-foreground/70">
                Tell us about your project requirements and receive a detailed quote 
                tailored to your specific needs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quote Form */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              {/* Progress Indicators */}
              <div className="mb-12">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-accent">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">1</div>
                    <span className="hidden sm:inline font-medium">Your Details</span>
                  </div>
                  <div className="h-0.5 flex-1 mx-4 bg-border" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold">2</div>
                    <span className="hidden sm:inline">Project Info</span>
                  </div>
                  <div className="h-0.5 flex-1 mx-4 bg-border" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold">3</div>
                    <span className="hidden sm:inline">Review</span>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 rounded-2xl bg-card border border-border">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">1</span>
                      Contact Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Smith" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                        <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                        <Input name="company" value={formData.company} onChange={handleChange} placeholder="Your Company Ltd." required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 (234) 567-890" required />
                      </div>
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">2</span>
                      Products of Interest
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {productOptions.map((product) => (
                        <button
                          key={product}
                          type="button"
                          onClick={() => handleProductToggle(product)}
                          className={`p-4 rounded-lg border-2 text-sm font-medium transition-colors text-left ${
                            formData.products.includes(product)
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border bg-background text-foreground hover:border-accent/50"
                          }`}
                        >
                          <CheckCircle className={`h-5 w-5 mb-2 ${formData.products.includes(product) ? "text-accent" : "text-muted-foreground"}`} />
                          {product}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">3</span>
                      Project Details
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Project Type</label>
                        <select
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                        >
                          <option value="">Select project type</option>
                          <option value="commercial">Commercial Construction</option>
                          <option value="residential">Residential Construction</option>
                          <option value="industrial">Industrial Facility</option>
                          <option value="infrastructure">Infrastructure</option>
                          <option value="maintenance">Maintenance Access</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Project Location</label>
                        <Input name="projectLocation" value={formData.projectLocation} onChange={handleChange} placeholder="City, Country" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Project Timeline</label>
                        <select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                        >
                          <option value="">Select timeline</option>
                          <option value="immediate">Immediate (within 2 weeks)</option>
                          <option value="1month">Within 1 month</option>
                          <option value="3months">Within 3 months</option>
                          <option value="6months">Within 6 months</option>
                          <option value="planning">Planning stage</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Estimated Budget</label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                        >
                          <option value="">Select budget range</option>
                          <option value="under10k">Under $10,000</option>
                          <option value="10k-50k">$10,000 - $50,000</option>
                          <option value="50k-100k">$50,000 - $100,000</option>
                          <option value="100k-500k">$100,000 - $500,000</option>
                          <option value="over500k">Over $500,000</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-foreground mb-2">Project Description</label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please describe your project requirements, site conditions, and any specific safety challenges..."
                        rows={5}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <FileText className="inline h-4 w-4 mr-1" />
                      You'll receive a detailed quote within 24-48 hours
                    </p>
                    <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : (
                        <>
                          Submit Quote Request
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
