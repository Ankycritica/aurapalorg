import { FileText, PenLine, Briefcase, Lightbulb, MessageSquareWarning, FlameKindling, Mail, MessageCircle, DollarSign, Rocket, Sparkles, ArrowRight, Zap, Trophy, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ProfileCompleteness } from "@/components/ProfileCompleteness";
import { useAnalytics } from "@/hooks/useAnalytics";

const toolColors: Record<string, string> = {
  "Resume Builder": "#00C4EE",
  "Cover Letter": "#EC4899",
  "Interview Prep": "#06B6D4",
  "SEO Article Generator": "#7C6FF7",
  "Business Plan": "#32D583",
  "Side Hustle": "#F5C842",
  "LinkedIn Roaster": "#F97066",
  "Resume Roast": "#FFA94D",
  "Am I Underpaid?": "#22D3A0",
  "Startup Validator": "#A78BFA",
};

const tools = [
  { title: "Resume Builder", desc: "Impact-driven bullets that pass ATS in seconds.", icon: FileText, url: "/resume-builder" },
  { title: "Cover Letter", desc: "Tailored letters that actually get replies.", icon: Mail, url: "/cover-letter" },
  { title: "Interview Prep", desc: "Real questions with expert answer frameworks.", icon: MessageCircle, url: "/interview-prep" },
  { title: "SEO Article Generator", desc: "Rank-ready articles in under a minute.", icon: PenLine, url: "/seo-article-generator" },
  { title: "Business Plan", desc: "Investor-ready plans from a single idea.", icon: Briefcase, url: "/business-plan" },
  { title: "Side Hustle", desc: "Personalized income ideas, ranked by ROI.", icon: Lightbulb, url: "/side-hustle-ideas" },
  { title: "LinkedIn Roaster", desc: "Brutally honest profile feedback that converts.", icon: MessageSquareWarning, url: "/linkedin-roaster", badge: "🔥 Viral", trending: true },
  { title: "Resume Roast", desc: "Roast + fix your resume in 30 seconds.", icon: FlameKindling, url: "/resume-roast", badge: "🔥 Viral", trending: true },
  { title: "Am I Underpaid?", desc: "AI salary benchmark. Brutally honest.", icon: DollarSign, url: "/salary-check", badge: "✨ New" },
  { title: "Startup Validator", desc: "Score your startup idea 0–100 by AI.", icon: Rocket, url: "/startup-validator", badge: "✨ New" },
];

interface RecentGen {
  id: string;
  tool_name: string;
  output_text: string;
  created_at: string;
}

