import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"pro" | "premium" | null>(null);

  const startTrial = async (plan: "pro" | "premium") => {
    if (!user) { navigate("/auth"); return; }
    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { plan } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to start trial. Please try again.");
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card gradient-border p-6 sm:p-8 max-w-lg w-full relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3 ring-1 ring-primary/30">
                <Crown className="h-7 w-7 text-primary" />
              </div>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary/15 text-primary mb-3">
                7-day free trial
              </span>
              <h2 className="font-display text-2xl font-bold mb-1">You've used your free credits</h2>
              <p className="text-muted-foreground text-sm">
                Start your <span className="text-foreground font-semibold">7-day free trial</span> to unlock unlimited access. No charge today.
              </p>
            </div>

            <ul className="space-y-2 mb-6 text-sm">
              {[
                "100 AI generations per day (Pro) or unlimited (Premium)",
                "Full results — no blur, no limits",
                "PDF & DOCX export, premium templates",
                "Priority AI processing",
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-secondary-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="space-y-2.5">
              <button
                onClick={() => startTrial("pro")}
                disabled={loading !== null}
                className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading === "pro" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Start 7-day free trial — Pro ($19/mo after)
              </button>
              <button
                onClick={() => startTrial("premium")}
                disabled={loading !== null}
                className="w-full py-2.5 rounded-lg font-medium text-sm border border-border/60 hover:bg-secondary/40 text-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading === "premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Try Premium instead — Unlimited ($49/mo after)
              </button>
            </div>

            <p className="text-[11px] text-center text-muted-foreground mt-4">
              No charge today · Cancel anytime in 1 click · Card required to start trial
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
