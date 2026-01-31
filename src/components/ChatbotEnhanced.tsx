import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type SpeechRecognition = any;

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Comprehensive knowledge base with ALL website content
const productDatabase = {
  "class a edge protection": {
    name: "Class A Edge Protection",
    details: "EN 13374 Class A temporary edge protection for flat surfaces up to 10° slope. Features quick installation, modular design, hot-dip galvanized steel construction. Specifications: 1.0m-1.15m guardrail height, 300N/m load capacity, 15-25 kg/m weight. Applications: flat roof construction, building facades, concrete slab edges, platform perimeters, temporary openings, multi-story projects."
  },
  "class b edge protection": {
    name: "Class B Edge Protection",
    details: "EN 13374 Class B temporary edge protection for surfaces with slope up to 30°. Enhanced stability with reinforced anchoring, adjustable angle brackets, high-strength steel. Specifications: 1.0m-1.15m height, 500N/m load capacity, 20-30 kg/m weight. Applications: pitched roof construction, sloped concrete structures, inclined facades, ramps, terraced sites, industrial platforms."
  },
  "class c edge protection": {
    name: "Class C Edge Protection",
    details: "EN 13374 Class C temporary edge protection for steep surfaces up to 45°. Specialized design with heavy-duty anchoring, extra reinforcement, adjustable up to 45°. Specifications: 1.0m-1.15m height, 700N/m load capacity, 25-35 kg/m weight. Professional installation required. Applications: steep pitched roofs, mansard roofs, steep ramps, industrial steep platforms, architectural feature walls."
  },
  "type s safety net": {
    name: "Type S Safety Net",
    details: "EN 1263-1 Type S safety net for personal fall protection. High-strength knotless mesh, energy-absorbing design, UV-resistant. Specifications: 60mm or 100mm mesh, polyamide/polyester material, 30kN breaking strength, 100kg from 6m test drop, max 6m mounting height. Applications: multi-story building construction, bridge work, industrial installations, stadiums, tower work."
  },
  "type t safety net": {
    name: "Type T Safety Net",
    details: "EN 1263-1 Type T safety net with console for edge application. Integrated console system, protects against falls and debris, 2.5m-3.0m projection, weather-resistant. Specifications: 60mm or 100mm mesh, polyamide/polyester, steel bracket console. Applications: high-rise facades, concrete formwork, edge protection, renovation projects, debris containment."
  },
  "horizontal lifeline": {
    name: "Horizontal Lifeline",
    details: "EN 795 Class C horizontal lifeline for multiple user connection. Flexible cable or rail, integrated energy absorber, intermediate anchors. Specifications: 8mm-12mm cable diameter, 20m max span, 3 persons max, stainless steel, 6kN force limit per user. Applications: roof maintenance, industrial walkways, facade access, bridge inspection, warehouse operations."
  },
  "vertical lifeline": {
    name: "Vertical Lifeline",
    details: "EN 353-2 vertical lifeline with guided fall arrester. Automatic fall arrester, hands-free operation, self-locking mechanism. Specifications: 10mm-14mm rope diameter, 50m max length, synthetic rope, 1.5kg arrester weight, 6kN force limit. Applications: fixed ladder access, tower climbing, silo/tank access, vertical shaft work, communication tower maintenance."
  },
  "full body harness": {
    name: "Full Body Harness",
    details: "EN 361 certified full body harness for fall arrest. Padded shoulder and leg straps, quick-release buckles, multiple D-ring attachments, adjustable sizing. Specifications: S to XXL sizes, 140kg max user weight, polyester webbing, steel D-rings, 22kN breaking strength. Applications: general construction, scaffold erection, roofing, steel work, maintenance, all height work."
  },
  "self-retracting lifeline": {
    name: "Self-Retracting Lifeline (SRL)",
    details: "EN 360 self-retracting lifeline with automatic braking. Automatic cable retraction, instant fall arrest, reduced free-fall distance, swivel connection. Specifications: 3m-30m cable length, 6kN max arrest force, steel cable/webbing, 2kg-15kg weight, <1m braking distance. Applications: overhead anchor work, elevated platforms, building maintenance, confined spaces, vehicle-mounted operations."
  },
  "roof anchor point": {
    name: "Roof Anchor Point",
    details: "EN 795 Class A1 single point anchor for permanent roof installation. Universal attachment, weather/UV resistant, minimal penetration, 360° rotation. Specifications: stainless steel, 12kN min breaking load, concrete/steel roof types, 1 person max. Applications: flat roof maintenance, HVAC servicing, solar panel installation, rooftop inspection, communication equipment."
  },
  "post anchor system": {
    name: "Post Anchor System",
    details: "EN 795 Class A2 structural anchor for steel framework. No drilling/welding required, adjustable for beam sizes 80mm-300mm, quick installation. Specifications: steel construction, 12kN min breaking load, 3kg-8kg weight, 2 persons max. Applications: steel structure construction, industrial facility maintenance, warehouses, manufacturing plants, steel bridges."
  },
  "temporary anchor device": {
    name: "Temporary Anchor Device",
    details: "EN 795 Class B transportable temporary anchor device. Fully portable, no permanent installation, quick setup, 40kg-200kg base weight. Specifications: steel/concrete, 12kN min breaking load, 0.5m²-1.5m² footprint, 2 persons max. Applications: temporary construction sites, event setup, mobile maintenance, flexible locations, short-term projects."
  }
};