// Animated counter
function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value]);
  return <span>{display}</span>;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { usageCount, remaining, limit, plan } = useUsage();
  const [recentGens, setRecentGens] = useState<RecentGen[]>([]);
  const [livePeople, setLivePeople] = useState(() => Math.floor(Math.random() * 80) + 120);
  const [proofIdx, setProofIdx] = useState(0);
  const { track } = useAnalytics();
  const hour = new Date().getHours();

  const socialProofs = [
    { icon: "🔥", text: "Someone improved their resume score from 45 → 82" },
    { icon: "💼", text: "User just got 3 interview calls after using this" },
    { icon: "🚀", text: "120+ people used Aura Agent in the last hour" },
    { icon: "⭐", text: "“Got hired in 2 weeks after running Aura Agent”" },
    { icon: "💸", text: "Salary check revealed user was underpaid by $18K" },
  ];
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || "there";

  useEffect(() => {
    track("page_view", { page: "dashboard" });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLivePeople((p) => Math.max(95, Math.min(240, p + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4))));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("generations").select("id, tool_name, output_text, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => { if (data) setRecentGens(data); });
  }, [user]);

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const usagePct = limit === Infinity ? 0 : Math.min(100, (usageCount / limit) * 100);

  const stats = [
    { label: "Current Plan", value: planLabel, icon: Trophy, color: "#7C6FF7", isText: true },
    { label: "Used Today", value: usageCount, icon: Target, color: "#00C4EE", showBar: true },
    { label: "Remaining", value: limit === Infinity ? "∞" : remaining, icon: Zap, color: "#32D583", isText: limit === Infinity },
    { label: "Daily Limit", value: limit === Infinity ? "∞" : limit, icon: Sparkles, color: "#F5C842", isText: limit === Infinity },
  ];

  return (
    <div className="relative max-w-6xl mx-auto space-y-10">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] h-[480px] w-[480px] rounded-full opacity-[0.10] blur-[140px]" style={{ background: "hsl(173 80% 40%)" }} />
        <div className="absolute top-[20%] right-[5%] h-[420px] w-[420px] rounded-full opacity-[0.10] blur-[140px]" style={{ background: "hsl(262 83% 58%)" }} />
        <div className="absolute bottom-[-10%] left-[40%] h-[420px] w-[420px] rounded-full opacity-[0.07] blur-[140px]" style={{ background: "hsl(330 80% 60%)" }} />
      </div>

      {/* HERO — outcome driven */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl p-6 sm:p-8"
      >
        {/* Animated gradient mesh */}
        <motion.div
          aria-hidden
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(173 80% 40% / 0.35), transparent 40%), radial-gradient(circle at 80% 30%, hsl(262 83% 58% / 0.30), transparent 45%), radial-gradient(circle at 50% 90%, hsl(330 80% 60% / 0.25), transparent 50%)",
            backgroundSize: "200% 200%",
          }}
        />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold ring-1 ring-primary/25">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {greeting}, {displayName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-semibold ring-1 ring-orange-500/25">
                🔥 <AnimatedNumber value={livePeople} duration={0.6} /> people active right now
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              You're <span className="gradient-text">3 steps away</span><br className="hidden sm:block" />
              from your next opportunity 🚀
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mt-3 max-w-xl leading-relaxed">
              Fix your resume, benchmark your salary, and unlock career growth — instantly with AI.
            </p>
          </div>

          {/* Quick action chips */}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link to="/resume-roast" className="px-3.5 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:-translate-y-0.5">
              <FlameKindling className="h-3.5 w-3.5 text-orange-400" /> Roast resume
            </Link>
            <Link to="/salary-check" className="px-3.5 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:-translate-y-0.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Check salary
            </Link>
            <Link to="/interview-prep" className="px-3.5 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:-translate-y-0.5">
              <MessageCircle className="h-3.5 w-3.5 text-cyan-400" /> Prep interview
            </Link>
          </div>
        </div>
      </motion.section>

      {/* AURA AGENT — Primary feature card */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
      >
        <Link
          to="/agent"
          className="group relative block overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.10] via-card/60 to-card/40 backdrop-blur-xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50"
          style={{ boxShadow: "0 10px 40px -10px hsl(173 80% 40% / 0.20)" }}
        >
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-30 group-hover:opacity-50 blur-3xl transition-opacity duration-500" style={{ background: "hsl(173 80% 40%)" }} />
          <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: "hsl(262 83% 58%)" }} />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" style={{
            background: "linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.06) 50%, transparent 70%)",
          }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ring-1 ring-primary/40" style={{ background: "linear-gradient(135deg, hsl(173 80% 40% / 0.30), hsl(262 83% 58% / 0.10))" }}>
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                  ✨ New — Aura Agent
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
                  Beta
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                Tell Aura your goal — <span className="gradient-text">get a full plan</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                One prompt. Resume fixes, LinkedIn rewrite, interview prep & a 7-day action plan. Your AI career agent — not a tool.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all">
              Run Aura Agent <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.section>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl p-4 transition-all duration-300 hover:border-primary/30"
            style={{ boxShadow: "0 4px 20px -6px hsl(0 0% 0% / 0.4)" }}
          >
            <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-0 group-hover:opacity-25 blur-2xl transition-opacity duration-500" style={{ background: s.color }} />
            <div className="relative z-10 flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                <p className="font-display text-2xl sm:text-3xl font-bold mt-1.5 tracking-tight">
                  {s.isText ? (
                    <span style={{ background: `linear-gradient(135deg, ${s.color}, hsl(var(--foreground)))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {s.value}
                    </span>
                  ) : (
                    <span style={{ color: s.color }}>
                      <AnimatedNumber value={s.value as number} />
                    </span>
                  )}
                </p>
                {s.showBar && plan !== "premium" && limit !== Infinity && (
                  <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePct}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${s.color}, hsl(var(--accent)))` }}
                    />
                  </div>
                )}
              </div>
              <motion.div
                animate={{ rotate: [0, 6, 0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
              >
                <s.icon className="h-4.5 w-4.5" style={{ color: s.color }} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TOOLS */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Your AI Toolkit</h2>
            <p className="text-sm text-muted-foreground mt-1">10 expert-grade tools — pick one and ship in seconds</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool, i) => {
            const color = toolColors[tool.title] || "#00C4EE";
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03, duration: 0.35 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={tool.url}
                  className="group relative block h-full overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-[var(--accent-c)]/40"
                  style={{ ['--accent-c' as any]: color, boxShadow: "0 4px 20px -8px hsl(0 0% 0% / 0.4)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 12px 40px -10px ${color}40`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px -8px hsl(0 0% 0% / 0.4)"; }}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                  {/* Glow blob */}
                  <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" style={{ background: color }} />
                  {/* Shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" style={{
                    background: "linear-gradient(110deg, transparent 40%, hsl(0 0% 100% / 0.04) 50%, transparent 60%)",
                  }} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="h-11 w-11 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${color}25, ${color}08)`, border: `1px solid ${color}30` }}
                      >
                        <tool.icon className="h-5 w-5" style={{ color }} />
                      </motion.div>
                      <div className="flex flex-col items-end gap-1">
                        {(tool as any).badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${color}1A`, color, border: `1px solid ${color}40` }}>
                            {(tool as any).badge}
                          </span>
                        )}
                        {(tool as any).trending && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
                            Trending
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-[15px] tracking-tight">{tool.title}</h3>
                    <p className="text-[13px] text-muted-foreground mt-1.5 mb-4 leading-relaxed">{tool.desc}</p>
                    <span className="text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color }}>
                      Open tool <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trust strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.15), transparent 60%)",
        }} />
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: 2500, suffix: "+", label: "Active users" },
            { value: 250, suffix: "K+", label: "AI generations" },
            { value: "4.9", label: "Avg rating ⭐" },
            { value: 10, label: "AI tools" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
                {typeof s.value === "number" ? <><AnimatedNumber value={s.value} />{s.suffix}</> : s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <ProfileCompleteness />

      {recentGens.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold mb-4 tracking-tight">Recent Activity</h2>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl divide-y divide-border/40 overflow-hidden">
            {recentGens.map((gen) => (
              <div key={gen.id} className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${toolColors[gen.tool_name] || "#00C4EE"}18`, border: `1px solid ${toolColors[gen.tool_name] || "#00C4EE"}30` }}>
                  <FileText className="h-4 w-4" style={{ color: toolColors[gen.tool_name] || "#00C4EE" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{gen.tool_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{gen.output_text.slice(0, 80)}...</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{format(new Date(gen.created_at), "MMM d, HH:mm")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
