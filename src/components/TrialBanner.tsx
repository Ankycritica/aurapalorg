import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TrialBanner() {
  const { profile } = useAuth();

  if (!profile) return null;

  const now = Date.now();

  // Past-due grace
  if (profile.subscription_status === "past_due" && profile.grace_until) {
    const graceMs = new Date(profile.grace_until).getTime() - now;
    if (graceMs > 0) {
      const days = Math.max(1, Math.ceil(graceMs / (1000 * 60 * 60 * 24)));
      return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 bg-destructive/10 border border-destructive/30 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-destructive">Payment failed — {days} {days === 1 ? "day" : "days"} grace remaining</p>
            <p className="text-xs text-muted-foreground mt-0.5">Update your payment method to keep premium access.</p>
          </div>
          <ManageButton label="Update payment" />
        </motion.div>
      );
    }
  }

  if (profile.plan !== "trialing" || !profile.trial_end) return null;

  const trialMs = new Date(profile.trial_end).getTime() - now;
  if (trialMs <= 0) return null;

  const days = Math.ceil(trialMs / (1000 * 60 * 60 * 24));
  const urgent = days <= 2;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 flex items-center gap-3 border ${
        urgent
          ? "bg-destructive/10 border-destructive/30"
          : "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30"
      }`}>
      <Clock className={`h-5 w-5 shrink-0 ${urgent ? "text-destructive" : "text-primary"}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${urgent ? "text-destructive" : "text-foreground"}`}>
          🎉 Free trial — {days} {days === 1 ? "day" : "days"} left
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You'll be charged automatically when the trial ends. Cancel anytime, no questions asked.
        </p>
      </div>
      <ManageButton label="Manage" />
    </motion.div>
  );
}

function ManageButton({ label }: { label: string }) {
  const handleClick = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to open billing portal.");
    }
  };
  return (
    <button onClick={handleClick}
      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/60 hover:bg-secondary text-foreground transition-colors">
      {label}
    </button>
  );
}
