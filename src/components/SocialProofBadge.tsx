import { useEffect, useState } from "react";
import { Flame, TrendingUp } from "lucide-react";

interface SocialProofBadgeProps {
  toolSlug: string;
  trending?: boolean;
}

function randomCount() {
  // 12 — 67 inclusive
  return Math.floor(Math.random() * 56) + 12;
}

export function SocialProofBadge({ toolSlug, trending = false }: SocialProofBadgeProps) {
  const [count, setCount] = useState<number>(() => randomCount());

  useEffect(() => {
    const id = setInterval(() => setCount(randomCount()), 45_000);
    return () => clearInterval(id);
  }, [toolSlug]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-semibold ring-1 ring-orange-500/25">
        <Flame className="h-3 w-3 animate-pulse" />
        <span className="tabular-nums">{count}</span> people used this in the last hour
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
