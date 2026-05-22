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

const US_STATES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD", massachusetts: "MA",
  michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT",
  nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
  "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX",
  utah: "UT", vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

// Adzuna-supported countries with city/state hints
type CountryHint = { code: string; name: string; adzuna: string };
const COUNTRY_HINTS: CountryHint[] = [
  { code: "in", name: "india", adzuna: "in" },
  { code: "gb", name: "united kingdom", adzuna: "gb" },
  { code: "us", name: "united states", adzuna: "us" },
  { code: "ca", name: "canada", adzuna: "ca" },
  { code: "au", name: "australia", adzuna: "au" },
  { code: "de", name: "germany", adzuna: "de" },
  { code: "fr", name: "france", adzuna: "fr" },
  { code: "nl", name: "netherlands", adzuna: "nl" },
  { code: "it", name: "italy", adzuna: "it" },
  { code: "es", name: "spain", adzuna: "es" },
  { code: "pl", name: "poland", adzuna: "pl" },
  { code: "br", name: "brazil", adzuna: "br" },
  { code: "mx", name: "mexico", adzuna: "mx" },
  { code: "za", name: "south africa", adzuna: "za" },
  { code: "sg", name: "singapore", adzuna: "sg" },
  { code: "nz", name: "new zealand", adzuna: "nz" },
  { code: "ch", name: "switzerland", adzuna: "ch" },
  { code: "at", name: "austria", adzuna: "at" },
  { code: "be", name: "belgium", adzuna: "be" },
];

const CITY_TO_COUNTRY: Record<string, string> = {
  // India
  bangalore: "in", bengaluru: "in", mumbai: "in", delhi: "in", "new delhi": "in",
  noida: "in", gurgaon: "in", gurugram: "in", hyderabad: "in", chennai: "in",
  pune: "in", kolkata: "in", ahmedabad: "in", jaipur: "in", kochi: "in",
  chandigarh: "in", indore: "in", lucknow: "in", surat: "in", nagpur: "in",
  bhopal: "in", coimbatore: "in", thiruvananthapuram: "in", visakhapatnam: "in",
  // UK
  london: "gb", manchester: "gb", birmingham: "gb", edinburgh: "gb", glasgow: "gb",
  leeds: "gb", liverpool: "gb", bristol: "gb",
  // Canada
  toronto: "ca", vancouver: "ca", montreal: "ca", calgary: "ca", ottawa: "ca",
  // Australia / NZ
  sydney: "au", melbourne: "au", brisbane: "au", perth: "au", adelaide: "au",
  auckland: "nz", wellington: "nz",
  // Europe
  berlin: "de", munich: "de", hamburg: "de", frankfurt: "de", cologne: "de",
  paris: "fr", lyon: "fr", marseille: "fr",
  amsterdam: "nl", rotterdam: "nl", "the hague": "nl",
  madrid: "es", barcelona: "es", valencia: "es",
  rome: "it", milan: "it", turin: "it",
  warsaw: "pl", krakow: "pl",
  zurich: "ch", geneva: "ch", vienna: "at", brussels: "be",
  // Others
  singapore: "sg", "sao paulo": "br", "são paulo": "br", "rio de janeiro": "br",
  "mexico city": "mx", johannesburg: "za", "cape town": "za",
};

function detectCountry(loc: string): CountryHint | null {
  const l = loc.toLowerCase().trim();
  if (!l) return null;
  for (const c of COUNTRY_HINTS) {
    if (l.includes(c.name) || l === c.code) return c;
  }
  for (const [city, code] of Object.entries(CITY_TO_COUNTRY)) {
    if (l.includes(city)) return COUNTRY_HINTS.find((c) => c.code === code) || null;
  }
  if (US_STATES[l] || Object.values(US_STATES).some((a) => a.toLowerCase() === l)) {
    return COUNTRY_HINTS.find((c) => c.code === "us") || null;
  }
  return null;
}

