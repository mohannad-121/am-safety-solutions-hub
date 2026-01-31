import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, LogOut, Settings } from "lucide-react";

const DEV_MODE = true;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      // Check dev mode first
      if (DEV_MODE) {
        const adminAuth = localStorage.getItem("admin_authenticated");
        const adminUser = localStorage.getItem("admin_user");
        
        if (adminAuth === "true" && adminUser) {
          setUser(JSON.parse(adminUser));
          setLoading(false);
          return;
        }
      }

      // Check Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_authenticated");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="text-primary-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-primary-foreground">
      {/* Header */}
      <header className="bg-navy/80 border-b border-primary-foreground/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
              <span className="text-lg font-bold text-accent-foreground">AM</span>
            </div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-foreground/70">{user?.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-accent/50 text-accent hover:bg-accent/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-lg bg-navy/50 border border-primary-foreground/20 hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate("/admin/products")}
          >
            <Package className="h-8 w-8 text-accent mb-4" />
            <h2 className="text-xl font-bold mb-2">Products</h2>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Add, edit, or remove products from the catalog
            </p>
            <Button size="sm" variant="outline" className="border-accent/50 text-accent">
              Manage Products
            </Button>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg bg-navy/50 border border-primary-foreground/20 hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="h-8 w-8 text-accent mb-4" />
            <h2 className="text-xl font-bold mb-2">Settings</h2>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Configure website settings and preferences
            </p>
            <Button size="sm" variant="outline" className="border-accent/50 text-accent">
              Edit Settings
            </Button>
          </motion.div>

          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg bg-navy/50 border border-primary-foreground/20 hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate("/")}
          >
            <LayoutDashboard className="h-8 w-8 text-accent mb-4" />
            <h2 className="text-xl font-bold mb-2">View Website</h2>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Go back to the main website
            </p>
            <Button size="sm" variant="outline" className="border-accent/50 text-accent">
              Visit Website
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
