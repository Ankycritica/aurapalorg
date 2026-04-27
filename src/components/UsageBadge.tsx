import { useUsage } from "@/hooks/useUsage";
import { Zap, Sparkles } from "lucide-react";

export function UsageBadge() {
  const { remaining, limit, plan, isFree } = useUsage();

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

  const label = isFree ? "credits left" : "left today";
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
      remaining <= 1 ? "bg-destructive/10 text-destructive" : "bg-secondary/60 text-muted-foreground"
    }`}>
      <Zap className="h-3.5 w-3.5" />
      {remaining}/{limit === Infinity ? "∞" : limit} {label}
    </div>
  );
}
