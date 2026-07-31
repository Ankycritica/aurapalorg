# Ad network integration guide

AuraPal's ad system is network-agnostic. Slots ask a registry for the best
available creative; whichever network bids highest wins. House ads are the
always-on fallback, so a slot is never empty — you can ship before any network
approves you.

## Architecture

```
<AdSlot slotId format toolName />
        │
        ├── useAdSlot()  ──►  runAuction()      → src/lib/ads/networks.ts (adapters)
        │                └──►  ad_creatives     → house / direct-sold inventory (DB)
        │
        └── viewability (IntersectionObserver, 50% for 1.2s)
                    │
                    └──► edge function `ad-track`
                             ├── ad_impressions   (audit trail, server-priced)
                             ├── ad_earnings      (user ledger, 50% share)
                             └── profiles.ad_payout_balance_cents
```

Revenue is **priced on the server only** (`ad-track`). The client never sends an
amount, so a tampered browser cannot mint earnings. Per-user throttle: 120
impressions/hour.

## Adding a network

1. Add its config to `AD_NETWORK_CONFIG` in `src/lib/ads/networks.ts`.
2. Add an adapter object with `isEnabled()` and `bid()`.
3. Add its revenue floor to the `FLOORS` map in
   `supabase/functions/ad-track/index.ts` so impressions are priced correctly.

No UI changes are required.

---

## 1. Google AdSense

Best CPMs, strictest approval (needs real traffic + a privacy policy — we have
`/privacy`).

1. Sign up at <https://adsense.google.com>, add `aurapal.org`, verify the site.
2. Create an **In-article / Fluid** display unit.
3. Add build/runtime env vars:
   ```
   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   VITE_ADSENSE_SLOT=1234567890
   ```
4. Add the AdSense loader once in `index.html`:
   ```html
   <script async crossorigin="anonymous"
     src="https://pagead2.googlefonts.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"></script>
   ```
   (use the exact URL AdSense gives you), then call `(adsbygoogle = window.adsbygoogle || []).push({})`
   after the slot mounts.
5. Reconcile real revenue weekly from the AdSense report and adjust the
   `adsense` floor.

## 2. Adsterra

Instant approval, works with low traffic — the right first network.

1. Sign up at <https://publishers.adsterra.com>, add the site.
2. Create a **Native Banner** placement; copy its key from the invoke URL.
3. Set `VITE_ADSTERRA_KEY=<key>`.
4. Payouts: NET-15, $5 minimum (Paxum / crypto / wire).

## 3. Real-time auction (OpenRTB / Prebid Server)

For direct demand or a header-bidding wrapper you host.

1. Stand up Prebid Server (or any endpoint returning the JSON below).
2. Set `VITE_AD_EXCHANGE_URL=https://bids.yourdomain.com/auction`.
3. Expected response:
   ```json
   {
     "id": "bid_123",
     "format": "native",
     "headline": "…",
     "body": "…",
     "cta_label": "Learn more",
     "image_url": "https://…",
     "click_url": "https://…",
     "advertiser": "Acme",
     "cpm_cents": 240
   }
   ```
   Return `204`/empty to pass. Timeout budget is 900ms — slots fall back to
   house inventory if the auction is slow.

## Direct-sold / house inventory

Insert rows into `ad_creatives` (`network = 'house'` or an advertiser name).
`weight` controls rotation share, `target_tools` limits a creative to specific
tools, `cpm_cents` is what the impression is worth (set this for direct deals so
users earn their 50% correctly).

## Payouts

`ad_earnings` accrues per user with `status = 'pending'`.
Phase 3 wires Stripe Connect Express: onboard the user, then transfer the
pending balance once it clears $10 and flip those rows to `status = 'paid'`.
