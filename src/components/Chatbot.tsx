import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Knowledge base for the chatbot
const knowledgeBase = {
  products: {
    keywords: ["product", "products", "equipment", "safety", "protection", "edge", "net", "lifeline", "harness", "anchor"],
    response: "We offer comprehensive safety solutions including:\n\n• Edge Protection Systems (EN 13374 certified)\n• Safety Net Systems (EN 1263-1 compliant)\n• Lifeline Systems (horizontal & vertical)\n• Fall Protection Equipment\n• Anchor Point Systems\n• Custom Safety Solutions\n\nWould you like to know more about any specific product category?"
  },
  edgeProtection: {
    keywords: ["edge protection", "guardrail", "railing", "barrier", "class a", "class b", "class c"],
    response: "Our Edge Protection Systems include:\n\n• Class A - For flat surfaces up to 10° slope\n• Class B - For surfaces up to 30° slope\n• Class C - For steep surfaces up to 45° slope\n\nAll systems are EN 13374 certified for temporary edge protection on construction sites and elevated platforms."
  },
  safetyNets: {
    keywords: ["safety net", "nets", "type s", "type t", "debris", "catch"],
    response: "Our Safety Net Systems are EN 1263-1 compliant and include:\n\n• Type S - Personal fall protection nets\n• Type T - Edge application nets with console\n\nThese systems provide fall arrest and debris containment across all construction phases."
  },
  certification: {
    keywords: ["certification", "certified", "standard", "en 13374", "en 1263", "en 795", "iso", "compliance"],
    response: "All our products meet international safety standards:\n\n• EN 13374 (Edge Protection)\n• EN 1263-1 (Safety Nets)\n• EN 795 (Anchor Points)\n• EN 361 (Body Harnesses)\n• EN 360 (Self-Retracting Lifelines)\n• ISO 9001 Quality Management\n\nWe maintain strict quality control and testing procedures."
  },
  about: {
    keywords: ["about", "company", "history", "who are you", "founded", "experience"],
    response: "AM Safety Solutions (formerly AM Building Solutions) was founded in 1998. We are a global leader in construction safety systems with:\n\n• 26+ years of experience\n• Presence in 50+ countries\n• ISO 9001 certified\n• Expert team of safety professionals\n• Commitment to innovation and worker safety\n\nOur mission is to protect workers at height through reliable, certified safety solutions."
  },
  industries: {
    keywords: ["industry", "industries", "sector", "construction", "residential", "commercial", "infrastructure"],
    response: "We serve multiple industries including:\n\n• Residential Construction\n• Commercial Buildings\n• Industrial Facilities\n• Infrastructure Projects\n• Renovation & Maintenance\n• Roofing Applications\n\nEach sector has unique safety challenges, and we provide tailored solutions."
  },
  contact: {
    keywords: ["contact", "reach", "call", "email", "quote", "sales", "support"],
    response: "You can reach us for:\n\n• Product inquiries\n• Custom quotes\n• Technical support\n• Safety consultations\n\nPlease visit our Contact page or Request a Quote page for more information. Our team responds within 24 hours."
  },
  services: {
    keywords: ["service", "services", "offer", "provide", "solution", "help"],
    response: "Our comprehensive services include:\n\n• Safety System Design & Installation\n• Site Surveys & Risk Assessment\n• Technical Consultation\n• Product Training & Certification\n• Maintenance & Inspection\n• Custom Solution Development\n\nWe work closely with clients to understand their unique safety challenges."
  },
  pricing: {
    keywords: ["price", "pricing", "cost", "how much", "expensive", "quote"],
    response: "Pricing varies based on:\n\n• Project size and complexity\n• Product type and quantity\n• Installation requirements\n• Customization needs\n\nFor accurate pricing, please request a quote through our website. We provide competitive rates and detailed proposals."
  }
};

const getResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for greetings
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! Welcome to AM Safety Solutions. I'm here to help you with information about our safety products and services. How can I assist you today?";
  }
  
  // Check for thanks
  if (lowerMessage.match(/(thank|thanks|appreciate)/)) {
    return "You're welcome! Feel free to ask if you have any other questions about our safety solutions.";
  }
  
  // Search knowledge base
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (value.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return value.response;
    }
  }
  
  // Default response
  return "Thank you for your question. I can help you with information about:\n\n• Our Products & Safety Solutions\n• Certifications & Standards\n• Industries We Serve\n• Company Information\n• Contact & Quote Requests\n\nPlease feel free to ask about any of these topics, or visit our website pages for detailed information.";
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AM Safety Solutions assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)]"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="bg-navy text-primary-foreground p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">AM Safety Assistant</h3>
                  <p className="text-xs text-primary-foreground/70">Always here to help</p>
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
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
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
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={!inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Ask about products, services, or company info
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
