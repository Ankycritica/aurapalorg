import { motion } from "framer-motion";
import { Check, Crown, Zap, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Zap,
    features: ["5 AI generations per day", "All 8 tools", "Basic output formatting", "Copy to clipboard"],
    cta: "Current Plan",
    tier: "free" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    icon: Crown,
    features: ["100 AI generations per day", "All 8 tools", "Advanced output formatting", "Priority AI processing", "Export to PDF/DOCX"],
    cta: "Upgrade to Pro",
    tier: "pro" as const,
    popular: true,
  },
  {
    name: "Premium",
    price: "$49",
    period: "/month",
    icon: Sparkles,
    features: ["Unlimited AI generations", "All 8 tools", "Advanced output formatting", "Priority AI processing", "Export to PDF/DOCX", "Custom branding", "Priority support"],
    cta: "Go Premium",
    tier: "premium" as const,
    popular: false,
  },
];

export default function Pricing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleUpgrade = async (tier: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (tier === "free") return;

    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: tier },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Choose the plan that fits your career growth. Upgrade or downgrade anytime.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const isCurrent = profile?.plan === plan.tier;
          return (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 flex flex-col ${plan.popular ? "gradient-border ring-1 ring-primary/20" : ""}`}>
              {plan.popular && (
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 w-fit mb-4">Most Popular</span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <plan.icon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">{plan.name}</h2>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-secondary-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.tier)}
                disabled={isCurrent || loadingTier === plan.tier}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                  isCurrent
                    ? "bg-secondary text-muted-foreground cursor-default"
                    : plan.popular
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                    : "bg-secondary/60 hover:bg-secondary text-foreground"
                } disabled:opacity-50`}
              >
                {isCurrent ? "Current Plan" : loadingTier === plan.tier ? "Loading..." : plan.cta}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