type ChatbotResponse = {
  text: string;
  navigateTo?: string;
};

const getResponse = (userMessage: string): ChatbotResponse => {
  const lowerMessage = userMessage.toLowerCase();

  const navigationMatch = lowerMessage.match(/take me(?: to)?\s+(.+)/);
  if (navigationMatch?.[1]) {
    const target = navigationMatch[1].trim();

    const productKey = Object.keys(productDatabase).find((key) => target.includes(key));
    if (productKey) {
      const productIndex = Object.keys(productDatabase).indexOf(productKey) + 1;
      const product = productDatabase[productKey as keyof typeof productDatabase];
      return {
        text: `**${product.name}**\n\n${product.details}\n\nOpening the product details now.`,
        navigateTo: `/products?product=${productIndex}`,
      };
    }

    const categoryMap: Record<string, string> = {
      "edge protection": "edge-protection",
      "safety nets": "safety-nets",
      "fall protection": "fall-protection",
      lifelines: "lifelines",
      "anchor points": "anchor-points",
      anchors: "anchor-points",
    };

    for (const [label, category] of Object.entries(categoryMap)) {
      if (target.includes(label)) {
        return {
          text: `Opening ${label} products now.`,
          navigateTo: `/products?category=${category}`,
        };
      }
    }

    const pageMap: Record<string, string> = {
      home: "/",
      "about": "/about",
      "about us": "/about",
      products: "/products",
      projects: "/projects",
      industries: "/industries",
      "commercial construction": "/industries",
      "industrial facilities": "/industries",
      "maritime": "/industries",
      "offshore": "/industries",
      "aviation": "/industries",
      "infrastructure": "/industries",
      "energy": "/industries",
      "power plants": "/industries",
      "wind farms": "/industries",
      "solar installations": "/industries",
      "shipyards": "/industries",
      "airports": "/industries",
      certifications: "/certifications",
      "en 13374": "/certifications",
      "en 1263-1": "/certifications",
      "en 795": "/certifications",
      "en 361": "/certifications",
      "en 360": "/certifications",
      "en 353-2": "/certifications",
      "iso 9001": "/certifications",
      contact: "/contact",
      "contact info": "/contact",
      "contact information": "/contact",
      quote: "/quote",
      documentation: "/documentation",
      blog: "/blog",
    };

    for (const [label, path] of Object.entries(pageMap)) {
      if (target.includes(label)) {
        return {
          text: `Opening the ${label} page now.`,
          navigateTo: path,
        };
      }
    }

    return {
      text: "I couldn't find that page or product. Try: 'take me to products', 'take me to industries', or a product name like 'Class B Edge Protection'.",
    };
  }
  
  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return {
      text: "Hello! Welcome to AM Safety Solutions. I'm here to help you with information about our safety products, services, certifications, and company. How can I assist you today?",
    };
  }
  
  // Thanks
  if (lowerMessage.match(/(thank|thanks|appreciate)/)) {
    return {
      text: "You're welcome! Feel free to ask if you have any other questions about our safety solutions. I'm here to help!",
    };
  }
  
  // Contact Information
  if (lowerMessage.match(/(contact|phone|call|email|address|location|reach)/)) {
    return {
      text: "📞 **Contact Information:**\n\n**Phone:**\n+1 (234) 567-890\n+1 (234) 567-891\n\n**Email:**\nmabuayyash33@gmail.com\n\n**Address:**\n123 Safety Boulevard\nConstruction City, CC 12345\nUnited States\n\n**Business Hours:**\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 1:00 PM\n\nWe respond to inquiries within 24 hours during business days!",
    };
  }
  
  // Search for specific products
  for (const [key, value] of Object.entries(productDatabase)) {
    if (lowerMessage.includes(key)) {
      const productId = Object.keys(productDatabase).indexOf(key) + 1;
      return {
        text: `**${value.name}**\n\n${value.details}\n\nOpening the product page now. You can also request a quote if you'd like.`,
        navigateTo: `/products?product=${productId}`,
      };
    }
  }
  
  // Edge Protection General
  if (lowerMessage.match(/(edge protection|guardrail|railing|barrier)/)) {
    return {
      text: "**Edge Protection Systems:**\n\nWe offer three classes of EN 13374 certified edge protection:\n\n• **Class A** - Flat surfaces up to 10° slope (300N/m load capacity)\n• **Class B** - Surfaces up to 30° slope (500N/m load capacity)\n• **Class C** - Steep surfaces up to 45° slope (700N/m load capacity)\n\nAll systems feature modular design, galvanized steel construction, and quick installation. Ask about a specific class for detailed specifications!",
    };
  }
  
  // Safety Nets
  if (lowerMessage.match(/(safety net|nets|debris|catch)/)) {
    return {
      text: "**Safety Net Systems (EN 1263-1):**\n\n• **Type S** - Personal fall protection nets for workers\n• **Type T** - Edge application nets with console brackets\n\nFeatures: High-strength knotless mesh, energy-absorbing, UV-resistant, 60mm or 100mm mesh sizes. Applications include multi-story construction, bridge work, facade protection, and debris containment.",
    };
  }
  
  // Fall Protection
  if (lowerMessage.match(/(fall protection|harness|personal protection|ppe)/)) {
    return {
      text: "**Fall Protection Equipment:**\n\n• Full Body Harness (EN 361) - Adjustable, padded, multiple D-rings\n• Self-Retracting Lifeline (EN 360) - Auto-braking, 3m-30m length\n• Horizontal Lifeline (EN 795 Class C) - Multiple users, 20m span\n• Vertical Lifeline (EN 353-2) - Automatic fall arrester\n\nAll equipment meets international safety standards and includes comprehensive documentation.",
    };
  }
  
  // Anchor Points
  if (lowerMessage.match(/(anchor|anchor point|anchorage)/)) {
    return {
      text: "**Anchor Point Systems:**\n\n• **Roof Anchor Point** (EN 795 Class A1) - Permanent roof installation, 360° rotation\n• **Post Anchor System** (EN 795 Class A2) - Steel framework, no drilling needed\n• **Temporary Anchor** (EN 795 Class B) - Portable, 40kg-200kg base\n\nAll anchors certified for 12kN minimum breaking load with full documentation.",
    };
  }
  
  // Lifelines
  if (lowerMessage.match(/(lifeline|cable|rope system)/)) {
    return {
      text: "**Lifeline Systems:**\n\n• **Horizontal Lifeline** (EN 795 Class C) - 20m max span, 3 users, stainless steel\n• **Vertical Lifeline** (EN 353-2) - 50m max length, automatic fall arrester\n\nBoth systems feature energy absorbers, weather-resistant materials, and professional installation. Perfect for roof access, industrial walkways, and ladder climbing.",
    };
  }
  
  // Certifications
  if (lowerMessage.match(/(certification|certified|standard|en 13374|en 1263|en 795|en 361|en 360|en 353|iso)/)) {
    return {
      text: "**Certifications & Standards:**\n\n• EN 13374 - Temporary Edge Protection Systems\n• EN 1263-1 - Safety Nets (requirements & test methods)\n• EN 795 - Anchor Devices (Classes A1, A2, B, C)\n• EN 361 - Full Body Harnesses\n• EN 360 - Self-Retracting Lifelines\n• EN 353-2 - Vertical Lifelines\n• ISO 9001:2015 - Quality Management System\n\nAll products are third-party tested with full traceability and documentation. We maintain strict quality control and regular audits.",
    };
  }
  
  // About Company
  if (lowerMessage.match(/(about|company|history|who are you|founded|experience|am building|am safety)/)) {
    return {
      text: "**About AM Safety Solutions:**\n\nFounded in 1998 as AM Building Solutions, we're a global leader in construction safety systems.\n\n**Key Milestones:**\n• 1998 - Company founded\n• 2005 - European expansion (15 countries)\n• 2012 - ISO 9001 certification achieved\n• 2018 - Global reach (50+ countries)\n• 2024 - Industry leader recognition\n\n**Our Stats:**\n• 25+ years of experience\n• 5000+ projects completed\n• 50+ countries served\n• 100% safety record\n\n**Mission:** Protect workers at height through reliable, certified safety solutions.",
    };
  }
  
  // Values & Mission
  if (lowerMessage.match(/(mission|vision|values|core values|why choose)/)) {
    return {
      text: "**Our Values & Mission:**\n\n**Mission:** Provide innovative, reliable, and certified safety solutions that protect workers at height. Reduce workplace accidents through superior products and continuous innovation.\n\n**Core Values:**\n• Safety First - Worker safety in everything we do\n• Quality Excellence - Never compromise on quality\n• Customer Focus - Understand unique challenges\n• Innovation - Continuous improvement\n\n**Why Choose Us:**\n✓ 25+ years experience\n✓ Expert certified team\n✓ Custom solutions\n✓ Full support & maintenance\n✓ Premium quality products\n✓ Global reach",
    };
  }
  
  // Industries
  if (lowerMessage.match(/(industry|industries|sector|commercial|residential|industrial|maritime|aviation|infrastructure|energy)/)) {
    return {
      text: "**Industries We Serve:**\n\n• Commercial Construction - High-rise buildings, offices, shopping centers\n• Industrial Facilities - Manufacturing plants, warehouses, refineries\n• Maritime & Offshore - Shipyards, oil platforms, ports\n• Aviation - Airports, hangars, control towers\n• Infrastructure - Bridges, tunnels, railway stations\n• Energy Sector - Power plants, wind farms, solar installations\n\nEach sector has unique safety challenges, and we provide tailored solutions for every industry.",
    };
  }
  
  // Services
  if (lowerMessage.match(/(service|services|offer|provide|solution|help|what do you do)/)) {
    return {
      text: "**Our Comprehensive Services:**\n\n• Safety System Design & Installation\n• Site Surveys & Risk Assessment\n• Technical Consultation\n• Product Training & Certification\n• Maintenance & Inspection Services\n• Custom Solution Development\n\n**Product Categories:**\n• Edge Protection Systems\n• Safety Net Systems\n• Lifeline Systems (Horizontal & Vertical)\n• Fall Protection Equipment\n• Anchor Point Systems\n• Custom Safety Solutions\n\nWe work closely with clients to understand unique challenges and deliver tailored solutions.",
    };
  }
  
  // Pricing & Quotes
  if (lowerMessage.match(/(price|pricing|cost|how much|expensive|quote|estimate)/)) {
    return {
      text: "**Pricing Information:**\n\nPricing varies based on:\n• Project size and complexity\n• Product type and quantity\n• Installation requirements\n• Customization needs\n• Location and delivery\n\n**To Get Accurate Pricing:**\n1. Visit our Quote Request page\n2. Contact our sales team:\n   - Phone: +1 (234) 567-890\n   - Email: mabuayyash33@gmail.com\n\nWe provide competitive rates and detailed proposals. Our team responds within 24 hours with custom quotes tailored to your project.",
    };
  }
  
  // Quality & Testing
  if (lowerMessage.match(/(quality|testing|inspection|audit|compliance)/)) {
    return {
      text: "**Quality Assurance:**\n\n✓ Third-party tested and certified products\n✓ Regular quality audits and inspections\n✓ Full traceability of materials and components\n✓ Comprehensive documentation and certificates\n✓ Ongoing compliance monitoring\n✓ Technical support and training\n\n**Testing Standards:**\nAll products undergo rigorous testing to meet European and international standards. We maintain ISO 9001:2015 certification and provide complete test documentation with every order.",
    };
  }
  
  // Installation
  if (lowerMessage.match(/(installation|install|setup|how to install)/)) {
    return {
      text: "**Installation Services:**\n\nWe offer:\n• Professional installation by certified teams\n• Site surveys and planning\n• Custom fitting and configuration\n• Safety training for your staff\n• Post-installation inspection\n• Documentation and certification\n\n**DIY Installation:**\nMany of our systems feature quick installation without special tools. We provide:\n- Detailed installation manuals\n- Video guides\n- Technical support\n- Training programs\n\nContact us for installation assistance: +1 (234) 567-890",
    };
  }
  
  // Training
  if (lowerMessage.match(/(training|education|learn|course|certification program)/)) {
    return {
      text: "**Training & Education:**\n\nWe provide comprehensive training:\n• Product installation training\n• Safety equipment usage\n• Inspection and maintenance\n• Fall protection certification\n• Site-specific safety protocols\n• Refresher courses\n\nOur certified professionals deliver hands-on training tailored to your team's needs. Contact us to schedule training sessions.",
    };
  }
  
  // Maintenance
  if (lowerMessage.match(/(maintenance|repair|service|inspection|recertification)/)) {
    return {
      text: "**Maintenance & Support:**\n\n**Services Include:**\n• Regular inspection programs\n• Equipment maintenance and repair\n• Recertification services\n• Component replacement\n• System upgrades\n• Emergency support\n\n**Support Availability:**\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 1:00 PM\n24-hour emergency hotline available\n\nContact: mabuayyash33@gmail.com",
    };
  }
  
  // Delivery & Shipping
  if (lowerMessage.match(/(delivery|shipping|ship|transport|logistics)/)) {
    return {
      text: "**Delivery & Shipping:**\n\nWe serve 50+ countries worldwide with:\n• Fast delivery times\n• Reliable logistics partners\n• Local distribution networks\n• Tracking and updates\n• Secure packaging\n• Installation coordination\n\nDelivery times vary by location and order size. Contact our sales team for specific delivery information for your region.",
    };
  }
  
  // Warranty
  if (lowerMessage.match(/(warranty|guarantee|return|replacement)/)) {
    return {
      text: "**Warranty & Guarantees:**\n\nAll our products come with:\n• Manufacturer's warranty\n• Quality guarantee\n• Certified materials\n• Replacement parts availability\n• Technical support\n• Documentation\n\nWarranty terms vary by product. Contact us for specific warranty information on your equipment. We stand behind the quality of all our safety systems.",
    };
  }
  
  // Custom Solutions
  if (lowerMessage.match(/(custom|bespoke|tailored|specific|special)/)) {
    return {
      text: "**Custom Safety Solutions:**\n\nOur engineering team designs bespoke safety systems for unique requirements:\n\n**Process:**\n1. Site survey and assessment\n2. Risk analysis\n3. Custom design development\n4. Engineering calculations\n5. Certification and approval\n6. Manufacturing and installation\n7. Testing and handover\n\n**Applications:**\n• Unusual building shapes\n• Special roof configurations\n• Complex industrial facilities\n• Heritage building protection\n• Temporary special events\n\nContact us for custom solution consultations!",
    };
  }
  
  // Projects
  if (lowerMessage.match(/(project|projects|portfolio|case study|example)/)) {
    return {
      text: "**Our Projects:**\n\nWe've completed 5000+ projects across:\n• High-rise commercial buildings\n• Industrial manufacturing facilities\n• Infrastructure projects (bridges, tunnels)\n• Aviation facilities\n• Maritime and offshore structures\n• Energy installations\n• Residential developments\n\nOur global reach spans 50+ countries with local support networks. Each project demonstrates our commitment to safety excellence and innovation.",
    };
  }
  
  // Business Hours
  if (lowerMessage.match(/(hours|open|when|time|schedule)/)) {
    return {
      text: "**Business Hours:**\n\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed\n\n24-hour emergency support available\n\n**Response Times:**\n• Email inquiries: Within 24 hours\n• Phone calls: Immediate during business hours\n• Emergency support: Available 24/7\n\nContact us anytime at mabuayyash33@gmail.com!",
    };
  }
  
  // Products List
  if (lowerMessage.match(/(products|product list|what products|equipment|all products)/)) {
    return {
      text: "**Our Complete Product Range:**\n\n**Edge Protection:**\n• Class A (up to 10° slope)\n• Class B (up to 30° slope)\n• Class C (up to 45° slope)\n\n**Safety Nets:**\n• Type S (personal protection)\n• Type T (edge application)\n\n**Fall Protection:**\n• Full Body Harness\n• Self-Retracting Lifeline\n\n**Lifelines:**\n• Horizontal Lifeline\n• Vertical Lifeline\n\n**Anchor Points:**\n• Roof Anchor Point\n• Post Anchor System\n• Temporary Anchor Device\n\nAsk about any specific product for detailed information!",
    };
  }
  
  // Default response with helpful menu
  return {
    text: "I'm here to help! I can provide detailed information about:\n\n**Products:** Edge protection (Class A/B/C), safety nets (Type S/T), lifelines, harnesses, anchors\n\n**Company:** History, values, certifications, statistics\n\n**Services:** Installation, training, maintenance, custom solutions\n\n**Contact:** Phone, email, address, business hours\n\n**Industries:** Commercial, industrial, maritime, aviation, infrastructure, energy\n\n**Standards:** EN 13374, EN 1263-1, EN 795, EN 361, EN 360, EN 353-2, ISO 9001\n\nPlease ask about any topic, or type a product name for detailed specifications!",
  };
};

export function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AM Safety Solutions assistant. I have comprehensive knowledge about all our products, certifications, company information, and services. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0]?.transcript?.trim() ?? "";
      if (!transcript) return;
      setInputValue(transcript);
      handleSend(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSend = (overrideText?: string) => {
    const messageText = (overrideText ?? inputValue).trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const response = getResponse(messageText);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);

      if (response.navigateTo) {
        navigate(response.navigateTo);
      }
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleListening = () => {
    if (!isSpeechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[650px] max-h-[calc(100vh-8rem)]"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="bg-navy text-primary-foreground p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">AM Safety Assistant</h3>
                  <p className="text-xs text-primary-foreground/70">Expert product knowledge</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          message.sender === "user"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-accent-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about products, contact, services..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleToggleListening}
                    size="icon"
                    variant="outline"
                    disabled={!isSpeechSupported}
                    title={isSpeechSupported ? "Voice input" : "Voice input not supported"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => handleSend()}
                    size="icon"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={!inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Try: "take me to products" or "take me to Class B Edge Protection"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
