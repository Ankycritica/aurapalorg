import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Eye, MousePointerClick, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Summary {
  total_cents: number;
  pending_cents: number;
  impressions: number;
  clicks: number;
}

const fmt = (cents: number) => `$${(Number(cents || 0) / 100).toFixed(4).replace(/0+$/, "").replace(/\.$/, ".00")}`;

/** Shows what a user has earned from ads shown during their AI wait time. */
export function AdEarningsCard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_ad_earnings_summary", { p_user_id: user.id }).then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setSummary(row as unknown as Summary);
    });
  }, [user]);

  if (!user) return null;

  const stats = [
    { icon: Wallet, label: "Total earned", value: fmt(summary?.total_cents ?? 0) },
    { icon: Coins, label: "Pending payout", value: fmt(summary?.pending_cents ?? 0) },
    { icon: Eye, label: "Ad views", value: String(summary?.impressions ?? 0) },
    { icon: MousePointerClick, label: "Clicks", value: String(summary?.clicks ?? 0) },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Coins className="h-5 w-5 text-primary" />
        <h2 className="font-display font-semibold text-lg">Your ad earnings</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        You keep 50% of the revenue from ads shown while AuraPal is thinking. Payouts unlock at $10 via Stripe.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-3 rounded-xl bg-secondary/30">
            <Icon className="h-4 w-4 text-primary mb-1.5" />
            <div className="font-display font-bold text-base tabular-nums">{value}</div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
