import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Crown, Lock, Check, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { parseMarkdownToResume, type ResumeData } from "@/components/ResumeEditor";

const SAMPLE_MD = `# Alex Morgan
alex@example.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/alexmorgan

## Executive Summary
- Senior product engineer with 8+ years shipping AI-powered SaaS platforms used by 2M+ users. Drove 47% YoY ARR growth at Series B startup by leading 0→1 launches across 3 product lines.

## Professional Experience
### Senior Product Engineer | Linear AI
**San Francisco, CA** | **2022 – Present**
- Increased qualified pipeline 47% ($2.4M ARR) by launching an AI lead-scoring model across 3 SDR teams.
- Cut p95 latency 61% by re-architecting the inference pipeline onto streaming Kafka + Redis.
- Mentored 6 engineers; promoted 3 to senior within 18 months.

### Software Engineer | Stripe
**Remote** | **2019 – 2022**
- Shipped checkout improvements that lifted conversion 12% across 40+ markets, generating $18M incremental GMV.

## Skills
**Technical:** TypeScript, Python, Go, React, Postgres
**Tools & Platforms:** AWS, Kubernetes, Datadog, Linear, Figma
**Leadership:** Mentoring, RFC authorship, cross-team alignment

## Education
B.S. Computer Science — UC Berkeley (2019)
`;

interface TemplateMeta {
  id: string;
  name: string;
  tagline: string;
  pro: boolean;
  accent: string;
  headerBg?: string;
  serif?: boolean;
  uppercase?: boolean;
  centerHeader?: boolean;
  borderStyle: "underline" | "fill" | "left";
  badge?: string;
}

const TEMPLATES: TemplateMeta[] = [
  { id: "modern", name: "Modern", tagline: "Clean lines, recruiter favorite", pro: false, accent: "#0EA5E9", borderStyle: "underline", badge: "Most popular" },
  { id: "classic", name: "Classic", tagline: "Traditional, ATS-perfect", pro: false, accent: "#1F2937", serif: true, centerHeader: true, uppercase: true, borderStyle: "underline" },
  { id: "minimal", name: "Minimal", tagline: "Quiet confidence", pro: false, accent: "#9CA3AF", borderStyle: "underline" },
  { id: "bold", name: "Bold", tagline: "Stand out instantly", pro: false, accent: "#000000", headerBg: "#111827", borderStyle: "underline" },
  { id: "executive", name: "Executive", tagline: "Senior-level polish", pro: false, accent: "#374151", serif: true, borderStyle: "underline" },
  { id: "creative", name: "Creative", tagline: "For designers & marketers", pro: false, accent: "#7C3AED", borderStyle: "left" },
  { id: "compact", name: "Compact", tagline: "Dense one-pager", pro: false, accent: "#1F2937", borderStyle: "fill" },
  { id: "tech", name: "Tech", tagline: "Engineer-coded", pro: false, accent: "#10B981", headerBg: "#0F172A", borderStyle: "underline" },
  { id: "pro-elegant", name: "Elegant", tagline: "Refined typography", pro: true, accent: "#6B7280", serif: true, centerHeader: true, borderStyle: "underline" },
  { id: "pro-gradient", name: "Gradient", tagline: "Modern color story", pro: true, accent: "#7C3AED", headerBg: "#7C3AED", borderStyle: "underline" },
  { id: "pro-corporate", name: "Corporate", tagline: "Fortune 500 ready", pro: true, accent: "#1E3A5F", headerBg: "#1E3A5F", borderStyle: "underline" },
  { id: "pro-startup", name: "Startup", tagline: "Operator energy", pro: true, accent: "#F97316", borderStyle: "left" },
  { id: "pro-swiss", name: "Swiss", tagline: "Editorial precision", pro: true, accent: "#DC2626", borderStyle: "fill" },
  { id: "pro-google", name: "Google", tagline: "FAANG-style", pro: true, accent: "#4285F4", borderStyle: "underline" },
  { id: "pro-apple", name: "Apple", tagline: "Quiet luxury", pro: true, accent: "#1D1D1F", borderStyle: "underline" },
  { id: "pro-consulting", name: "Consulting", tagline: "MBB candidate-grade", pro: true, accent: "#0F2942", headerBg: "#0F2942", borderStyle: "underline" },
];

