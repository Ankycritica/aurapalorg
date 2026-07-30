/**
 * Modular ad-network registry.
 *
 * Every network implements the same tiny contract so ad slots stay dumb and
 * networks can be added/removed without touching UI code.
 *
 * To add a network:
 *   1. Add its publisher id to `AD_NETWORK_CONFIG` (or set the VITE_* env var).
 *   2. Append an adapter below.
 *   3. Nothing else — <AdSlot /> picks it up automatically.
 *
 * Integration notes for the three networks we ship adapters for live in
 * `docs/ad-networks.md`.
 */

export type AdFormat = "native" | "banner" | "sponsored_card" | "auction";

export interface AdCreative {
  id: string | null;
  network: string;
  format: AdFormat;
  headline: string;
  body?: string | null;
  cta_label?: string | null;
  image_url?: string | null;
  click_url: string;
  advertiser?: string | null;
  cpm_cents: number;
  /** Raw HTML/script slot — used by script-based networks instead of the fields above. */
  html?: string | null;
}

export interface AdRequest {
  slotId: string;
  format: AdFormat;
  toolName?: string;
  /** Rough estimate of how long the slot will be visible (ms). */
  expectedDurationMs?: number;
}

export interface AdNetworkAdapter {
  id: string;
  label: string;
  /** Higher wins when multiple networks return a bid of equal value. */
  priority: number;
  isEnabled: () => boolean;
  /** Return a creative + bid (in cents CPM), or null to pass. */
  bid: (req: AdRequest) => Promise<AdCreative | null>;
}

const env = import.meta.env as Record<string, string | undefined>;

export const AD_NETWORK_CONFIG = {
  adsense: {
    client: env.VITE_ADSENSE_CLIENT ?? "",
    slot: env.VITE_ADSENSE_SLOT ?? "",
  },
  adsterra: {
    key: env.VITE_ADSTERRA_KEY ?? "",
  },
  /** Generic OpenRTB / header-bidding endpoint (Prebid Server, your own exchange). */
  exchange: {
    endpoint: env.VITE_AD_EXCHANGE_URL ?? "",
  },
};

/** Google AdSense — script-rendered display unit. */
const adsenseAdapter: AdNetworkAdapter = {
  id: "adsense",
  label: "Google AdSense",
  priority: 30,
  isEnabled: () => Boolean(AD_NETWORK_CONFIG.adsense.client && AD_NETWORK_CONFIG.adsense.slot),
  async bid({ format }) {
    const { client, slot } = AD_NETWORK_CONFIG.adsense;
    return {
      id: null,
      network: "adsense",
      format: format === "banner" ? "banner" : "native",
      headline: "",
      click_url: "",
      cpm_cents: 150, // conservative floor estimate; real revenue reconciles via reporting
      html: `<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="${client}" data-ad-slot="${slot}" data-ad-format="fluid" data-full-width-responsive="true"></ins>`,
    };
  },
};

/** Adsterra — native banner via async invoke script. */
const adsterraAdapter: AdNetworkAdapter = {
  id: "adsterra",
  label: "Adsterra",
  priority: 20,
  isEnabled: () => Boolean(AD_NETWORK_CONFIG.adsterra.key),
  async bid({ format }) {
    const key = AD_NETWORK_CONFIG.adsterra.key;
    return {
      id: null,
      network: "adsterra",
      format: format === "banner" ? "banner" : "native",
      headline: "",
      click_url: "",
      cpm_cents: 80,
      html: `<div id="container-${key}"></div><script async data-cfasync="false" src="//pl.profitablecpmrate.com/${key}/invoke.js"></script>`,
    };
  },
};

/** Real-time auction against an OpenRTB-compatible endpoint you control. */
const exchangeAdapter: AdNetworkAdapter = {
  id: "exchange",
  label: "Real-time auction",
  priority: 40,
  isEnabled: () => Boolean(AD_NETWORK_CONFIG.exchange.endpoint),
  async bid(req) {
    try {
      const res = await fetch(AD_NETWORK_CONFIG.exchange.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: req.slotId,
          format: req.format,
          context: req.toolName,
          tmax: 900,
        }),
      });
      if (!res.ok) return null;
      const bid = await res.json();
      if (!bid?.headline && !bid?.html) return null;
      return {
        id: bid.id ?? null,
        network: "exchange",
        format: (bid.format as AdFormat) ?? req.format,
        headline: bid.headline ?? "",
        body: bid.body ?? null,
        cta_label: bid.cta_label ?? null,
        image_url: bid.image_url ?? null,
        click_url: bid.click_url ?? "",
        advertiser: bid.advertiser ?? null,
        cpm_cents: Number(bid.cpm_cents ?? 0),
        html: bid.html ?? null,
      };
    } catch {
      return null;
    }
  },
};

export const AD_NETWORKS: AdNetworkAdapter[] = [exchangeAdapter, adsenseAdapter, adsterraAdapter];

/** Runs a client-side auction across enabled networks; highest CPM wins. */
export async function runAuction(req: AdRequest): Promise<AdCreative | null> {
  const enabled = AD_NETWORKS.filter((n) => n.isEnabled());
  if (!enabled.length) return null;

  const bids = await Promise.all(
    enabled.map(async (n) => {
      try {
        return await n.bid(req);
      } catch {
        return null;
      }
    }),
  );

  const valid = bids.filter(Boolean) as AdCreative[];
  if (!valid.length) return null;

  return valid.sort((a, b) => {
    if (b.cpm_cents !== a.cpm_cents) return b.cpm_cents - a.cpm_cents;
    const pa = AD_NETWORKS.find((n) => n.id === a.network)?.priority ?? 0;
    const pb = AD_NETWORKS.find((n) => n.id === b.network)?.priority ?? 0;
    return pb - pa;
  })[0];
}
