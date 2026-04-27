import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  trigger?: "exit_intent" | "checkout_cancelled" | "trial_ended";
  defaultPlan?: "pro" | "premium";
}

const COUPON_CODE = "AURAPAL10";

export function CouponModal({ open, onClose, trigger = "exit_intent", defaultPlan = "pro" }: CouponModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { track } = useAnalytics();
  const [loading, setLoading] = useState<"pro" | "premium" | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const applyDiscount = async (plan: "pro" | "premium") => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(plan);
    track("coupon_used", { code: COUPON_CODE, plan, trigger, applied: true });
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, coupon: COUPON_CODE },
      });
      if (error) throw error;
      if (data?.url) {
        track("conversion_with_coupon", { code: COUPON_CODE, plan, trigger });
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to apply discount. Please try again.");
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card gradient-border p-6 sm:p-8 max-w-md w-full relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center mx-auto mb-3 ring-1 ring-primary/30">
                <Gift className="h-7 w-7 text-primary" />
              </div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/15 text-primary mb-3">
                Limited-time offer
              </span>
              <h2 className="font-display text-2xl font-bold mb-2 leading-tight">
                Wait — here's <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">10% off</span> your first month
              </h2>
              <p className="text-muted-foreground text-sm">
                Apply this code at checkout and save on your first billing cycle. Trial still applies — no charge today.
              </p>
            </div>

            <button
              onClick={copyCode}
              className="w-full mb-5 group relative overflow-hidden rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all px-4 py-3 flex items-center justify-between"
            >
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Your code</div>
                <div className="font-mono text-lg font-bold text-foreground tracking-widest">{COUPON_CODE}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
              </div>
            </button>

            <div className="space-y-2.5">
              <button
                onClick={() => applyDiscount(defaultPlan)}
                disabled={loading !== null}
                className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)]"
              >
                {loading === defaultPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                Apply Discount — Start {defaultPlan === "pro" ? "Pro" : "Premium"} Trial
              </button>
              <button
                onClick={() => applyDiscount(defaultPlan === "pro" ? "premium" : "pro")}
                disabled={loading !== null}
                className="w-full py-2.5 rounded-lg font-medium text-sm border border-border/60 hover:bg-secondary/40 text-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && loading !== defaultPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Apply on {defaultPlan === "pro" ? "Premium" : "Pro"} instead
              </button>
            </div>

            <p className="text-[11px] text-center text-muted-foreground mt-4">
              10% off first month · 7-day free trial · Cancel anytime
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