function MiniPreview({ tpl, data }: { tpl: TemplateMeta; data: ResumeData }) {
  const fontClass = tpl.serif ? "font-serif" : "font-sans";
  const headerStyle = tpl.headerBg ? { backgroundColor: tpl.headerBg, color: "white" } : {};
  const headingStyle = (() => {
    if (tpl.borderStyle === "fill") return { backgroundColor: tpl.accent, color: "white", padding: "1px 4px", borderRadius: "1px" };
    if (tpl.borderStyle === "left") return { borderLeft: `2px solid ${tpl.accent}`, paddingLeft: "4px" };
    return { borderBottom: `1px solid ${tpl.accent}40`, paddingBottom: "1px" };
  })();

  return (
    <div className={`bg-white text-gray-900 ${fontClass} text-[6px] leading-tight rounded-md overflow-hidden h-full`}>
      <div className={`px-3 ${tpl.headerBg ? "py-2" : "pt-3 pb-1.5"}`} style={headerStyle}>
        <div className={`text-[10px] font-bold ${tpl.uppercase ? "uppercase" : ""} ${tpl.centerHeader ? "text-center" : ""}`}>
          {data.name}
        </div>
        <div className={`text-[5px] mt-0.5 ${tpl.headerBg ? "text-white/70" : "text-gray-500"} ${tpl.centerHeader ? "text-center" : ""} truncate`}>
          {data.contact.slice(0, 3).join(" | ")}
        </div>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {data.sections.slice(0, 4).map(sec => (
          <div key={sec.id}>
            <div className="text-[6px] font-bold uppercase tracking-wider mb-0.5" style={{ color: tpl.accent, ...headingStyle }}>
              {sec.heading}
            </div>
            <div className="space-y-0.5 text-gray-700">
              {sec.items.slice(0, 2).map((it, i) => (
                <div key={i} className="truncate">• {it}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "premium";
  const [filter, setFilter] = useState<"all" | "free" | "pro">("all");

  const sample = useMemo(() => parseMarkdownToResume(SAMPLE_MD), []);
  const list = TEMPLATES.filter(t => filter === "all" ? true : filter === "free" ? !t.pro : t.pro);

  const useTemplate = (id: string, locked: boolean) => {
    if (locked) { navigate("/pricing"); return; }
    try { localStorage.setItem("aurapal:selectedTemplate", id); } catch {}
    navigate("/resume-builder");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <title>Resume Templates — AuraPal | 24+ ATS-Optimized Designs</title>
      <meta name="description" content="Browse 24+ premium, ATS-optimized resume templates. Switch instantly while keeping your content. Free and Pro designs for every role." />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Resume Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Pick a style. We&apos;ll keep your content. Switch anytime.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/40 p-1 rounded-lg border border-border/50">
          {(["all", "free", "pro"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                filter === f ? "bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.6)]" : "text-muted-foreground hover:text-foreground"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {list.map((tpl, i) => {
          const locked = tpl.pro && !isPro;
          return (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              className="glass-card p-3 group cursor-pointer overflow-hidden"
              onClick={() => useTemplate(tpl.id, locked)}
            >
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-white shadow-[0_15px_35px_-12px_rgba(0,0,0,0.5)] relative ring-1 ring-black/10 group-hover:ring-primary/40 transition-all">
                <MiniPreview tpl={tpl} data={sample} />
                {locked && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1.5 opacity-100 group-hover:opacity-100">
                    <Lock className="h-5 w-5 text-amber-400" />
                    <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Pro</span>
                  </div>
                )}
                {!locked && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                    <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1">
                      Use this template <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-3 px-1 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5 truncate">
                    {tpl.name}
                    {tpl.pro && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{tpl.tagline}</p>
                </div>
                {tpl.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold shrink-0">
                    {tpl.badge}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="font-display font-semibold text-base">Don&apos;t have a resume yet?</p>
            <p className="text-xs text-muted-foreground">Generate one in 30 seconds — pick any template after.</p>
          </div>
        </div>
        <Link to="/resume-builder"
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
          Build my resume <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {!isPro && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <Crown className="h-6 w-6 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-[240px]">
              <h3 className="font-display font-bold text-lg">Unlock 16+ Pro Templates</h3>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Apple, Google, McKinsey-style designs</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> PDF export in any template</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Unlimited AI rewrites & suggestions</li>
              </ul>
            </div>
            <Link to="/pricing"
              className="px-5 py-2.5 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-all">
              Upgrade to Pro
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
