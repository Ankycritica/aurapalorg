import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HR_CREDIT_COST = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await (userClient.auth as any).getClaims(token);
    const userId = claimsData?.claims?.sub;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const company = String(body.company ?? "").trim().slice(0, 120);
    let domain = String(body.domain ?? "").trim().toLowerCase().slice(0, 120);
    if (!domain && company) {
      // crude domain guess from company name
      domain = company.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
    }
    if (!domain) {
      return new Response(JSON.stringify({ error: "company or domain required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Cache (30 days) — free re-reveal
    const { data: cached } = await admin
      .from("hr_email_cache")
      .select("payload, created_at")
      .eq("user_id", userId)
      .eq("company_domain", domain)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cached && Date.now() - new Date(cached.created_at).getTime() < 30 * 24 * 3600 * 1000) {
      return new Response(JSON.stringify({ ...cached.payload, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side credit check
    const { data: profile } = await admin.from("profiles").select("plan").eq("user_id", userId).single();
    const plan = profile?.plan ?? "free";
    const isFree = plan === "free";
    if (plan !== "premium") {
      let limit = Infinity, used = 0;
      if (isFree) {
        const { data: lim } = await admin.rpc("get_free_limit", { p_user_id: userId });
        const { data: u } = await admin.rpc("get_lifetime_usage", { p_user_id: userId });
        limit = (lim as number) ?? 5;
        used = (u as number) ?? 0;
      } else {
        const { data: u } = await admin.rpc("get_daily_usage", { p_user_id: userId });
        limit = 100;
        used = (u as number) ?? 0;
      }
      if (used + HR_CREDIT_COST > limit) {
        return new Response(JSON.stringify({ error: "Usage limit reached", needed: HR_CREDIT_COST }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Hunter.io call (graceful if no key)
    const HUNTER = Deno.env.get("HUNTER_API_KEY");
    let contacts: any[] = [];
    let provider = "pattern";
    if (HUNTER) {
      provider = "hunter";
      const r = await fetch(`https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&department=hr,executive&limit=5&api_key=${HUNTER}`);
      if (r.ok) {
        const j = await r.json();
        const emails = j?.data?.emails ?? [];
        contacts = emails
          .filter((e: any) => /(recruit|talent|hr|people|hiring)/i.test(`${e.position} ${e.department}`))
          .slice(0, 3)
          .map((e: any) => ({
            name: [e.first_name, e.last_name].filter(Boolean).join(" ") || null,
            title: e.position || e.department || null,
            email: e.value,
            confidence: e.confidence ?? null,
          }));
        if (contacts.length === 0 && emails.length > 0) {
          contacts = emails.slice(0, 3).map((e: any) => ({
            name: [e.first_name, e.last_name].filter(Boolean).join(" ") || null,
            title: e.position || e.department || null,
            email: e.value,
            confidence: e.confidence ?? null,
          }));
        }
      }
    }

    if (contacts.length === 0) {
      // Pattern fallback — best-guess generic addresses (not verified)
      provider = "pattern";
      contacts = [
        { name: null, title: "Recruiting (generic)", email: `careers@${domain}`, confidence: null },
        { name: null, title: "HR (generic)", email: `hr@${domain}`, confidence: null },
        { name: null, title: "People (generic)", email: `jobs@${domain}`, confidence: null },
      ];
    }

    const payload = { contacts, provider, domain };

    // Charge credits
    if (plan !== "premium") {
      const rows = Array.from({ length: HR_CREDIT_COST }).map(() => ({
        user_id: userId, tool_name: "hr-email",
      }));
      await admin.from("usage_tracking").insert(rows);
    }

    // Cache
    await admin.from("hr_email_cache").insert({
      user_id: userId, company_domain: domain, payload,
    });

    return new Response(JSON.stringify({ ...payload, cached: false, charged: plan !== "premium" ? HR_CREDIT_COST : 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("job-hr-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
