import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Filter, Search, Fence, Cable, HardHat, Anchor, Grid3X3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductDetailDialog, ProductDetail } from "@/components/ProductDetailDialog";

const categories = [
  { id: "all", name: "All Products", icon: Grid3X3 },
  { id: "edge-protection", name: "Edge Protection", icon: Fence },
  { id: "safety-nets", name: "Safety Nets", icon: Shield },
  { id: "fall-protection", name: "Fall Protection", icon: HardHat },
  { id: "lifelines", name: "Lifelines", icon: Cable },
  { id: "anchor-points", name: "Anchor Points", icon: Anchor },
];

const defaultProducts = [
  {
    id: "1",
    name: "Class A Edge Protection",
    category: "edge-protection",
    description: "EN 13374 Class A temporary edge protection for flat surfaces up to 10° slope.",
    certification: "EN 13374",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Class B Edge Protection",
    category: "edge-protection",
    description: "EN 13374 Class B temporary edge protection for surfaces with slope up to 30°.",
    certification: "EN 13374",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Class C Edge Protection",
    category: "edge-protection",
    description: "EN 13374 Class C temporary edge protection for steep surfaces up to 45°.",
    certification: "EN 13374",
    image: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Type S Safety Net",
    category: "safety-nets",
    description: "EN 1263-1 Type S safety net system for personal fall protection.",
    certification: "EN 1263-1",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    name: "Type T Safety Net",
    category: "safety-nets",
    description: "EN 1263-1 Type T safety net with console for edge application.",
    certification: "EN 1263-1",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    name: "Horizontal Lifeline",
    category: "lifelines",
    description: "EN 795 Class C horizontal lifeline system for multiple user connection.",
    certification: "EN 795",
    image: "https://images.unsplash.com/photo-1599629954294-2cf5e00be5a6?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "7",
    name: "Vertical Lifeline",
    category: "lifelines",
    description: "EN 353-2 vertical lifeline with guided type fall arrester.",
    certification: "EN 353-2",
    image: "https://images.unsplash.com/photo-1597468582249-33cf9b067bc3?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "8",
    name: "Full Body Harness",
    category: "fall-protection",
    description: "EN 361 certified full body harness for fall arrest applications.",
    certification: "EN 361",
    image: "https://images.unsplash.com/photo-1572939502729-8ddb8de58979?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "9",
    name: "Self-Retracting Lifeline",
    category: "fall-protection",
    description: "EN 360 self-retracting lifeline with automatic braking system.",
    certification: "EN 360",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "10",
    name: "Roof Anchor Point",
    category: "anchor-points",
    description: "EN 795 Class A1 single point anchor for permanent roof installation.",
    certification: "EN 795",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "11",
    name: "Post Anchor System",
    category: "anchor-points",
    description: "EN 795 Class A2 structural anchor for steel framework connection.",
    certification: "EN 795",
    image: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "12",
    name: "Temporary Anchor Device",
    category: "anchor-points",
    description: "EN 795 Class B transportable temporary anchor device.",
    certification: "EN 795",
    image: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&auto=format&fit=crop&q=80",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(defaultProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Load products from localStorage (admin changes)
  useEffect(() => {
    const savedProducts = localStorage.getItem("admin_products");
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        setProducts(defaultProducts);
      }
    }
  }, []);

  useEffect(() => {
    const productId = searchParams.get("product");
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (!productId) return;
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setSelectedCategory(product.category);
    setSelectedProduct(product);
    setDialogOpen(true);
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              <span className="inline-block text-accent font-semibold mb-4">Our Products</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Safety Systems &
                <span className="text-accent"> Solutions</span>
              </h1>
              <p className="text-xl text-primary-foreground/70">
                Comprehensive range of certified fall protection and edge safety products 
                for construction sites worldwide.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            {/* Search & Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-12">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setDialogOpen(true);
                    }}
                    className="w-full text-left group card-industrial overflow-hidden"
                  >
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-accent text-accent-foreground rounded">
                        {product.certification}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                        View Details
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-secondary">
          <div className="container-wide text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our engineering team can design bespoke safety systems for your specific requirements.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/quote">
                Request Custom Quote
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
          <ProductDetailDialog
            product={selectedProduct}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
    </div>
  );
}
