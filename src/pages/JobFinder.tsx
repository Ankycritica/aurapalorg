import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Briefcase, Search, MapPin, ExternalLink, Bookmark, BookmarkCheck, Sparkles, Mail, FileText, Building2, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PaywallModal } from "@/components/PaywallModal";

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

type HRContact = { name: string | null; title: string | null; email: string; confidence: number | null };

function formatPosted(iso?: string | null) {
  if (!iso) return "";
  const d = Date.parse(iso);
  if (!d) return "";
  const days = Math.max(0, Math.floor((Date.now() - d) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

function salaryLabel(j: Job) {
  if (!j.salary_min && !j.salary_max) return "";
  const cur = j.salary_currency || "";
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
  if (j.salary_min && j.salary_max) return `${cur} ${fmt(j.salary_min)}–${fmt(j.salary_max)}`;
  return `${cur} ${fmt((j.salary_min || j.salary_max)!)}+`;
}

export default function JobFinder() {
  const { user } = useAuth();
  const { isLimitReached } = useUsage();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [location, setLocation] = useState(params.get("loc") ?? "");
  const [remoteOnly, setRemoteOnly] = useState(params.get("remote") === "1");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Job | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [hrLoading, setHrLoading] = useState(false);
  const [hrContacts, setHrContacts] = useState<HRContact[] | null>(null);
  const [paywall, setPaywall] = useState(false);

  // Load saved jobs to mark already-saved
  useEffect(() => {
    if (!user) return;
    supabase.from("saved_jobs").select("source, external_id").eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const s = new Set(data.map((r: any) => `${r.source}|${r.external_id}`));
        setSavedIds(s);
      });
  }, [user]);

  async function runSearch(opts?: { q?: string; loc?: string; remote?: boolean }) {
    const q = opts?.q ?? query;
    const loc = opts?.loc ?? location;
    const ro = opts?.remote ?? remoteOnly;
    setLoading(true);
    setSelected(null);
    setHrContacts(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("Please sign in"); return; }
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/job-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ query: q, location: loc, remoteOnly: ro }),
      });
      if (!r.ok) { toast.error("Search failed"); return; }
      const j = await r.json();
      setJobs(j.jobs ?? []);
      if ((j.jobs ?? []).length > 0) setSelected(j.jobs[0]);
      const next = new URLSearchParams();
      if (q) next.set("q", q);
      if (loc) next.set("loc", loc);
      if (ro) next.set("remote", "1");
      setParams(next, { replace: true });
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run if URL had a query
  useEffect(() => {
    if (params.get("q") || params.get("loc") || params.get("remote")) {
      runSearch({ q: params.get("q") ?? "", loc: params.get("loc") ?? "", remote: params.get("remote") === "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleSave(j: Job) {
    if (!user) { navigate("/auth"); return; }
    const key = `${j.source}|${j.external_id}`;
    if (savedIds.has(key)) {
      await supabase.from("saved_jobs")
        .delete().eq("user_id", user.id).eq("source", j.source).eq("external_id", j.external_id);
      const n = new Set(savedIds); n.delete(key); setSavedIds(n);
      toast.success("Removed from tracker");
    } else {
      const { error } = await supabase.from("saved_jobs").insert({
        user_id: user.id,
        source: j.source,
        external_id: j.external_id,
        title: j.title,
        company: j.company,
        location: j.location,
        apply_url: j.apply_url,
        jd_text: j.jd_text,
        salary_min: j.salary_min ?? null,
        salary_max: j.salary_max ?? null,
        salary_currency: j.salary_currency ?? null,
        posted_at: j.posted_at ?? null,
        status: "saved",
      });
      if (error) { toast.error(error.message); return; }
      const n = new Set(savedIds); n.add(key); setSavedIds(n);
      toast.success("Saved to your tracker");
    }
  }

  function tailorResume() {
    if (!selected) return;
    if (isLimitReached) { setPaywall(true); return; }
    sessionStorage.setItem("aurapal_jd_context", JSON.stringify({
      title: selected.title, company: selected.company, jd: selected.jd_text,
    }));
    navigate("/resume-builder?tailorJD=1");
  }

  function generateCoverLetter() {
    if (!selected) return;
    if (isLimitReached) { setPaywall(true); return; }
    const q = new URLSearchParams({
      jobTitle: selected.title,
      company: selected.company,
      jobDescription: selected.jd_text.slice(0, 2000),
    });
    navigate(`/cover-letter?${q.toString()}`);
  }

  async function findHrEmail() {
    if (!selected) return;
    setHrLoading(true);
    setHrContacts(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("Please sign in"); return; }
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/job-hr-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ company: selected.company }),
      });
      if (r.status === 402) { setPaywall(true); return; }
      if (!r.ok) { toast.error("Lookup failed"); return; }
      const j = await r.json();
      setHrContacts(j.contacts ?? []);
      if (j.cached) toast.success("Loaded from cache (free)");
      else if (j.charged) toast.success(`${j.charged} credits used`);
    } catch (e) {
      console.error(e); toast.error("Network error");
    } finally {
      setHrLoading(false);
    }
  }

  const selectedKey = useMemo(() => selected ? `${selected.source}|${selected.external_id}` : "", [selected]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="text-[11px] uppercase tracking-widest text-primary font-semibold">Job Finder</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Find your next role</h1>
          <p className="text-sm text-muted-foreground mt-1">Search across Remotive, Arbeitnow, Adzuna and Jooble — apply on the company site, free.</p>
        </div>
        <Link to="/jobs/tracker" className="px-4 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 text-sm font-medium inline-flex items-center gap-2">
          <Bookmark className="h-4 w-4" /> My tracker
        </Link>
      </motion.div>

      {/* Search bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Job title, skill or company"
              className="pl-9 input-glow" onKeyDown={(e) => e.key === "Enter" && runSearch()} />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (or 'Remote')"
              className="pl-9 input-glow" onKeyDown={(e) => e.key === "Enter" && runSearch()} />
          </div>
          <Button onClick={() => runSearch()} disabled={loading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="accent-primary" />
            Remote only
          </label>
          <span>•</span>
          <span>{jobs.length > 0 ? `${jobs.length} matches` : "Free search · unlimited"}</span>
        </div>
      </div>

      {/* Results layout */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* List */}
        <div className="space-y-3">
          {loading && jobs.length === 0 && (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 h-24 shimmer" />
              ))}
            </>
          )}
          {!loading && jobs.length === 0 && (
            <div className="glass-card rounded-xl p-8 text-center text-sm text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-40" />
              Search any role — try <button className="text-primary underline" onClick={() => { setQuery("react developer"); setRemoteOnly(true); runSearch({ q: "react developer", remote: true, loc: location }); }}>"react developer remote"</button>.
            </div>
          )}
          {jobs.map((j) => {
            const k = `${j.source}|${j.external_id}`;
            const active = k === selectedKey;
            const saved = savedIds.has(k);
            return (
              <button key={k} onClick={() => { setSelected(j); setHrContacts(null); }}
                className={`w-full text-left glass-card rounded-xl p-4 transition-all hover:-translate-y-0.5 ${active ? "ring-2 ring-primary/60 border-primary/50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-snug truncate">{j.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" /> {j.company}
                      <span>·</span>
                      <MapPin className="h-3 w-3" /> {j.location}
                      {j.remote && <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[9px] font-bold uppercase">Remote</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {salaryLabel(j) && <span className="text-[10px] font-semibold text-emerald-400">{salaryLabel(j)}</span>}
                    <span className={`p-1.5 rounded ${saved ? "text-primary" : "text-muted-foreground/60"}`}>
                      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{formatPosted(j.posted_at)}</span>
                  <span>·</span>
                  <span className="uppercase tracking-wider">{j.source}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {!selected ? (
            <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Select a job to see details and actions.
            </div>
          ) : (
            <motion.div key={selectedKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">{selected.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5 flex-wrap">
                  <Building2 className="h-3.5 w-3.5" /> {selected.company}
                  <span>·</span>
                  <MapPin className="h-3.5 w-3.5" /> {selected.location}
                  {selected.remote && <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-bold uppercase">Remote</span>}
                </p>
                {salaryLabel(selected) && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">{salaryLabel(selected)}</p>
                )}
              </div>

              {/* Action row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a href={selected.apply_url} target="_blank" rel="noopener noreferrer"
                  className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-xs">
                  <ExternalLink className="h-3.5 w-3.5" /> Apply
                </a>
                <button onClick={() => toggleSave(selected)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium">
                  {savedIds.has(selectedKey) ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
                  {savedIds.has(selectedKey) ? "Saved" : "Save"}
                </button>
                <button onClick={tailorResume}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium">
                  <FileText className="h-3.5 w-3.5" /> Tailor resume
                </button>
                <button onClick={generateCoverLetter}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium">
                  <Mail className="h-3.5 w-3.5" /> Cover letter
                </button>
              </div>

              {/* HR email reveal */}
              <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Recruiter / HR contacts
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">3 credits · cached free for 30 days</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={findHrEmail} disabled={hrLoading}>
                    {hrLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                    <span className="ml-1.5">Reveal</span>
                  </Button>
                </div>
                {hrContacts && (
                  <ul className="mt-3 space-y-2">
                    {hrContacts.map((c, i) => (
                      <li key={i} className="text-xs flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-secondary/50">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{c.name || c.title || "Contact"}</div>
                          <a href={`mailto:${c.email}`} className="text-primary truncate block">{c.email}</a>
                        </div>
                        {c.confidence != null && <span className="text-[10px] text-muted-foreground shrink-0">{c.confidence}%</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* JD */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Job description</h3>
                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto pr-1">
                  {selected.jd_text || "No description provided."}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
