import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdSlot } from "@/hooks/useAdSlot";
import type { AdFormat } from "@/lib/ads/networks";

interface AdSlotProps {
  slotId: string;
  format?: AdFormat;
  toolName?: string;
  enabled?: boolean;
  className?: string;
}

/**
 * A single, self-contained ad placement. Handles auction, render, viewability
 * and impression/click tracking. Renders nothing if the user opted out or no
 * creative is available.
 */
export function AdSlot({ slotId, format = "native", toolName, enabled = true, className = "" }: AdSlotProps) {
  const { creative, trackImpression, trackClick } = useAdSlot({ slotId, format, toolName, enabled });
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Viewability: count the impression only after 1.2s of being ≥50% on screen.
  useEffect(() => {
    if (!creative || !ref.current) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = window.setTimeout(() => trackImpression(), 1200);
        } else if (timer) {
          window.clearTimeout(timer);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(ref.current);
    return () => { io.disconnect(); if (timer) window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creative]);

  if (!creative) return null;

  const handleClick = () => {
    trackClick();
    const url = creative.click_url;
    if (!url) return;
    if (url.startsWith("/")) navigate(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  };

  // Script/HTML-based network unit
  if (creative.html) {
    return (
      <div ref={ref} className={className}>
        <AdLabel network={creative.network} />
        <div className="rounded-xl overflow-hidden bg-secondary/20 border border-border/40"
          dangerouslySetInnerHTML={{ __html: creative.html }} />
      </div>
    );
  }

  const isBanner = creative.format === "banner";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <AdLabel network={creative.network} advertiser={creative.advertiser} />
      <button
        onClick={handleClick}
        className={`group w-full text-left rounded-xl border border-border/50 bg-gradient-to-br from-secondary/40 via-card/40 to-secondary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_10px_40px_-16px_hsl(var(--primary)/0.5)] ${
          isBanner ? "p-4 flex items-center gap-4" : "p-5"
        }`}
      >
        {creative.image_url && (
          <img
            src={creative.image_url}
            alt=""
            loading="lazy"
            className={isBanner ? "h-14 w-14 rounded-lg object-cover shrink-0" : "w-full h-32 rounded-lg object-cover mb-3"}
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
            {creative.headline}
          </h3>
          {creative.body && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-3">{creative.body}</p>
          )}
          {creative.cta_label && (
            <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary">
              {creative.cta_label}
              <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </button>
    </motion.div>
  );
}

function AdLabel({ network, advertiser }: { network: string; advertiser?: string | null }) {
  const isHouse = network === "house";
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {isHouse ? <Sparkles className="h-3 w-3" /> : null}
        {isHouse ? "From AuraPal" : "Sponsored"}
      </span>
      {advertiser && !isHouse && (
        <span className="text-[10px] text-muted-foreground/60">{advertiser}</span>
      )}
    </div>
  );
}
