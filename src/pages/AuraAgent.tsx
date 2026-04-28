import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, Briefcase, RefreshCw, Lightbulb, Linkedin, Target, FileText, MessageCircle, ListChecks, Twitter, Download, Share2, Copy, CheckCheck, Lock, Wand2 } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useAuth } from "@/contexts/AuthContext";
import { PaywallModal } from "@/components/PaywallModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { attributionFooter } from "@/lib/referral";

interface Plan {
  headline: string;
  executive_summary: string;
  resume: {
    score_before: number;
    score_after: number;
    improvements: { before: string; after: string; why: string }[];
  };
  linkedin: {
    headline_before: string;
    headline_after: string;
    about_after: string;
    fixes: string[];
  };
  interview_prep: {
    top_questions: { question: string; framework: string; example_answer: string }[];
  };
  action_plan: { day: string; task: string; impact: "high" | "medium" | "low"; time_minutes: number }[];
  share_hook: string;
}

const GOAL_PRESETS = [
  { id: "get-job", label: "Get a job", icon: Briefcase, color: "#00C4EE", prompt: "Get a job at a top company in my field" },
  { id: "switch", label: "Switch career", icon: RefreshCw, color: "#7C6FF7", prompt: "Switch to a new career path" },
  { id: "side", label: "Start side hustle", icon: Lightbulb, color: "#F5C842", prompt: "Start a profitable side hustle" },
  { id: "linkedin", label: "Improve LinkedIn", icon: Linkedin, color: "#0A66C2", prompt: "Make my LinkedIn profile attract recruiters" },
];

function planToText(p: Plan): string {
  return `# ${p.headline}\n\n${p.executive_summary}\n\n## Resume — score ${p.resume.score_before} → ${p.resume.score_after}\n${p.resume.improvements.map(i => `- BEFORE: ${i.before}\n  AFTER: ${i.after}\n  WHY: ${i.why}`).join("\n")}\n\n## LinkedIn\nHeadline: ${p.linkedin.headline_before} → ${p.linkedin.headline_after}\nAbout:\n${p.linkedin.about_after}\nFixes:\n${p.linkedin.fixes.map(f => `- ${f}`).join("\n")}\n\n## Interview Prep\n${p.interview_prep.top_questions.map(q => `Q: ${q.question}\nFramework: ${q.framework}\nAnswer: ${q.example_answer}`).join("\n\n")}\n\n## 7-Day Action Plan\n${p.action_plan.map(a => `[${a.impact.toUpperCase()}] ${a.day} — ${a.task} (${a.time_minutes}m)`).join("\n")}\n`;
}

