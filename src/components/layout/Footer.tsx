import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Linkedin, Facebook, Youtube } from "lucide-react";

const footerLinks = {
  products: [
    { name: "Safety Net Systems", href: "/products/safety-nets" },
    { name: "Fall Protection", href: "/products/fall-protection" },
    { name: "Edge Protection", href: "/products/edge-protection" },
    { name: "Lifelines", href: "/products/lifelines" },
    { name: "Temporary Solutions", href: "/products/temporary-permanent" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Industries", href: "/industries" },
    { name: "Projects", href: "/projects" },
    { name: "Certifications", href: "/certifications" },
    { name: "Blog", href: "/blog" },
  ],
  resources: [
    { name: "Technical Documentation", href: "/documentation" },
    { name: "Safety Standards", href: "/standards" },
    { name: "Media Gallery", href: "/gallery" },
    { name: "FAQs", href: "/faq" },
    { name: "Request Quote", href: "/quote" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <span className="text-xl font-bold text-accent-foreground">AM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">AM Building</span>
                <span className="text-sm font-medium text-accent leading-tight">Solutions</span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Leading provider of construction safety systems. Protecting workers with 
              EN 13374 certified edge protection, safety nets, and fall prevention solutions.
            </p>
            <div className="space-y-3">
              <a href="tel:+1234567890" className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent transition-colors">
                <Phone className="h-5 w-5" />
                <span>+1 (234) 567-890</span>
              </a>
              <a href="mailto:info@ambuildingsolutions.com" className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="h-5 w-5" />
                <span>info@ambuildingsolutions.com</span>
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span>123 Safety Boulevard<br />Construction City, CC 12345</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Products</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-wrap items-center gap-6 text-sm text-primary-foreground/60">
            <span className="font-medium">Certifications:</span>
            <span className="px-3 py-1 border border-primary-foreground/20 rounded">EN 13374</span>
            <span className="px-3 py-1 border border-primary-foreground/20 rounded">ISO 9001:2015</span>
            <span className="px-3 py-1 border border-primary-foreground/20 rounded">EN 1263-1</span>
            <span className="px-3 py-1 border border-primary-foreground/20 rounded">EN 795</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} AM Building Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
