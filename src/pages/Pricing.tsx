import { motion } from "framer-motion";
import { Check, Crown, Zap, Sparkles, Shield, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { CouponModal } from "@/components/CouponModal";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Zap,
    tagline: "Try every tool, no credit card",
    features: [
      "5 AI generations per day",
      "All 10 career & growth tools",
      "Resume + Cover Letter + LinkedIn",
      "Basic output formatting",
      "Copy & share to social",
    ],
    cta: "Current Plan",
    tier: "free" as const,
    popular: false,
    badge: null as string | null,
  },
  {
    name: "Pro",
    price: "$19",
    originalPrice: "$29",
    period: "/month",
    icon: Crown,
    tagline: "For serious job seekers & creators",
    features: [
      "100 AI generations per day (20× more)",
      "Resume Builder + LinkedIn optimization",
      "Cover Letter + Interview Prep + Salary Check",
      "Priority AI processing (3× faster)",
      "Unlock full results — no blur",
      "Export to PDF / DOCX",
      "40+ premium resume templates",
    ],
    cta: "Start 7-day Free Trial",
    tier: "pro" as const,
    popular: true,
    badge: "🔥 Most Popular — 7-day free trial",
  },
  {
    name: "Premium",
    price: "$49",
    period: "/month",
    icon: Sparkles,
    tagline: "For agencies, founders & power users",
    features: [
      "Unlimited AI generations",
      "Everything in Pro",
      "Custom branding on exports",
      "Priority email support",
      "Early access to new tools",
      "Commercial use license",
    ],
    cta: "Start 7-day Free Trial",
    tier: "premium" as const,
    popular: false,
    badge: "✨ Best Value — 7-day free trial",
  },
];

const trustItems = [
  { icon: Shield, text: "7-day free trial · No charge today" },
  { icon: Clock, text: "Cancel anytime, instantly" },
  { icon: TrendingUp, text: "Trusted by 10,000+ professionals" },
];

export default function Pricing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { track } = useAnalytics();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponPlan, setCouponPlan] = useState<"pro" | "premium">("pro");
  const [couponTrigger, setCouponTrigger] = useState<"exit_intent" | "checkout_cancelled" | "trial_ended">("exit_intent");
  const shownRef = useRef(false);

  const showCoupon = (plan: "pro" | "premium", trigger: "exit_intent" | "checkout_cancelled" | "trial_ended") => {
    if (shownRef.current) return;
    if (sessionStorage.getItem("aurapal_coupon_shown") === "1") return;
    if (profile?.plan === "pro" || profile?.plan === "premium" || profile?.plan === "trialing") return;
    shownRef.current = true;
    sessionStorage.setItem("aurapal_coupon_shown", "1");
    setCouponPlan(plan);
    setCouponTrigger(trigger);
    setCouponOpen(true);
    track("coupon_shown", { trigger, plan });
  };

  // Trigger 1: checkout cancelled (URL param from Stripe cancel_url)
  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      showCoupon("pro", "checkout_cancelled");
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger 2: trial ended without conversion
  useEffect(() => {
    if (profile?.plan === "free" && profile?.trial_end && new Date(profile.trial_end) < new Date()) {
      showCoupon("pro", "trial_ended");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.plan, profile?.trial_end]);

  // Trigger 3: exit intent (mouse leaves viewport top)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) showCoupon("pro", "exit_intent");
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.plan]);

  const handleUpgrade = async (tier: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (tier === "free") return;

    track("subscription_created", { tier, action: "checkout_started" });
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
    <div className="max-w-6xl mx-auto space-y-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold text-primary">
          🔥 Limited launch pricing — locked in for life
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          Stop guessing. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Start landing.</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
          Get the AI career engine 10,000+ professionals use to land interviews, optimize LinkedIn, and validate ideas — for less than a coffee a week.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const isCurrent = profile?.plan === plan.tier;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass-card p-6 flex flex-col transition-all duration-300 ${
                plan.popular ? "gradient-border ring-2 ring-primary/40 md:scale-[1.03] shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)]" : "hover:ring-1 hover:ring-primary/20"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold px-3 py-1 rounded-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                    : "bg-secondary text-foreground border border-border"
                }`}>
                  {plan.badge}
                </div>
              )}
              <div className="flex items-center gap-2 mb-1 mt-2">
                <plan.icon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">{plan.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{plan.tagline}</p>
              <div className="mb-5 flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
                {plan.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                )}
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
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)]"
                    : "bg-secondary/60 hover:bg-secondary text-foreground"
                } disabled:opacity-50`}
              >
                {isCurrent ? "Current Plan" : loadingTier === plan.tier ? "Loading..." : plan.cta}
              </button>
              {(plan.tier === "pro" || plan.tier === "premium") && !isCurrent && (
                <p className="text-[11px] text-center text-muted-foreground mt-2">No charge today · Cancel anytime · Card required</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-2">
        {trustItems.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Icon className="h-4 w-4 text-primary" />
            {text}
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass-card p-6 sm:p-8 text-center max-w-3xl mx-auto">
        <h3 className="font-display text-xl font-bold mb-2">What you get with Pro vs Free</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Free is great to try. Pro is what you need to actually <span className="text-foreground font-semibold">land the interview, get the offer, validate the idea</span>.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="text-2xl font-display font-bold text-primary">20×</div>
            <div className="text-muted-foreground">More daily generations</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="text-2xl font-display font-bold text-primary">3×</div>
            <div className="text-muted-foreground">Faster AI processing</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="text-2xl font-display font-bold text-primary">100%</div>
            <div className="text-muted-foreground">Full results, zero blur</div>
          </div>
        </div>
      </motion.div>

      <CouponModal
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        trigger={couponTrigger}
        defaultPlan={couponPlan}
      />
    </div>
  );
}
