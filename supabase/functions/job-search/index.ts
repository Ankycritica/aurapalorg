import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Job = {
  source: string;
  external_id: string;
  title: string;
  company: string;
  company_domain?: string | null;
  location: string;
  remote: boolean;
  apply_url: string;
  jd_text: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  posted_at?: string | null;
  tags?: string[];
};

function safe<T>(p: Promise<T>): Promise<T | null> {
  return p.catch((e) => { console.error("source error:", e); return null; });
}

async function fetchRemotive(q: string): Promise<Job[]> {
  const url = `https://remotive.com/api/remote-jobs?limit=40${q ? `&search=${encodeURIComponent(q)}` : ""}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  return (j.jobs ?? []).map((it: any) => ({
    source: "remotive",
    external_id: `remotive-${it.id}`,
    title: it.title,
    company: it.company_name,
    location: it.candidate_required_location || "Remote",
    remote: true,
    apply_url: it.url,
    jd_text: (it.description || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
    salary_min: null, salary_max: null, salary_currency: null,
    posted_at: it.publication_date,
    tags: it.tags ?? [],
  }));
}

async function fetchArbeitnow(q: string): Promise<Job[]> {
  const r = await fetch("https://www.arbeitnow.com/api/job-board-api");
  if (!r.ok) return [];
  const j = await r.json();
  const items = (j.data ?? []) as any[];
  const ql = q.toLowerCase().trim();
  const filtered = ql
    ? items.filter((it) => `${it.title} ${it.company_name} ${(it.tags || []).join(" ")}`.toLowerCase().includes(ql))
    : items;
  return filtered.slice(0, 40).map((it: any) => ({
    source: "arbeitnow",
    external_id: `arbeitnow-${it.slug}`,
    title: it.title,
    company: it.company_name,
    location: it.location || "—",
    remote: !!it.remote,
    apply_url: it.url,
    jd_text: (it.description || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
    salary_min: null, salary_max: null, salary_currency: null,
    posted_at: it.created_at ? new Date(it.created_at * 1000).toISOString() : null,
    tags: it.tags ?? [],
  }));
}

async function fetchAdzuna(q: string, location: string): Promise<Job[]> {
  const id = Deno.env.get("ADZUNA_APP_ID");
  const key = Deno.env.get("ADZUNA_APP_KEY");
  if (!id || !key) return [];
  const country = (location || "").toLowerCase().includes("uk") ? "gb" : "us";
  const params = new URLSearchParams({
    app_id: id, app_key: key, results_per_page: "30",
    "content-type": "application/json",
  });
  if (q) params.set("what", q);
  if (location && !["remote","worldwide"].includes(location.toLowerCase())) params.set("where", location);
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results ?? []).map((it: any) => ({
    source: "adzuna",
    external_id: `adzuna-${it.id}`,
    title: it.title,
    company: it.company?.display_name || "—",
    location: it.location?.display_name || "—",
    remote: false,
    apply_url: it.redirect_url,
    jd_text: (it.description || "").slice(0, 4000),
    salary_min: it.salary_min ?? null,
    salary_max: it.salary_max ?? null,
    salary_currency: country === "gb" ? "GBP" : "USD",
    posted_at: it.created,
    tags: [it.category?.label].filter(Boolean),
  }));
}

async function fetchJooble(q: string, location: string): Promise<Job[]> {
  const key = Deno.env.get("JOOBLE_API_KEY");
  if (!key) return [];
  const r = await fetch(`https://jooble.org/api/${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords: q, location, page: "1" }),
  });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.jobs ?? []).slice(0, 30).map((it: any, idx: number) => ({
    source: "jooble",
    external_id: `jooble-${it.id ?? idx}-${(it.link || "").slice(-12)}`,
    title: it.title,
    company: it.company || "—",
    location: it.location || "—",
    remote: /remote/i.test(it.location || ""),
    apply_url: it.link,
    jd_text: (it.snippet || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
    salary_min: null, salary_max: null,
    salary_currency: it.salary || null,
    posted_at: it.updated || null,
    tags: [],
  }));
}

function dedupe(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  const out: Job[] = [];
  for (const j of jobs) {
    const k = `${(j.title || "").toLowerCase().trim()}|${(j.company || "").toLowerCase().trim()}|${(j.location || "").toLowerCase().trim()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(j);
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const query = String(body.query ?? "").slice(0, 200);
    const location = String(body.location ?? "").slice(0, 120);
    const remoteOnly = !!body.remoteOnly;

    const results = await Promise.all([
      safe(fetchRemotive(query)),
      safe(fetchArbeitnow(query)),
      safe(fetchAdzuna(query, location)),
      safe(fetchJooble(query, location)),
    ]);

    let merged = (results.flat().filter(Boolean) as Job[]);
    if (remoteOnly) merged = merged.filter((j) => j.remote);
    if (location && !remoteOnly) {
      const ll = location.toLowerCase();
      merged = merged.filter((j) => (j.location || "").toLowerCase().includes(ll) || j.remote);
    }
    merged = dedupe(merged);
    merged.sort((a, b) => {
      const ta = a.posted_at ? Date.parse(a.posted_at) : 0;
      const tb = b.posted_at ? Date.parse(b.posted_at) : 0;
      return tb - ta;
    });

    return new Response(JSON.stringify({ jobs: merged.slice(0, 80), total: merged.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("job-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
