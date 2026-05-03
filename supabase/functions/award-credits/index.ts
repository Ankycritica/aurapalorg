// Award referral or share credits. Service-role; validates JWT in code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const REFERRAL_CAP = 100;
const SHARE_CAP = 50;
const SHARE_DAILY_CAP = 5;
const REFERRER_REWARD = 10;
const REFERRED_REWARD = 5;
const SHARE_REWARD = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsErr } = await (userClient.auth as any).getClaims();
    const userId = claimsData?.claims?.sub;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action: "share" | "redeem_referral" = body.action;
    const admin = createClient(supabaseUrl, serviceKey);

    if (action === "share") {
      const platform: string = String(body.platform || "unknown").slice(0, 32);

      // Fetch profile
      const { data: profile } = await admin
        .from("profiles")
        .select("share_credits_earned")
        .eq("user_id", userId).single();
      if (!profile) return json({ error: "Profile not found" }, 404);

      if ((profile.share_credits_earned ?? 0) >= SHARE_CAP) {
        return json({ error: "Share credit cap reached", capped: true }, 200);
      }

      // Daily cap via analytics_events
      const since = new Date(); since.setUTCHours(0, 0, 0, 0);
      const { count } = await admin
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("event_name", "share_reward")
        .gte("created_at", since.toISOString());
      if ((count ?? 0) >= SHARE_DAILY_CAP) {
        return json({ error: "Daily share cap reached", daily_capped: true }, 200);
      }

      const newTotal = (profile.share_credits_earned ?? 0) + SHARE_REWARD;
      await admin.from("profiles")
        .update({ share_credits_earned: newTotal })
        .eq("user_id", userId);

      await admin.from("analytics_events").insert({
        user_id: userId, event_name: "share_reward", metadata: { platform, reward: SHARE_REWARD },
      });

      return json({ ok: true, awarded: SHARE_REWARD, total_share_credits: newTotal });
    }

    if (action === "redeem_referral") {
      const code = String(body.code || "").trim().toUpperCase().slice(0, 24);
      if (!code) return json({ error: "Missing code" }, 400);

      // Already referred?
      const { data: existing } = await admin
        .from("referrals").select("id").eq("referred_user_id", userId).maybeSingle();
      if (existing) return json({ error: "Already redeemed", already: true }, 200);

      // Find referrer
      const { data: referrer } = await admin
        .from("profiles").select("user_id, referral_credits_earned, created_at")
        .eq("referral_code", code).maybeSingle();
      if (!referrer) return json({ error: "Invalid referral code" }, 404);
      if (referrer.user_id === userId) return json({ error: "Self-referral" }, 400);

      // Anti-abuse: must be a recently created account (signup flow only)
      const { data: me } = await admin
        .from("profiles").select("created_at").eq("user_id", userId).single();
      if (me) {
        const ageMs = Date.now() - new Date(me.created_at).getTime();
        if (ageMs > 1000 * 60 * 30) {
          return json({ error: "Referral window expired" }, 400);
        }
      }

      // Create referral record
      const { error: refErr } = await admin.from("referrals").insert({
        referrer_id: referrer.user_id, referred_user_id: userId,
      });
      if (refErr) return json({ error: refErr.message }, 400);

      // Award referrer (capped)
      const referrerNew = Math.min(REFERRAL_CAP, (referrer.referral_credits_earned ?? 0) + REFERRER_REWARD);
      await admin.from("profiles").update({ referral_credits_earned: referrerNew })
        .eq("user_id", referrer.user_id);

      // Award the new user as bonus referral credits (separate bucket also capped at REFERRAL_CAP)
      const { data: meCredits } = await admin.from("profiles")
        .select("referral_credits_earned").eq("user_id", userId).single();
      const myNew = Math.min(REFERRAL_CAP, (meCredits?.referral_credits_earned ?? 0) + REFERRED_REWARD);
      await admin.from("profiles").update({ referral_credits_earned: myNew }).eq("user_id", userId);

      return json({ ok: true, awarded: REFERRED_REWARD });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
