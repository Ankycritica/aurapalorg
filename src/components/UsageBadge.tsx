import { useState } from "react";
import { useUsage } from "@/hooks/useUsage";
import { Zap, Sparkles, Gift } from "lucide-react";
import { ReferralModal } from "./ReferralModal";

export function UsageBadge() {
  const { remaining, limit, plan, isFree } = useUsage();
  const [open, setOpen] = useState(false);

  if (plan === "premium") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-xs font-medium text-primary">
        <Zap className="h-3.5 w-3.5" /> Unlimited
      </div>
    );
  }

  if (plan === "trialing") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/15 to-accent/15 text-xs font-semibold text-primary ring-1 ring-primary/30">
        <Sparkles className="h-3.5 w-3.5" /> Trial · {remaining}/{limit} today
      </div>
    );
  }

  const label = isFree ? "credits" : "left today";
  const low = remaining <= 1;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 active:scale-[0.98] ${
          low ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30" : "bg-secondary/60 text-muted-foreground"
        }`}
        title="Earn more credits"
      >
        <Zap className="h-3.5 w-3.5" />
        <span className="tabular-nums">{remaining}/{limit === Infinity ? "∞" : limit}</span>
        <span className="hidden sm:inline">{label}</span>
        {isFree && <Gift className="h-3.5 w-3.5 ml-0.5 text-primary" />}
      </button>
      <ReferralModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
