import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { AdSlot } from "./AdSlot";
import { useAuth } from "@/contexts/AuthContext";

const STAGES = [
  "Reading your input…",
  "Pulling recruiter-grade patterns…",
  "Drafting your result…",
  "Polishing the final output…",
];

/**
 * Replaces the plain spinner during AI generation: shows an ad plus real
 * progress, so the wait time earns money instead of feeling wasted.
 */
export function WaitTimeAd({ toolName, active }: { toolName?: string; active: boolean }) {
  const { user, profile } = useAuth();
  const [stage, setStage] = useState(0);
  const optedOut = Boolean((profile as any)?.ads_opt_out);

  useEffect(() => {
    if (!active) { setStage(0); return; }
    const id = window.setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 3500);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-card p-5 sm:p-6 space-y-5"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">{STAGES[stage]}</p>
          <span className="text-xs text-muted-foreground tabular-nums">{Math.round(((stage + 1) / STAGES.length) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: "8%" }}
            animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {!optedOut && <AdSlot slotId={`wait:${toolName ?? "tool"}`} format="native" toolName={toolName} />}

      {user && !optedOut && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Coins className="h-3.5 w-3.5 text-primary" />
          You earn 50% of the ad revenue from this view — it lands in your Earnings balance.
        </p>
      )}

      <div className="space-y-2.5">
        {[85, 70, 90].map((w, i) => (
          <div key={i} className="h-3.5 rounded shimmer" style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </motion.div>
  );
}
