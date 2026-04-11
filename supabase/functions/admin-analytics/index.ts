import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "dongare.ankit29@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getUser();
    if (claimsError || !claimsData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (claimsData.user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Parse date range from request
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "30"; // days
    const daysAgo = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const startDateStr = startDate.toISOString();

    // --- Database Analytics ---

    // Fetch all profiles
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("user_id, email, display_name, plan, created_at")
      .order("created_at", { ascending: false });

    // Fetch tool usage stats
    const { data: usageData } = await adminClient
      .from("usage_tracking")
      .select("tool_name, usage_date, created_at")
      .gte("created_at", startDateStr);

    // Count by tool
    const toolMap: Record<string, number> = {};
    (usageData || []).forEach((row: any) => {
      toolMap[row.tool_name] = (toolMap[row.tool_name] || 0) + 1;
    });
    const toolStats = Object.entries(toolMap)
      .map(([tool_name, count]) => ({ tool_name, count }))
      .sort((a, b) => b.count - a.count);

    // Total generations
    const { count: totalGenerations } = await adminClient
      .from("generations")
      .select("id", { count: "exact", head: true });

    // --- Analytics Events ---
    const { data: events } = await adminClient
      .from("analytics_events")
      .select("event_name, user_id, metadata, device, browser, country, created_at")
      .gte("created_at", startDateStr)
      .order("created_at", { ascending: false })
      .limit(5000);

    // Process events
    const eventCounts: Record<string, number> = {};
    const dailyEvents: Record<string, Record<string, number>> = {};
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const uniqueUsers = new Set<string>();
    const dailyActiveUsers: Record<string, Set<string>> = {};

    (events || []).forEach((e: any) => {
      // Event counts
      eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;

      // Daily breakdown
      const day = e.created_at.split("T")[0];
      if (!dailyEvents[day]) dailyEvents[day] = {};
      dailyEvents[day][e.event_name] = (dailyEvents[day][e.event_name] || 0) + 1;

      // Device/browser/country
      if (e.device) deviceCounts[e.device] = (deviceCounts[e.device] || 0) + 1;
      if (e.browser) browserCounts[e.browser] = (browserCounts[e.browser] || 0) + 1;
      if (e.country) countryCounts[e.country] = (countryCounts[e.country] || 0) + 1;

      // Unique users
      if (e.user_id) {
        uniqueUsers.add(e.user_id);
        if (!dailyActiveUsers[day]) dailyActiveUsers[day] = new Set();
        dailyActiveUsers[day].add(e.user_id);
      }
    });

    // Convert daily active users to counts
    const dauData = Object.entries(dailyActiveUsers)
      .map(([date, users]) => ({ date, count: users.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily event breakdown for charts
    const dailyEventData = Object.entries(dailyEvents)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Stripe Analytics ---
    let stripeData: any = {
      totalRevenue: 0,
      mrr: 0,
      activeSubscriptions: 0,
      canceledSubscriptions: 0,
      failedPayments: 0,
      revenueByDay: [],
      subscriptionsByStatus: {},
    };

    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

        // Active subscriptions
        const activeSubs = await stripe.subscriptions.list({ status: "active", limit: 100 });
        const canceledSubs = await stripe.subscriptions.list({ status: "canceled", limit: 100 });

        stripeData.activeSubscriptions = activeSubs.data.length;
        stripeData.canceledSubscriptions = canceledSubs.data.length;

        // Calculate MRR from active subscriptions
        let mrr = 0;
        activeSubs.data.forEach((sub: any) => {
          sub.items.data.forEach((item: any) => {
            if (item.price.recurring?.interval === "month") {
              mrr += item.price.unit_amount || 0;
            } else if (item.price.recurring?.interval === "year") {
              mrr += Math.round((item.price.unit_amount || 0) / 12);
            }
          });
        });
        stripeData.mrr = mrr; // in cents

        // Recent invoices for revenue
        const invoices = await stripe.invoices.list({
          limit: 100,
          created: { gte: Math.floor(startDate.getTime() / 1000) },
        });

        let totalRevenue = 0;
        const revenueByDay: Record<string, number> = {};
        invoices.data.forEach((inv: any) => {
          if (inv.status === "paid") {
            totalRevenue += inv.amount_paid;
            const day = new Date(inv.created * 1000).toISOString().split("T")[0];
            revenueByDay[day] = (revenueByDay[day] || 0) + inv.amount_paid;
          }
        });
        stripeData.totalRevenue = totalRevenue; // in cents
        stripeData.revenueByDay = Object.entries(revenueByDay)
          .map(([date, amount]) => ({ date, amount: amount / 100 }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Failed payments
        const failedInvoices = invoices.data.filter((inv: any) => inv.status === "uncollectible" || inv.attempted && !inv.paid);
        stripeData.failedPayments = failedInvoices.length;

        // Churn rate
        const totalSubs = stripeData.activeSubscriptions + stripeData.canceledSubscriptions;
        stripeData.churnRate = totalSubs > 0 ? ((stripeData.canceledSubscriptions / totalSubs) * 100).toFixed(1) : "0";
      }
    } catch (stripeErr) {
      console.error("Stripe error:", stripeErr);
    }

    // --- Funnel data ---
    const funnelSteps = [
      { name: "Page Views", count: eventCounts["page_view"] || 0 },
      { name: "Sign Ups", count: (profiles || []).filter((p: any) => p.created_at >= startDateStr).length },
      { name: "Tool Used", count: (usageData || []).length },
      { name: "Subscribed", count: stripeData.activeSubscriptions },
    ];

    const proUsers = (profiles || []).filter((u: any) => u.plan === "pro").length;
    const premiumUsers = (profiles || []).filter((u: any) => u.plan === "premium").length;

    return new Response(
      JSON.stringify({
        users: profiles || [],
        toolStats,
        totalGenerations: totalGenerations || 0,
        proUsers,
        premiumUsers,
        eventCounts,
        dailyEventData,
        dauData,
        deviceCounts,
        browserCounts,
        countryCounts,
        uniqueVisitors: uniqueUsers.size,
        stripeData,
        funnelSteps,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin analytics error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
