import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const productLinks = [
  { name: "Safety Net Systems", href: "/products/safety-nets" },
  { name: "Fall Protection Systems", href: "/products/fall-protection" },
  { name: "Edge Protection Systems", href: "/products/edge-protection" },
  { name: "Horizontal & Vertical Lifelines", href: "/products/lifelines" },
  { name: "Temporary & Permanent Solutions", href: "/products/temporary-permanent" },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Products", href: "/products", hasDropdown: true, dropdownItems: productLinks },
  { name: "Industries", href: "/industries" },
  { name: "Projects", href: "/projects" },
  { name: "Certifications", href: "/certifications" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  return (
    <>
      {/* Top Bar */}
      <div className="bg-navy hidden lg:block">
        <div className="container-wide flex h-10 items-center justify-between text-sm text-primary-foreground/80">
          <div className="flex items-center gap-6">
            <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" />
              <span>+1 (234) 567-890</span>
            </a>
            <a href="mailto:info@ambuildingsolutions.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" />
              <span>info@ambuildingsolutions.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>EN 13374 Certified</span>
            <span className="h-4 w-px bg-primary-foreground/30" />
            <span>ISO 9001:2015</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <nav className="container-wide">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <span className="text-xl font-bold text-accent-foreground">AM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">AM Building</span>
                <span className="text-sm font-medium text-accent leading-tight">Solutions</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-md",
                      location.pathname === link.href
                        ? "text-accent"
                        : "text-foreground hover:text-accent hover:bg-accent/5"
                    )}
                  >
                    {link.name}
                    {link.hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.hasDropdown && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full pt-2 w-64"
                      >
                        <div className="bg-card rounded-lg shadow-xl border border-border overflow-hidden">
                          {link.dropdownItems?.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="block px-4 py-3 text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="hero" size="sm" asChild>
                <Link to="/quote">Request Quote</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-card border-t border-border"
            >
              <div className="container-wide py-4">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      to={link.href}
                      className="block py-3 text-foreground hover:text-accent transition-colors"
                      onClick={() => !link.hasDropdown && setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                    {link.hasDropdown && (
                      <div className="pl-4 pb-2">
                        {link.dropdownItems?.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="block py-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border mt-4">
                  <Button variant="hero" asChild>
                    <Link to="/quote">Request Quote</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