function locationVariants(loc: string): string[] {
  const l = loc.trim().toLowerCase();
  if (!l) return [];
  const out = new Set<string>([l]);
  if (US_STATES[l]) out.add(US_STATES[l].toLowerCase());
  for (const [name, abbr] of Object.entries(US_STATES)) {
    if (abbr.toLowerCase() === l) out.add(name);
  }
  const ctry = detectCountry(l);
  if (ctry) {
    out.add(ctry.name);
    out.add(ctry.code);
    // include sibling cities of same country for broader matching
    for (const [city, code] of Object.entries(CITY_TO_COUNTRY)) {
      if (code === ctry.code) out.add(city);
    }
  }
  return [...out];
}

function safe<T>(p: Promise<T>): Promise<T | null> {
  return p.catch((e) => { console.error("source error:", e); return null; });
}

const MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000; // 45 days = "active"

function isActive(posted?: string | null): boolean {
  if (!posted) return true; // keep if unknown
  const t = Date.parse(posted);
  if (!t) return true;
  return Date.now() - t <= MAX_AGE_MS;
}

async function fetchRemotive(q: string): Promise<Job[]> {
  const url = `https://remotive.com/api/remote-jobs?limit=50${q ? `&search=${encodeURIComponent(q)}` : ""}`;
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
  return items.slice(0, 80).map((it: any) => ({
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
  const ll = (location || "").toLowerCase();
  const detected = detectCountry(ll);
  const country = detected?.adzuna || "us";
  const currency = ({ in: "INR", gb: "GBP", us: "USD", ca: "CAD", au: "AUD", nz: "NZD",
    de: "EUR", fr: "EUR", nl: "EUR", it: "EUR", es: "EUR", pl: "PLN", br: "BRL",
    mx: "MXN", za: "ZAR", sg: "SGD", ch: "CHF", at: "EUR", be: "EUR" } as Record<string,string>)[country] || "USD";
  const pages = [1, 2, 3];
  const results: Job[] = [];
  await Promise.all(pages.map(async (page) => {
    const params = new URLSearchParams({
      app_id: id, app_key: key, results_per_page: "50",
      "content-type": "application/json", max_days_old: "45",
      sort_by: "date",
    });
    if (q) params.set("what", q);
    if (location && !["remote", "worldwide"].includes(ll)) params.set("where", location);
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`;
    const r = await fetch(url);
    if (!r.ok) return;
    const j = await r.json();
    for (const it of (j.results ?? [])) {
      results.push({
        source: "adzuna",
        external_id: `adzuna-${it.id}`,
        title: it.title,
        company: it.company?.display_name || "—",
        location: it.location?.display_name || "—",
        remote: /remote/i.test(it.location?.display_name || ""),
        apply_url: it.redirect_url,
        jd_text: (it.description || "").slice(0, 4000),
        salary_min: it.salary_min ?? null,
        salary_max: it.salary_max ?? null,
        salary_currency: country === "gb" ? "GBP" : "USD",
        posted_at: it.created,
        tags: [it.category?.label].filter(Boolean),
      });
    }
  }));
  return results;
}

async function fetchJooble(q: string, location: string): Promise<Job[]> {
  const key = Deno.env.get("JOOBLE_API_KEY");
  if (!key) return [];
  const all: Job[] = [];
  await Promise.all([1, 2, 3].map(async (page) => {
    const r = await fetch(`https://jooble.org/api/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: q, location, page: String(page), ResultOnPage: 50 }),
    });
    if (!r.ok) return;
    const j = await r.json();
    for (const [idx, it] of ((j.jobs ?? []) as any[]).entries()) {
      all.push({
        source: "jooble",
        external_id: `jooble-${page}-${idx}-${(it.link || "").slice(-12)}`,
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
      });
    }
  }));
  return all;
}

async function fetchUsaJobs(q: string, location: string): Promise<Job[]> {
  // USAJobs.gov public API — no key required for basic search (User-Agent recommended)
  const params = new URLSearchParams({ ResultsPerPage: "100" });
  if (q) params.set("Keyword", q);
  if (location) params.set("LocationName", location);
  const r = await fetch(`https://data.usajobs.gov/api/search?${params}`, {
    headers: {
      "User-Agent": "aurapal.org",
      "Host": "data.usajobs.gov",
    },
  });
  if (!r.ok) return [];
  const j = await r.json();
  const items = j?.SearchResult?.SearchResultItems ?? [];
  return items.map((wrap: any) => {
    const it = wrap.MatchedObjectDescriptor || {};
    const loc = (it.PositionLocationDisplay || it.PositionLocation?.[0]?.LocationName || "—");
    const minS = Number(it.PositionRemuneration?.[0]?.MinimumRange);
    const maxS = Number(it.PositionRemuneration?.[0]?.MaximumRange);
    const jd = [it.QualificationSummary, it.UserArea?.Details?.JobSummary, it.UserArea?.Details?.MajorDuties?.join(" ")]
      .filter(Boolean).join(" ").replace(/<[^>]+>/g, " ").slice(0, 4000);
    return {
      source: "usajobs",
      external_id: `usajobs-${it.PositionID || wrap.MatchedObjectId}`,
      title: it.PositionTitle,
      company: it.OrganizationName || it.DepartmentName || "U.S. Government",
      location: loc,
      remote: /remote|telework/i.test(loc + " " + (it.PositionTitle || "")),
      apply_url: it.PositionURI,
      jd_text: jd,
      salary_min: isFinite(minS) ? minS : null,
      salary_max: isFinite(maxS) ? maxS : null,
      salary_currency: "USD",
      posted_at: it.PublicationStartDate,
      tags: (it.JobCategory || []).map((c: any) => c.Name).filter(Boolean),
    } as Job;
  });
}

async function fetchTheMuse(q: string, location: string): Promise<Job[]> {
  const all: Job[] = [];
  await Promise.all([0, 1, 2].map(async (page) => {
    const params = new URLSearchParams({ page: String(page), descending: "true" });
    if (location) params.set("location", location);
    const r = await fetch(`https://www.themuse.com/api/public/jobs?${params}`);
    if (!r.ok) return;
    const j = await r.json();
    for (const it of (j.results ?? [])) {
      const loc = (it.locations ?? []).map((l: any) => l.name).join(", ") || "—";
      all.push({
        source: "themuse",
        external_id: `themuse-${it.id}`,
        title: it.name,
        company: it.company?.name || "—",
        location: loc,
        remote: /remote|flexible/i.test(loc),
        apply_url: it.refs?.landing_page,
        jd_text: (it.contents || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
        salary_min: null, salary_max: null, salary_currency: null,
        posted_at: it.publication_date,
        tags: (it.categories ?? []).map((c: any) => c.name),
      });
    }
  }));
  return all;
}

async function fetchRemoteOK(q: string): Promise<Job[]> {
  const r = await fetch("https://remoteok.com/api", { headers: { "User-Agent": "aurapal.org" } });
  if (!r.ok) return [];
  const j = await r.json();
  const items = (Array.isArray(j) ? j.slice(1) : []) as any[];
  return items.slice(0, 100).map((it: any) => ({
    source: "remoteok",
    external_id: `remoteok-${it.id || it.slug}`,
    title: it.position || it.title,
    company: it.company || "—",
    location: it.location || "Remote",
    remote: true,
    apply_url: it.url || it.apply_url,
    jd_text: (it.description || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
    salary_min: it.salary_min ?? null,
    salary_max: it.salary_max ?? null,
    salary_currency: "USD",
    posted_at: it.date,
    tags: it.tags ?? [],
  }));
}

async function fetchJobicy(q: string, location: string): Promise<Job[]> {
  const params = new URLSearchParams({ count: "50" });
  if (q) params.set("tag", q);
  if (location) params.set("geo", location.toLowerCase());
  const r = await fetch(`https://jobicy.com/api/v2/remote-jobs?${params}`);
  if (!r.ok) return [];
  const j = await r.json();
  return (j.jobs ?? []).map((it: any) => ({
    source: "jobicy",
    external_id: `jobicy-${it.id}`,
    title: it.jobTitle,
    company: it.companyName,
    location: it.jobGeo || "Remote",
    remote: true,
    apply_url: it.url,
    jd_text: (it.jobExcerpt || it.jobDescription || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
    salary_min: Number(it.annualSalaryMin) || null,
    salary_max: Number(it.annualSalaryMax) || null,
    salary_currency: it.salaryCurrency || null,
    posted_at: it.pubDate,
    tags: (it.jobIndustry ?? []).concat(it.jobType ?? []),
  }));
}

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9+#.]+/).filter((t) => t.length > 1);
}

function scoreJob(j: Job, qTokens: string[], locVariants: string[]): number {
  let score = 0;
  const title = (j.title || "").toLowerCase();
  const desc = (j.jd_text || "").toLowerCase();
  const tags = (j.tags || []).join(" ").toLowerCase();
  const loc = (j.location || "").toLowerCase();

  if (qTokens.length) {
    let titleHits = 0, descHits = 0, tagHits = 0;
    for (const t of qTokens) {
      if (title.includes(t)) titleHits++;
      if (desc.includes(t)) descHits++;
      if (tags.includes(t)) tagHits++;
    }
    // require at least one strong signal
    if (titleHits === 0 && tagHits === 0 && descHits < Math.min(2, qTokens.length)) return -1;
    score += titleHits * 10 + tagHits * 4 + descHits * 1;
    // exact phrase boost
    if (qTokens.length > 1 && title.includes(qTokens.join(" "))) score += 15;
  } else {
    score += 1;
  }

  if (locVariants.length) {
    const locMatch = locVariants.some((v) => loc.includes(v));
    if (locMatch) score += 6;
    else if (j.remote) score += 2;
    else score -= 3;
  }

  // recency boost
  if (j.posted_at) {
    const days = (Date.now() - Date.parse(j.posted_at)) / 86400000;
    if (days < 3) score += 5;
    else if (days < 7) score += 3;
    else if (days < 14) score += 1;
  }
  return score;
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

    const qTokens = tokenize(query);
    const locVariants = locationVariants(location);

    const results = await Promise.all([
      safe(fetchRemotive(query)),
      safe(fetchArbeitnow(query)),
      safe(fetchAdzuna(query, location)),
      safe(fetchJooble(query, location)),
      safe(fetchUsaJobs(query, location)),
      safe(fetchTheMuse(query, location)),
      safe(fetchRemoteOK(query)),
      safe(fetchJobicy(query, location)),
    ]);

    let merged = (results.flat().filter(Boolean) as Job[]);

    // Only active jobs
    merged = merged.filter((j) => isActive(j.posted_at) && j.apply_url && j.title);

    if (remoteOnly) merged = merged.filter((j) => j.remote);

    // Score + filter relevance
    const scored = merged
      .map((j) => ({ j, s: scoreJob(j, qTokens, locVariants) }))
      .filter((x) => x.s >= 0);

    // If location specified and not remoteOnly, prefer location matches but keep remote as fallback
    if (locVariants.length && !remoteOnly) {
      const strict = scored.filter((x) => locVariants.some((v) => (x.j.location || "").toLowerCase().includes(v)));
      if (strict.length >= 10) {
        scored.length = 0;
        scored.push(...strict, ...scored.filter((x) => x.j.remote).slice(0, 20));
      }
    }

    const deduped = dedupe(scored.sort((a, b) => b.s - a.s).map((x) => x.j));

    return new Response(JSON.stringify({ jobs: deduped.slice(0, 150), total: deduped.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("job-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
