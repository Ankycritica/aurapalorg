import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { runAuction, type AdCreative, type AdFormat } from "@/lib/ads/networks";

interface Options {
  slotId: string;
  format?: AdFormat;
  toolName?: string;
  /** Set false to skip fetching entirely (e.g. slot not visible). */
  enabled?: boolean;
}

/**
 * Picks the best ad for a slot: runs the network auction and, in parallel,
 * loads house inventory from the database. Highest CPM wins; house ads are the
 * always-available fallback so a slot is never empty.
 */
export function useAdSlot({ slotId, format = "native", toolName, enabled = true }: Options) {
  const { profile } = useAuth();
  const [creative, setCreative] = useState<AdCreative | null>(null);
  const [loading, setLoading] = useState(false);
  const optedOut = Boolean((profile as any)?.ads_opt_out);
  const startedAt = useRef<number>(0);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || optedOut) { setCreative(null); return; }
    let cancelled = false;
    setLoading(true);
    trackedRef.current = false;
    startedAt.current = Date.now();

    (async () => {
      const [networkBid, houseRows] = await Promise.all([
        runAuction({ slotId, format, toolName }),
        supabase
          .from("ad_creatives")
          .select("id, network, format, headline, body, cta_label, image_url, click_url, advertiser, cpm_cents, weight, target_tools")
          .eq("active", true)
          .then((r) => r.data ?? []),
      ]);

      // Weighted random pick among house ads that target this tool (or all tools)
      const eligible = (houseRows as any[]).filter(
        (c) => !c.target_tools?.length || (toolName && c.target_tools.includes(toolName)),
      );
      let house: AdCreative | null = null;
      if (eligible.length) {
        const total = eligible.reduce((s, c) => s + Math.max(1, c.weight ?? 1), 0);
        let r = Math.random() * total;
        for (const c of eligible) {
          r -= Math.max(1, c.weight ?? 1);
          if (r <= 0) { house = c as AdCreative; break; }
        }
        house = house ?? (eligible[0] as AdCreative);
      }

      const winner =
        networkBid && (!house || networkBid.cpm_cents >= house.cpm_cents) ? networkBid : house;

      if (!cancelled) { setCreative(winner); setLoading(false); }
    })();

    return () => { cancelled = true; };
  }, [slotId, format, toolName, enabled, optedOut]);

  /** Fire once the ad has actually been on screen long enough to count. */
  const trackImpression = async () => {
    if (!creative || trackedRef.current) return;
    trackedRef.current = true;
    try {
      await supabase.functions.invoke("ad-track", {
        body: {
          event: "impression",
          slotId,
          creativeId: creative.id,
          network: creative.network,
          format: creative.format,
          toolName,
          durationMs: Date.now() - startedAt.current,
        },
      });
    } catch { /* never block the product on ad tracking */ }
  };

  const trackClick = async () => {
    if (!creative) return;
    try {
      await supabase.functions.invoke("ad-track", {
        body: { event: "click", slotId, network: creative.network, format: creative.format, toolName },
      });
    } catch { /* ignore */ }
  };

  return { creative, loading, optedOut, trackImpression, trackClick };
}
