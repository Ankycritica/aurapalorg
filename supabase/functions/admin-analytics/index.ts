import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ADMIN_EMAIL = "aurapalorg@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (claimsData.user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Admin client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all profiles
    const { data: profiles } = await adminClient.from("profiles").select("user_id, email, display_name, plan, created_at").order("created_at", { ascending: false });

    // Fetch tool usage stats
    const { data: usageData } = await adminClient.from("usage_tracking").select("tool_name");

    // Count by tool
    const toolMap: Record<string, number> = {};
    (usageData || []).forEach((row: any) => {
      toolMap[row.tool_name] = (toolMap[row.tool_name] || 0) + 1;
    });
    const toolStats = Object.entries(toolMap)
      .map(([tool_name, count]) => ({ tool_name, count }))
      .sort((a, b) => b.count - a.count);

    // Total generations
    const { count: totalGenerations } = await adminClient.from("generations").select("id", { count: "exact", head: true });

    return new Response(JSON.stringify({
      users: profiles || [],
      toolStats,
      totalGenerations: totalGenerations || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