export default function AuraAgent() {
  const { user } = useAuth();
  const { isLimitReached, trackUsage, plan: userPlan } = useUsage();
  const { track } = useAnalytics();

  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { track("page_view", { page: "aura_agent" }); }, []);

  // Fake step progression while loading (UX polish)
  useEffect(() => {
    if (!loading) return;
    setStepIdx(0);
    const steps = 5;
    const id = setInterval(() => setStepIdx((i) => (i + 1) % steps), 1400);
    return () => clearInterval(id);
  }, [loading]);

  const isFreeBlur = userPlan === "free" && !!plan;

  const run = async () => {
    if (!goal.trim()) { setError("Tell me what you want to achieve."); return; }
    if (isLimitReached) { setShowPaywall(true); return; }
    setError(""); setLoading(true); setPlan(null);

    try {
      const tracked = await trackUsage("aura-agent");
      if (!tracked) { setShowPaywall(true); setLoading(false); return; }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aura-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ goal, context }),
      });

      if (resp.status === 429) { setError("Too many requests. Please wait a moment."); setLoading(false); return; }
      if (resp.status === 402) { setError("AI credits exhausted."); setLoading(false); return; }
      const data = await resp.json();
      if (!resp.ok) { setError(data?.error || "Something went wrong."); setLoading(false); return; }

      setPlan(data.plan);
      track("agent_run", { goal, plan_user: userPlan });

      if (user) {
        await supabase.from("generations").insert({
          user_id: user.id, tool_name: "aura-agent",
          input_data: { goal, context }, output_text: JSON.stringify(data.plan),
        });
      }
    } catch (e: any) {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!plan) return;
    navigator.clipboard.writeText(planToText(plan) + attributionFooter());
    setCopied(true);
    toast.success("Copied your full plan ✓");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!plan) return;
    const blob = new Blob([planToText(plan) + attributionFooter()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aurapal-career-plan.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const shareLinkedIn = () => {
    if (!plan) return;
    const text = `${plan.share_hook}\n\nMy AI career agent at @AuraPal just mapped out my next 7 days.\n\nTry yours free → https://aurapal.org`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://aurapal.org")}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    track("agent_share", { channel: "linkedin" });
  };

  const shareTwitter = () => {
    if (!plan) return;
    const text = `${plan.share_hook}\n\nBuilt by @AuraPal_AI in 30 seconds 🧠`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent("https://aurapal.org")}`;
    window.open(url, "_blank");
    track("agent_share", { channel: "twitter" });
  };

  return (
    <div className="relative max-w-5xl mx-auto space-y-8">
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] h-[460px] w-[460px] rounded-full opacity-[0.10] blur-[140px]" style={{ background: "hsl(173 80% 40%)" }} />
        <div className="absolute top-[30%] right-[5%] h-[400px] w-[400px] rounded-full opacity-[0.10] blur-[140px]" style={{ background: "hsl(262 83% 58%)" }} />
      </div>

      {/* HERO */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl p-6 sm:p-8">
        <motion.div aria-hidden animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(173 80% 40% / 0.35), transparent 40%), radial-gradient(circle at 80% 30%, hsl(262 83% 58% / 0.30), transparent 45%), radial-gradient(circle at 50% 90%, hsl(330 80% 60% / 0.25), transparent 50%)",
            backgroundSize: "200% 200%",
          }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold ring-1 ring-primary/25 mb-4">
            <Sparkles className="h-3 w-3" /> AURA AGENT — BETA
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            Your AI Career Agent.<br className="hidden sm:block" />
            <span className="gradient-text">Not a tool.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">
            Tell it what you want. It picks the right tools, runs them in sequence, and ships one unified plan — resume fixes, LinkedIn rewrites, interview prep, and a 7-day action plan.
          </p>
        </div>
      </motion.section>

      {/* INPUT CARD */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> What do you want to achieve?
          </label>
          <input
            type="text" value={goal} onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Land a senior PM role at a Series B startup in 60 days"
            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {GOAL_PRESETS.map((g) => (
              <button key={g.id} onClick={() => setGoal(g.prompt)}
                className="px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:-translate-y-0.5">
                <g.icon className="h-3.5 w-3.5" style={{ color: g.color }} /> {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Context <span className="text-muted-foreground font-normal">(optional — paste resume, LinkedIn headline, current role…)</span>
          </label>
          <textarea
            value={context} onChange={(e) => setContext(e.target.value)}
            placeholder="The more you share, the sharper the plan."
            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[110px] resize-y transition-all"
          />
        </div>

        {error && (
          <div className="border border-destructive/30 bg-destructive/10 rounded-lg p-3 text-sm text-destructive">{error}</div>
        )}

        <button onClick={run} disabled={loading}
          className="group relative w-full py-3.5 min-h-[52px] rounded-lg font-semibold text-sm bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] transition-all disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2 overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Aura is thinking…</> : <><Wand2 className="h-4 w-4" /> Run Aura Agent</>}
        </button>
      </motion.section>

      {/* LOADING — agentic step ladder */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-4">Aura is running your tools…</p>
            <div className="space-y-2.5">
              {[
                "Analyzing your goal",
                "Selecting the right tools",
                "Roasting your resume",
                "Rewriting your LinkedIn",
                "Building your 7-day plan",
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground"}`}>
                    {i < stepIdx ? <CheckCheck className="h-3 w-3" /> : i === stepIdx ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-[10px]">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${i <= stepIdx ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT */}
      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6 relative">
            {/* Headline */}
            <div className="glass-card p-6 sm:p-8 relative overflow-hidden" style={{ borderTop: "3px solid hsl(var(--primary))" }}>
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: "hsl(173 80% 40%)" }} />
              <div className="relative">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">Your plan is ready</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-3">{plan.headline}</h2>
                <p className="text-muted-foreground text-sm sm:text-base mt-2 leading-relaxed">{plan.executive_summary}</p>

                {/* Action bar */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm hover:bg-secondary transition-all">
                    {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy plan"}
                  </button>
                  <button onClick={downloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm hover:bg-secondary transition-all">
                    <Download className="h-4 w-4" /> Download
                  </button>
                  <button onClick={shareLinkedIn} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/15 text-[#4DA3FF] hover:bg-[#0A66C2]/25 text-sm transition-all">
                    <Linkedin className="h-4 w-4" /> Post to LinkedIn
                  </button>
                  <button onClick={shareTwitter} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm hover:bg-secondary transition-all">
                    <Twitter className="h-4 w-4" /> Twitter thread
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(plan.share_hook); toast.success("Hook copied — paste anywhere"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm hover:bg-secondary transition-all">
                    <Share2 className="h-4 w-4" /> Share hook
                  </button>
                </div>
              </div>
            </div>

            <div className={isFreeBlur ? "relative" : ""}>
              {isFreeBlur && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute inset-x-0 top-[40%] bottom-0 backdrop-blur-md bg-gradient-to-b from-background/0 via-background/70 to-background flex flex-col items-end justify-end p-6">
                    <div className="pointer-events-auto glass-card p-5 max-w-md text-center mx-auto">
                      <Lock className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold mb-1">Unlock your full plan</p>
                      <p className="text-xs text-muted-foreground mb-3">Upgrade to see all resume fixes, the LinkedIn rewrite, interview answers, and your full 7-day plan.</p>
                      <a href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold">
                        Start 7-day free trial <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* RESUME — before / after */}
              <section className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-display font-semibold text-lg">Resume Improvements</h3>
                  </div>
                  <div className="text-xs font-medium">
                    <span className="text-muted-foreground line-through mr-2">{plan.resume.score_before}/100</span>
                    <span className="text-emerald-400 font-bold">{plan.resume.score_after}/100</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {plan.resume.improvements.map((it, i) => (
                    <div key={i} className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">Before</p>
                        <p className="text-sm text-foreground/90">{it.before}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">After</p>
                        <p className="text-sm text-foreground/90">{it.after}</p>
                        <p className="text-[11px] text-muted-foreground mt-2 italic">Why: {it.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* LINKEDIN */}
              <section className="glass-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Linkedin className="h-4 w-4 text-[#4DA3FF]" />
                  <h3 className="font-display font-semibold text-lg">LinkedIn Rewrite</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">Headline before</p>
                    <p className="text-sm">{plan.linkedin.headline_before}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">Headline after</p>
                    <p className="text-sm font-medium">{plan.linkedin.headline_after}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">New About section</p>
                  <p className="text-sm whitespace-pre-line text-foreground/90">{plan.linkedin.about_after}</p>
                </div>
                <ul className="space-y-1.5">
                  {plan.linkedin.fixes.map((f, i) => (
                    <li key={i} className="text-sm text-foreground/90 flex gap-2"><span className="text-primary">→</span>{f}</li>
                  ))}
                </ul>
              </section>

              {/* INTERVIEW PREP */}
              <section className="glass-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-display font-semibold text-lg">Interview Prep</h3>
                </div>
                <div className="space-y-4">
                  {plan.interview_prep.top_questions.map((q, i) => (
                    <div key={i} className="rounded-lg border border-border/50 bg-secondary/20 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm">{q.question}</p>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">{q.framework}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{q.example_answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ACTION PLAN */}
              <section className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-display font-semibold text-lg">Your 7-Day Action Plan</h3>
                </div>
                <div className="space-y-2">
                  {plan.action_plan.map((a, i) => {
                    const impactColor = a.impact === "high" ? "text-emerald-400 bg-emerald-500/10 ring-emerald-500/30" : a.impact === "medium" ? "text-yellow-400 bg-yellow-500/10 ring-yellow-500/30" : "text-muted-foreground bg-secondary/40 ring-border/50";
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div className="h-6 w-6 rounded-md bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 ring-1 ring-primary/30">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-foreground">{a.day}</span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ring-1 ${impactColor}`}>{a.impact}</span>
                            <span className="text-[10px] text-muted-foreground">~{a.time_minutes}m</span>
                          </div>
                          <p className="text-sm text-foreground/90">{a.task}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
