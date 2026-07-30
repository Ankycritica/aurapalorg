// Ad impression / click tracker + revenue split. Service-role; validates JWT in code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

/** Share of ad revenue paid to the user whose wait time was monetized. */
const USER_REVENUE_SHARE = 0.5;
/** Guardrails so a tampered client can't inflate earnings. */
const MAX_CPM_CENTS = 2000;
const MAX_IMPRESSIONS_PER_HOUR = 120;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Auth is optional: signed-out visitors still see ads, they just don't earn.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization") ?? "";
    if (authHeader) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData } = await (userClient.auth as any).getClaims();
      userId = claimsData?.claims?.sub ?? null;
    }

    const body = await req.json().catch(() => ({}));
    const event: string = String(body.event ?? "impression");
    if (event !== "impression" && event !== "click") return json({ error: "Invalid event" }, 400);

    const slotId = String(body.slotId ?? "unknown").slice(0, 64);
    const network = String(body.network ?? "house").slice(0, 32);
    const format = String(body.format ?? "native").slice(0, 32);
    const toolName = body.toolName ? String(body.toolName).slice(0, 64) : null;
    const durationMs = Number.isFinite(body.durationMs) ? Math.min(Number(body.durationMs), 600000) : null;
    const creativeId = typeof body.creativeId === "string" ? body.creativeId : null;

    // ---- Click: flag the most recent impression for this slot, no extra payout.
    if (event === "click") {
      if (userId) {
        const { data: last } = await admin
          .from("ad_impressions")
          .select("id")
          .eq("user_id", userId)
          .eq("slot_id", slotId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (last) await admin.from("ad_impressions").update({ clicked: true }).eq("id", last.id);
      }
      return json({ ok: true });
    }

    // ---- Impression: server decides the money, never the client.
    let cpmCents = 0;
    if (creativeId) {
      const { data: creative } = await admin
        .from("ad_creatives")
        .select("cpm_cents, active")
        .eq("id", creativeId)
        .maybeSingle();
      if (creative?.active) cpmCents = Number(creative.cpm_cents ?? 0);
    } else {
      // Network-served units: use a per-network floor until reporting reconciles.
      const FLOORS: Record<string, number> = { exchange: 120, adsense: 150, adsterra: 80, house: 0 };
      cpmCents = FLOORS[network] ?? 0;
    }
    cpmCents = Math.max(0, Math.min(cpmCents, MAX_CPM_CENTS));

    const revenueCents = cpmCents / 1000;
    let userShareCents = 0;

    if (userId && revenueCents > 0) {
      // Rate limit per user per hour
      const hourAgo = new Date(Date.now() - 3600_000).toISOString();
      const { count } = await admin
        .from("ad_impressions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", hourAgo);
      if ((count ?? 0) >= MAX_IMPRESSIONS_PER_HOUR) {
        return json({ ok: true, throttled: true });
      }
      userShareCents = revenueCents * USER_REVENUE_SHARE;
    }

    const { data: impression } = await admin
      .from("ad_impressions")
      .insert({
        user_id: userId,
        creative_id: creativeId,
        slot_id: slotId,
        network,
        format,
        tool_name: toolName,
        revenue_cents: revenueCents,
        user_share_cents: userShareCents,
        duration_ms: durationMs,
        country: req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry"),
      })
      .select("id")
      .single();

    if (userId && userShareCents > 0) {
      await admin.from("ad_earnings").insert({
        user_id: userId,
        amount_cents: userShareCents,
        entry_type: "impression_share",
        description: `Ad view · ${network} · ${toolName ?? slotId}`,
        reference_id: impression?.id ?? null,
        status: "pending",
      });

      const { data: profile } = await admin
        .from("profiles")
        .select("ad_earnings_total_cents, ad_payout_balance_cents")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile) {
        await admin
          .from("profiles")
          .update({
            ad_earnings_total_cents: Number(profile.ad_earnings_total_cents ?? 0) + userShareCents,
            ad_payout_balance_cents: Number(profile.ad_payout_balance_cents ?? 0) + userShareCents,
          })
          .eq("user_id", userId);
      }
    }

    return json({ ok: true, earned_cents: userShareCents });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
