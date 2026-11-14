import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";

const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ADMIN === "true";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    siteName: "AM Building Solutions",
    siteEmail: "info@ambuildingsolutions.com",
    sitePhone: "+1 (234) 567-890",
    address: "123 Construction Ave, Safety City, SC 12345",
    about: "AM Building Solutions provides industry-leading edge protection, safety nets, and fall prevention systems.",
  });
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<{ id?: string; email?: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check dev mode first
      if (DEV_MODE) {
        const adminAuth = localStorage.getItem("admin_authenticated");
        const adminUser = localStorage.getItem("admin_user");
        
        if (adminAuth === "true" && adminUser) {
          setUser(JSON.parse(adminUser));
        } else {
          navigate("/admin/login");
          return;
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/admin/login");
        } else {
          setUser(user);
        }
      }
    };
    checkAuth();

    // Load settings from localStorage
    const saved = localStorage.getItem("admin_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, [navigate]);

  const handleUpdateSetting = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <Button
            onClick={handleSaveSettings}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400"
          >
            ✓ Settings saved successfully!
          </motion.div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-lg bg-navy/50 border border-primary-foreground/20"
          >
            <h2 className="text-xl font-bold mb-6">General Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-primary-foreground/70 mb-2">Site Name</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => handleUpdateSetting("siteName", e.target.value)}
                  className="bg-navy/50 border-primary-foreground/20 text-primary-foreground"
                />
              </div>

              <div>
                <label className="block text-sm text-primary-foreground/70 mb-2">Site Email</label>
                <Input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => handleUpdateSetting("siteEmail", e.target.value)}
                  className="bg-navy/50 border-primary-foreground/20 text-primary-foreground"
                />
              </div>

              <div>
                <label className="block text-sm text-primary-foreground/70 mb-2">Site Phone</label>
                <Input
                  value={settings.sitePhone}
                  onChange={(e) => handleUpdateSetting("sitePhone", e.target.value)}
                  className="bg-navy/50 border-primary-foreground/20 text-primary-foreground"
                />
              </div>

              <div>
                <label className="block text-sm text-primary-foreground/70 mb-2">Address</label>
                <Input
                  value={settings.address}
                  onChange={(e) => handleUpdateSetting("address", e.target.value)}
                  className="bg-navy/50 border-primary-foreground/20 text-primary-foreground"
                />
              </div>

              <div>
                <label className="block text-sm text-primary-foreground/70 mb-2">About Us</label>
                <textarea
                  value={settings.about}
                  onChange={(e) => handleUpdateSetting("about", e.target.value)}
                  className="w-full p-3 bg-navy/50 border border-primary-foreground/20 text-primary-foreground rounded-lg"
                  rows={5}
                />
              </div>
            </div>
          </motion.div>

          {/* User Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg bg-navy/50 border border-primary-foreground/20"
          >
            <h2 className="text-xl font-bold mb-6">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-primary-foreground/70">Email</label>
                <p className="text-primary-foreground">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-primary-foreground/70">User ID</label>
                <p className="text-primary-foreground text-sm font-mono">{user?.id}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
