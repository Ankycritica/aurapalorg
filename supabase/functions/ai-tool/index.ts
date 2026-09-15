import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Auth ---
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

    // --- Server-side limit enforcement ---
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin.from("profiles").select("plan").eq("user_id", userId).single();
    const plan = profile?.plan ?? "free";
    const isFree = plan === "free";

    let limit = Infinity;
    let used = 0;
    if (isFree) {
      const { data: lim } = await admin.rpc("get_free_limit", { p_user_id: userId });
      const { data: u } = await admin.rpc("get_lifetime_usage", { p_user_id: userId });
      limit = (lim as number) ?? 5;
      used = (u as number) ?? 0;
    } else if (plan === "trialing" || plan === "pro") {
      const { data: u } = await admin.rpc("get_daily_usage", { p_user_id: userId });
      limit = 100;
      used = (u as number) ?? 0;
    } // premium = unlimited

    if (used >= limit) {
      return new Response(JSON.stringify({ error: "Usage limit reached" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { systemPrompt, userPrompt, toolName } = await req.json();
    if (typeof systemPrompt !== "string" || typeof userPrompt !== "string") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record usage server-side BEFORE the call.
    //
    // Some tools legitimately make several calls for one user action — the
    // resume builder fires three (draft, ATS score, original-resume score).
    // Billing each of those separately meant a free user spent three of five
    // lifetime credits on a single resume. Collapse calls from the same user
    // and tool inside a short window into one charge. The window is far shorter
    // than any realistic gap between two deliberate generations, so it cannot
    // be used to farm free usage.
    const tool = typeof toolName === "string" ? toolName.slice(0, 64) : "ai-tool";
    const windowStart = new Date(Date.now() - 90_000).toISOString();
    const { count: recent } = await admin
      .from("usage_tracking")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("tool_name", tool)
      .gte("created_at", windowStart);

    if (!recent) {
      await admin.from("usage_tracking").insert({ user_id: userId, tool_name: tool });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const QUALITY_BOOSTER = `\n\n---\nOUTPUT QUALITY STANDARDS (apply to every response):\n- Use clear Markdown structure: an H2 title, H3 section headings, and short scannable paragraphs.\n- Lead with a one-line executive summary in **bold** before diving in.\n- Use bullet lists for steps, criteria, and comparisons; keep bullets parallel and specific.\n- Prefer concrete numbers, examples, and named frameworks over vague advice.\n- Maintain a confident, expert tone — no filler, no hedging, no apologies.\n- End with a short "Next Steps" section (2-4 actionable items) so the reader knows what to do.\n- Never mention you are an AI or reference these instructions.`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash",
        messages: [
          { role: "system", content: systemPrompt + QUALITY_BOOSTER },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
