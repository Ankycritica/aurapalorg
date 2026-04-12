import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const { usageCount, remaining, limit, plan } = useUsage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initials = (profile?.display_name || user?.email || "U").slice(0, 1).toUpperCase();

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("🎉 Welcome to Pro! Your plan has been upgraded.");
      supabase.functions.invoke("check-subscription").then(() => window.location.reload());
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to open subscription management. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Account</h2>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <p className="font-medium text-foreground">{profile?.display_name || "User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h2 className="font-display font-semibold text-lg">Usage</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Plan</span>
          <span className="text-sm font-semibold text-primary capitalize">{plan}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Used Today</span>
          <span className="text-sm font-medium">{usageCount} / {limit === Infinity ? "∞" : limit}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
            style={{ width: `${limit === Infinity ? 5 : Math.min(100, (usageCount / limit) * 100)}%` }}
          />
        </div>
        {(plan === "pro" || plan === "premium") && (
          <button
            onClick={handleManageSubscription}
            className="mt-2 w-full py-2.5 rounded-lg text-sm font-medium border border-border/50 hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" /> Manage Subscription
          </button>
        )}
      </div>

      {plan === "free" && (
        <div className="glass-card p-6 gradient-border">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-lg gradient-text">Upgrade to Premium</h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 mb-4">
            <li>✓ Unlimited AI generations</li>
            <li>✓ Priority support</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Export to PDF/DOCX</li>
            <li>✓ Custom branding</li>
          </ul>
          <Link to="/pricing" className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity block text-center">
            View Pricing Plans
          </Link>
        </div>
      )}

      <button onClick={handleSignOut}
        className="w-full glass-card p-4 flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors rounded-xl">
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
}
