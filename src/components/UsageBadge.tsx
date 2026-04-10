import { useUsage } from "@/hooks/useUsage";
import { Zap } from "lucide-react";

export function UsageBadge() {
  const { remaining, limit, plan } = useUsage();

  if (plan === "premium") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-xs font-medium text-primary">
        <Zap className="h-3.5 w-3.5" /> Unlimited
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
      remaining <= 1 ? "bg-destructive/10 text-destructive" : "bg-secondary/60 text-muted-foreground"
    }`}>
      <Zap className="h-3.5 w-3.5" />
      {remaining}/{limit === Infinity ? "∞" : limit} left today
    </div>
  );
}
