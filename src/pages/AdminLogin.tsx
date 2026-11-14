import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import { AdminSeo } from "@/components/admin/AdminSeo";

const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ADMIN === "true";
const DEV_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD || "";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = new URLSearchParams(location.search).get("next");
  const destination = requestedPath?.startsWith("/admin/") ? requestedPath : "/admin/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // DEV MODE LOGIN
      if (DEV_MODE && !useMagicLink && password === DEV_PASSWORD) {
        localStorage.setItem("admin_user", JSON.stringify({ email, id: "dev-user" }));
        localStorage.setItem("admin_authenticated", "true");
        navigate(destination, { replace: true });
        return;
      }

      if (useMagicLink) {
        // Send magic link
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}${destination}`,
          },
        });

        if (signInError) throw signInError;
        setEmailSent(true);
      } else {
        // Regular password login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          localStorage.setItem("admin_user", JSON.stringify(data.user));
          localStorage.setItem("admin_authenticated", "true");
          navigate(destination, { replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy to-navy/90 px-4"><AdminSeo title="AMBS Admin Login" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent mb-4">
            <span className="text-2xl font-bold text-accent-foreground">AM</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-4">Check Your Email</h1>
          <p className="text-primary-foreground/70 mb-6">
            We've sent a magic link to <strong>{email}</strong>. Click it to access the admin panel.
          </p>
          <Button
            onClick={() => {
              setEmailSent(false);
              setEmail("");
            }}
            variant="outline"
            className="border-accent/50 text-accent"
          >
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy to-navy/90 px-4"><AdminSeo title="AMBS Admin Login" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent mb-4">
            <span className="text-2xl font-bold text-accent-foreground">AM</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">Admin Panel</h1>
          <p className="text-primary-foreground/70">Sign in to manage the website</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          {DEV_MODE && !useMagicLink && (
            <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs">
              Local development access is enabled through environment variables.
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ambs.ae"
                className="pl-10 bg-navy/50 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                required
              />
            </div>
          </div>

          {!useMagicLink && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-navy/50 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2"
          >
            {loading ? "Signing in..." : useMagicLink ? "Send Magic Link" : "Sign In"}
          </Button>

          <div className="text-center pt-4 border-t border-primary-foreground/20">
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(!useMagicLink);
                setError("");
              }}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {useMagicLink ? "Use Password Instead" : "Use Magic Link Instead"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-primary-foreground/60 mt-6">
          © 2026 AM Building Solutions. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
