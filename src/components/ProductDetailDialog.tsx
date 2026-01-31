import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Package, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface ProductDetail {
  id: string;
  name: string;
  category: string;
  description: string;
  certification: string;
  image: string;
  detailedDescription?: string;
  features?: string[];
  specifications?: { label: string; value: string }[];
  applications?: string[];
}

interface ProductDetailDialogProps {
  product: ProductDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  if (!product) return null;

  const detailedInfo = getProductDetails(product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image & Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <Badge className="mb-3">{product.certification}</Badge>
              <p className="text-muted-foreground mb-4">{detailedInfo.detailedDescription}</p>
              <div className="flex gap-2">
                <Button variant="hero" size="sm" asChild>
                  <Link to="/quote">
                    Request Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          {detailedInfo.features && detailedInfo.features.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Key Features
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {detailedInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent mt-1 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {detailedInfo.specifications && detailedInfo.specifications.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Technical Specifications
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {detailedInfo.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-medium text-foreground">{spec.label}</span>
                    <span className="text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          {detailedInfo.applications && detailedInfo.applications.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Applications
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {detailedInfo.applications.map((app, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <span className="text-muted-foreground">{app}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certification Info */}
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <h4 className="font-semibold text-foreground mb-2">
              Certification: {product.certification}
            </h4>
            <p className="text-sm text-muted-foreground">
              This product has been tested and certified according to {product.certification} standards, 
              ensuring compliance with European safety regulations. Full documentation and certificates 
              are available upon request.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced product details
function getProductDetails(product: ProductDetail) {
  const details: Partial<ProductDetail> = {};

  switch (product.id) {
    case "1": // Class A Edge Protection
      details.detailedDescription = "Class A Edge Protection System is designed for flat surfaces with slopes up to 10°. This temporary edge protection provides a safe working environment during construction, maintenance, and renovation projects. The system features a modular design for quick installation and removal.";
      details.features = [
        "Quick and easy installation without special tools",
        "Modular design for flexible configurations",
        "Hot-dip galvanized steel construction",
        "Suitable for concrete, steel, and timber structures",
        "Reusable and adjustable components",
        "Includes guardrails, toe boards, and support brackets"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 13374 Class A" },
        { label: "Maximum Slope", value: "10°" },
        { label: "Guardrail Height", value: "1.0m - 1.15m" },
        { label: "Material", value: "Galvanized Steel" },
        { label: "Load Capacity", value: "300N/m" },
        { label: "Weight", value: "15-25 kg/m" }
      ];
      details.applications = [
        "Flat roof construction and maintenance",
        "Building facades and external walls",
        "Concrete slab edges",
        "Platform and scaffold perimeters",
        "Temporary openings protection",
        "Multi-story construction projects"
      ];
      break;

    case "2": // Class B Edge Protection
      details.detailedDescription = "Class B Edge Protection System is engineered for surfaces with slopes up to 30°. This system provides enhanced stability and safety for workers on inclined surfaces, featuring reinforced anchoring and additional support mechanisms to handle the increased forces.";
      details.features = [
        "Enhanced stability for sloped surfaces",
        "Reinforced anchoring system",
        "Adjustable angle brackets",
        "High-strength steel construction",
        "Weather-resistant coating",
        "Compatible with Class A components"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 13374 Class B" },
        { label: "Maximum Slope", value: "30°" },
        { label: "Guardrail Height", value: "1.0m - 1.15m" },
        { label: "Material", value: "Galvanized Steel" },
        { label: "Load Capacity", value: "500N/m" },
        { label: "Weight", value: "20-30 kg/m" }
      ];
      details.applications = [
        "Pitched roof construction",
        "Sloped concrete structures",
        "Inclined facades",
        "Ramp and stairway construction",
        "Terraced building sites",
        "Industrial sloped platforms"
      ];
      break;

    case "3": // Class C Edge Protection
      details.detailedDescription = "Class C Edge Protection System is specifically designed for steep surfaces up to 45°. This advanced system incorporates specialized anchoring and bracing to ensure maximum safety on challenging, highly-inclined work areas where standard systems cannot be used.";
      details.features = [
        "Specialized design for steep surfaces",
        "Heavy-duty anchoring system",
        "Adjustable up to 45° inclination",
        "Extra reinforcement brackets",
        "Superior load distribution",
        "Professional installation required"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 13374 Class C" },
        { label: "Maximum Slope", value: "45°" },
        { label: "Guardrail Height", value: "1.0m - 1.15m" },
        { label: "Material", value: "High-Grade Steel" },
        { label: "Load Capacity", value: "700N/m" },
        { label: "Weight", value: "25-35 kg/m" }
      ];
      details.applications = [
        "Steep pitched roofs",
        "Mansard roof construction",
        "Steep ramps and access ways",
        "Industrial steep platforms",
        "Architectural feature walls",
        "Specialized construction projects"
      ];
      break;

    case "4": // Type S Safety Net
      details.detailedDescription = "Type S Safety Net System provides personal fall protection for workers. These high-strength nets are designed to catch and safely decelerate falling persons, minimizing impact forces. The system is ideal for construction sites where other protection methods are impractical.";
      details.features = [
        "High-strength knotless mesh",
        "Energy-absorbing design",
        "UV-resistant materials",
        "Quick installation with border rope",
        "Available in multiple sizes",
        "Regular inspection and testing"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 1263-1 Type S" },
        { label: "Mesh Size", value: "60mm or 100mm" },
        { label: "Material", value: "Polyamide/Polyester" },
        { label: "Breaking Strength", value: "30kN" },
        { label: "Test Drop", value: "100kg from 6m" },
        { label: "Max Mounting Height", value: "6m" }
      ];
      details.applications = [
        "Multi-story building construction",
        "Bridge construction and maintenance",
        "Industrial facility installations",
        "Stadium and arena construction",
        "Tower and mast work",
        "General construction safety"
      ];
      break;

    case "5": // Type T Safety Net
      details.detailedDescription = "Type T Safety Net with console brackets is designed for edge protection applications. The system combines the safety of nets with console support, creating a protective barrier that catches falling persons and debris, particularly useful where guardrails cannot be installed.";
      details.features = [
        "Integrated console system",
        "Protects against falls and debris",
        "Adjustable projection length",
        "Weather-resistant construction",
        "Reusable system components",
        "Professional installation included"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 1263-1 Type T" },
        { label: "Mesh Size", value: "60mm or 100mm" },
        { label: "Projection", value: "2.5m - 3.0m" },
        { label: "Material", value: "Polyamide/Polyester" },
        { label: "Console Type", value: "Steel Bracket" },
        { label: "Max Height", value: "No Limit" }
      ];
      details.applications = [
        "High-rise building facades",
        "Concrete formwork operations",
        "Edge protection for buildings",
        "Renovation and retrofit projects",
        "Industrial structure construction",
        "Debris containment"
      ];
      break;

    case "6": // Horizontal Lifeline
      details.detailedDescription = "Horizontal Lifeline System allows multiple workers to connect safely while maintaining mobility along the line. The system features intermediate anchors and energy absorbers to limit forces on the structure and the user during a fall arrest event.";
      details.features = [
        "Multiple user connections",
        "Flexible cable or rail system",
        "Integrated energy absorber",
        "Intermediate anchor points",
        "Corrosion-resistant materials",
        "Easy user attachment/detachment"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 795 Class C" },
        { label: "Cable Diameter", value: "8mm - 12mm" },
        { label: "Max Span", value: "20m" },
        { label: "Max Users", value: "3 persons" },
        { label: "Material", value: "Stainless Steel" },
        { label: "Force Limit", value: "6kN per user" }
      ];
      details.applications = [
        "Roof maintenance access",
        "Industrial walkways",
        "Building facade access",
        "Bridge inspection",
        "Warehouse operations",
        "General height work"
      ];
      break;

    case "7": // Vertical Lifeline
      details.detailedDescription = "Vertical Lifeline with guided fall arrester provides continuous protection during vertical access. The system automatically follows the user's movement and locks instantly in the event of a fall, ensuring safety during ladder climbing and vertical work.";
      details.features = [
        "Automatic fall arrester",
        "Hands-free operation",
        "Continuous protection",
        "Self-locking mechanism",
        "Weather-resistant design",
        "Easy installation on ladders"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 353-2" },
        { label: "Rope Diameter", value: "10mm - 14mm" },
        { label: "Max Length", value: "50m" },
        { label: "Material", value: "Synthetic Rope" },
        { label: "Arrester Weight", value: "1.5kg" },
        { label: "Force Limit", value: "6kN" }
      ];
      details.applications = [
        "Fixed ladder access",
        "Tower and mast climbing",
        "Silo and tank access",
        "Vertical shaft work",
        "Communication tower maintenance",
        "Industrial vertical access"
      ];
      break;

    case "8": // Full Body Harness
      details.detailedDescription = "Full Body Harness is a critical component of fall protection systems. Designed for comfort and safety, the harness distributes fall arrest forces across the body, minimizing injury risk. Features adjustable straps and multiple attachment points for various work scenarios.";
      details.features = [
        "Padded shoulder and leg straps",
        "Quick-release buckles",
        "Multiple D-ring attachment points",
        "Adjustable for various body sizes",
        "High-visibility webbing options",
        "Tool attachment loops"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 361" },
        { label: "Size Range", value: "S to XXL" },
        { label: "Max User Weight", value: "140kg" },
        { label: "Webbing Material", value: "Polyester" },
        { label: "D-Ring Material", value: "Steel" },
        { label: "Breaking Strength", value: "22kN" }
      ];
      details.applications = [
        "General construction work",
        "Scaffold erection",
        "Roofing operations",
        "Steel structure work",
        "Maintenance and repair",
        "All height work activities"
      ];
      break;

    case "9": // Self-Retracting Lifeline
      details.detailedDescription = "Self-Retracting Lifeline (SRL) automatically extends and retracts, providing continuous fall protection without trailing lanyards. The internal braking system activates instantly during a fall, limiting free-fall distance and reducing impact forces on the user.";
      details.features = [
        "Automatic cable retraction",
        "Instant fall arrest activation",
        "Reduced free-fall distance",
        "Swivel connection prevents twisting",
        "Impact indicator",
        "Lightweight and compact"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 360" },
        { label: "Cable Length", value: "3m - 30m" },
        { label: "Max Arrest Force", value: "6kN" },
        { label: "Material", value: "Steel Cable/Webbing" },
        { label: "Weight", value: "2kg - 15kg" },
        { label: "Braking Distance", value: "<1m" }
      ];
      details.applications = [
        "Overhead anchor point work",
        "Elevated platform work",
        "Building maintenance",
        "Confined space entry/exit",
        "Vehicle mounted operations",
        "Continuous mobility tasks"
      ];
      break;

    case "10": // Roof Anchor Point
      details.detailedDescription = "Roof Anchor Point provides a permanent, reliable attachment point for fall protection equipment. Designed for various roof types, the anchor is structurally tested and certified to withstand fall arrest forces while protecting the roof integrity.";
      details.features = [
        "Permanent installation",
        "Universal fall protection attachment",
        "Weather and UV resistant",
        "Minimal roof penetration",
        "Corrosion-resistant materials",
        "360° rotation capability"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 795 Class A1" },
        { label: "Material", value: "Stainless Steel" },
        { label: "Min. Breaking Load", value: "12kN" },
        { label: "Rotation", value: "360°" },
        { label: "Roof Types", value: "Concrete/Steel" },
        { label: "Max Users", value: "1 person" }
      ];
      details.applications = [
        "Flat roof maintenance",
        "HVAC equipment servicing",
        "Solar panel installation",
        "Rooftop inspection",
        "Communication equipment work",
        "General roof access"
      ];
      break;

    case "11": // Post Anchor System
      details.detailedDescription = "Post Anchor System is designed for structural steel frameworks. The anchor clamps directly to steel beams and posts, providing a secure attachment point without drilling or welding. Ideal for steel construction and industrial facilities.";
      details.features = [
        "No drilling or welding required",
        "Adjustable for various beam sizes",
        "Quick installation and removal",
        "Reusable system",
        "High-strength construction",
        "Multiple attachment points"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 795 Class A2" },
        { label: "Beam Range", value: "80mm - 300mm" },
        { label: "Material", value: "Steel" },
        { label: "Min. Breaking Load", value: "12kN" },
        { label: "Weight", value: "3kg - 8kg" },
        { label: "Max Users", value: "2 persons" }
      ];
      details.applications = [
        "Steel structure construction",
        "Industrial facility maintenance",
        "Warehouse operations",
        "Manufacturing plants",
        "Steel bridge work",
        "Structural steel erection"
      ];
      break;

    case "12": // Temporary Anchor Device
      details.detailedDescription = "Temporary Anchor Device is a portable, transportable anchor point that can be moved between work locations. The device uses weight or structural connections to provide reliable fall protection attachment without permanent installation.";
      details.features = [
        "Fully portable and transportable",
        "No permanent installation needed",
        "Quick setup and relocation",
        "Multiple attachment configurations",
        "High-visibility design",
        "Complies with transport regulations"
      ];
      details.specifications = [
        { label: "Standard", value: "EN 795 Class B" },
        { label: "Base Weight", value: "40kg - 200kg" },
        { label: "Material", value: "Steel/Concrete" },
        { label: "Min. Breaking Load", value: "12kN" },
        { label: "Footprint", value: "0.5m² - 1.5m²" },
        { label: "Max Users", value: "2 persons" }
      ];
      details.applications = [
        "Temporary construction sites",
        "Event and stage setup",
        "Mobile maintenance operations",
        "Flexible work locations",
        "Short-term projects",
        "Emergency access situations"
      ];
      break;

    default:
      details.detailedDescription = product.description;
      details.features = [
        "Certified safety equipment",
        "Meets international standards",
        "Durable construction",
        "Professional installation available"
      ];
      details.applications = [
        "Construction sites",
        "Industrial facilities",
        "Maintenance operations"
      ];
  }

  return { ...product, ...details };
}
