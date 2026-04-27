import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_UJ95ke4gJIY1yn": "pro",
  "prod_UJ963RL5LJEYrq": "premium",
};

const ADMIN_EMAILS = new Set(["dongare.ankit29@gmail.com"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Validate JWT via getClaims on a clean anon client (no user header injected)
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = claimsData.claims.sub as string;
    const email = claimsData.claims.email as string;
    if (!email) {
      return new Response(JSON.stringify({ error: "User email not found in token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Admin override — always premium, never downgrade
    if (ADMIN_EMAILS.has(email.toLowerCase())) {
      await supabaseAdmin.from("profiles").update({ plan: "premium" }).eq("user_id", userId);
      return new Response(JSON.stringify({ subscribed: true, plan: "premium", admin: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Respect manually-granted plans (admin-set-plan). If no Stripe customer exists,
    // don't reset a plan that an admin explicitly set.
    const { data: currentProfile } = await supabaseAdmin
      .from("profiles")
      .select("plan, stripe_customer_id, grace_until")
      .eq("user_id", userId)
      .single();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      const keepPlan = currentProfile?.plan && currentProfile.plan !== "free" ? currentProfile.plan : "free";
      await supabaseAdmin.from("profiles").update({
        plan: keepPlan,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: null,
      }).eq("user_id", userId);
      return new Response(JSON.stringify({ subscribed: keepPlan !== "free", plan: keepPlan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    // Look at any non-canceled subscription (trialing, active, past_due, unpaid)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    });
    const sub = subscriptions.data.find(s =>
      ["trialing", "active", "past_due", "unpaid"].includes(s.status)
    );

    if (!sub) {
      // No live subscription. Apply grace period if recently past_due.
      const grace = currentProfile?.grace_until ? new Date(currentProfile.grace_until) : null;
      const inGrace = grace && grace.getTime() > Date.now();
      const keepPlan = inGrace
        ? currentProfile!.plan
        : (currentProfile?.plan && currentProfile.plan !== "free" && currentProfile.plan !== "trialing" ? currentProfile.plan : "free");
      await supabaseAdmin.from("profiles").update({
        plan: keepPlan,
        stripe_customer_id: customerId,
        stripe_subscription_id: null,
        subscription_status: "canceled",
      }).eq("user_id", userId);
      return new Response(JSON.stringify({ subscribed: keepPlan !== "free", plan: keepPlan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productId = sub.items.data[0].price.product as string;
    const paidPlan = PRODUCT_TO_PLAN[productId] || "pro";

    let plan: string = paidPlan;
    let graceUntil: string | null = null;
    let trialStart: string | null = null;
    let trialEnd: string | null = null;

    if (sub.status === "trialing") {
      plan = "trialing";
      trialStart = sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null;
      trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
    } else if (sub.status === "active") {
      plan = paidPlan;
    } else if (sub.status === "past_due" || sub.status === "unpaid") {
      // 3-day grace from now (or keep existing grace if already set and not yet over)
      const existingGrace = currentProfile?.grace_until ? new Date(currentProfile.grace_until) : null;
      if (existingGrace && existingGrace.getTime() > Date.now()) {
        plan = paidPlan;
        graceUntil = existingGrace.toISOString();
      } else if (!existingGrace) {
        plan = paidPlan;
        graceUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        // grace expired -> downgrade
        plan = "free";
      }
    }

    await supabaseAdmin.from("profiles").update({
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      trial_start: trialStart,
      trial_end: trialEnd,
      grace_until: graceUntil,
    }).eq("user_id", userId);

    return new Response(JSON.stringify({
      subscribed: plan !== "free",
      plan,
      status: sub.status,
      trial_end: trialEnd,
      grace_until: graceUntil,
      subscription_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
