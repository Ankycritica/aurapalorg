import { useEffect, useMemo, useState } from "react";
import { Flame, TrendingUp } from "lucide-react";

interface SocialProofBadgeProps {
  toolSlug: string;
  trending?: boolean;
}

// Deterministic pseudo-random count per tool/hour so the number feels stable
// for one user, but slowly shifts upward over time. UI-only social proof.
function liveCount(toolSlug: string): number {
  const now = new Date();
  const seed = `${toolSlug}-${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  // Range 12 — 47 per hour, drifts smoothly per minute
  const base = 12 + (h % 30);
  const drift = Math.floor(now.getUTCMinutes() / 12);
  return base + drift;
}

export function SocialProofBadge({ toolSlug, trending = false }: SocialProofBadgeProps) {
  const [count, setCount] = useState(() => liveCount(toolSlug));

  useEffect(() => {
    const id = setInterval(() => setCount(liveCount(toolSlug)), 30_000);
    return () => clearInterval(id);
  }, [toolSlug]);

  const pulse = useMemo(() => Math.random() > 0.5, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-semibold ring-1 ring-orange-500/25">
        <Flame className={`h-3 w-3 ${pulse ? "animate-pulse" : ""}`} />
        {count} people used this in the last hour
      </div>
      {trending && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 text-primary text-[11px] font-semibold ring-1 ring-primary/25">
          <TrendingUp className="h-3 w-3" />
          Trending tool
        </div>
      )}
    </div>
  );
}
