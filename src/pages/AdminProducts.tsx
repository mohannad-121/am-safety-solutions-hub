import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react";

const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ADMIN === "true";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  certification: string;
  image: string;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([
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
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check dev mode first
      if (DEV_MODE) {
        const adminAuth = localStorage.getItem("admin_authenticated");
        const adminUser = localStorage.getItem("admin_user");
        
        if (adminAuth === "true" && adminUser) {
          setUser(JSON.parse(adminUser));
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
      } else {
        setUser(user);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "New Product",
      category: "edge-protection",
      description: "Product description",
      certification: "EN 13374",
      image: "https://via.placeholder.com/400x300",
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem("admin_products", JSON.stringify(updatedProducts));
    setEditingId(newProduct.id);
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem("admin_products", JSON.stringify(updatedProducts));
  };

  const handleUpdateProduct = (id: string, field: keyof Product, value: string) => {
    const updatedProducts = products.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    setProducts(updatedProducts);
    localStorage.setItem("admin_products", JSON.stringify(updatedProducts));
  };

  const handleSave = () => {
    setEditingId(null);
    localStorage.setItem("admin_products", JSON.stringify(products));
  };

  return (
    <div className="min-h-screen bg-navy text-primary-foreground">
      {/* Header */}
      <header className="bg-navy/80 border-b border-primary-foreground/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Manage Products</h1>
          </div>
          <Button
            onClick={handleAddProduct}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-lg bg-navy/50 border border-primary-foreground/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Image */}
                <div className="lg:col-span-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  {editingId === product.id && (
                    <Input
                      value={product.image}
                      onChange={(e) =>
                        handleUpdateProduct(product.id, "image", e.target.value)
                      }
                      placeholder="Image URL"
                      className="mt-2 bg-navy/50 border-primary-foreground/20 text-primary-foreground"
                    />
                  )}
                </div>

                {/* Product Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="text-sm text-primary-foreground/70">Name</label>
                    {editingId === product.id ? (
                      <Input
                        value={product.name}
                        onChange={(e) =>
                          handleUpdateProduct(product.id, "name", e.target.value)
                        }
                        className="bg-navy/50 border-primary-foreground/20 text-primary-foreground mt-1"
                      />
                    ) : (
                      <p className="text-lg font-bold">{product.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-primary-foreground/70">Category</label>
                      {editingId === product.id ? (
                        <Input
                          value={product.category}
                          onChange={(e) =>
                            handleUpdateProduct(product.id, "category", e.target.value)
                          }
                          className="bg-navy/50 border-primary-foreground/20 text-primary-foreground mt-1"
                        />
                      ) : (
                        <p>{product.category}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-primary-foreground/70">Certification</label>
                      {editingId === product.id ? (
                        <Input
                          value={product.certification}
                          onChange={(e) =>
                            handleUpdateProduct(product.id, "certification", e.target.value)
                          }
                          className="bg-navy/50 border-primary-foreground/20 text-primary-foreground mt-1"
                        />
                      ) : (
                        <p>{product.certification}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-primary-foreground/70">Description</label>
                    {editingId === product.id ? (
                      <textarea
                        value={product.description}
                        onChange={(e) =>
                          handleUpdateProduct(product.id, "description", e.target.value)
                        }
                        className="w-full mt-1 p-2 bg-navy/50 border border-primary-foreground/20 text-primary-foreground rounded-lg"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-primary-foreground/70">{product.description}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    {editingId === product.id ? (
                      <Button
                        onClick={handleSave}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Save Changes
                      </Button>
                    ) : (
                      <button
                        onClick={() => setEditingId(product.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
