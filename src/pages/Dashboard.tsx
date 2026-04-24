import { FileText, PenLine, Briefcase, Lightbulb, MessageSquareWarning, FlameKindling, Mail, MessageCircle, DollarSign, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  { title: "Resume Builder", desc: "AI-powered resume creation with impact-driven bullet points.", icon: FileText, url: "/resume-builder" },
  { title: "Cover Letter", desc: "Personalized cover letters tailored to every job.", icon: Mail, url: "/cover-letter" },
  { title: "Interview Prep", desc: "AI-generated questions with ideal answer frameworks.", icon: MessageCircle, url: "/interview-prep" },
  { title: "SEO Article Generator", desc: "Generate keyword-optimized blog posts.", icon: PenLine, url: "/seo-article-generator" },
  { title: "Business Plan", desc: "Turn any idea into an investor-ready plan.", icon: Briefcase, url: "/business-plan" },
  { title: "Side Hustle", desc: "Discover personalized income opportunities.", icon: Lightbulb, url: "/side-hustle-ideas" },
  { title: "LinkedIn Roaster", desc: "Brutally honest LinkedIn profile feedback.", icon: MessageSquareWarning, url: "/linkedin-roaster", badge: "🔥 Viral" },
  { title: "Resume Roast", desc: "Get your resume roasted with improvements.", icon: FlameKindling, url: "/resume-roast", badge: "🔥 Viral" },
  { title: "Am I Underpaid?", desc: "AI salary benchmark in 15 seconds. Brutally honest.", icon: DollarSign, url: "/salary-check", badge: "✨ New" },
  { title: "Startup Validator", desc: "Get your startup idea scored 0–100 by AI.", icon: Rocket, url: "/startup-validator", badge: "✨ New" },
];

interface RecentGen {
  id: string;
  tool_name: string;
  output_text: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { usageCount, remaining, limit, plan } = useUsage();
  const [recentGens, setRecentGens] = useState<RecentGen[]>([]);
  const { track } = useAnalytics();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || "there";

  useEffect(() => {
    track("page_view", { page: "dashboard" });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("generations").select("id, tool_name, output_text, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => { if (data) setRecentGens(data); });
  }, [user]);

  const stats = [
    { label: "Plan", value: plan.charAt(0).toUpperCase() + plan.slice(1), emoji: "💎" },
    { label: "Used Today", value: String(usageCount), emoji: "🎯" },
    { label: "Remaining", value: limit === Infinity ? "∞" : String(remaining), emoji: "⚡" },
    { label: "Daily Limit", value: limit === Infinity ? "∞" : String(limit), emoji: "🏆" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold ring-1 ring-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Trusted by 2,500+ professionals
            </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{greeting}, {displayName} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your career growth snapshot. Pick a tool to get started.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-display font-bold mt-1 tracking-tight">{s.value}</p>
              {s.label === "Used Today" && plan !== "premium" && (
                <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (usageCount / limit) * 100)}%` }} transition={{ duration: 0.7, ease: "easeOut" }} className="h-full bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              )}
            </div>
            <span className="text-2xl">{s.emoji}</span>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">Your Tools</h2>
            <p className="text-xs text-muted-foreground mt-0.5">10 expert-grade AI tools, ready when you are</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool, i) => {
            const color = toolColors[tool.title] || "#00C4EE";
            return (
              <motion.div key={tool.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.03, duration: 0.3 }}>
                <Link to={tool.url} className="glass-card tool-card-hover p-5 block h-full group relative overflow-hidden" style={{ borderTop: `3px solid ${color}` }}>
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" style={{ background: color }} />
                  {(tool as any).badge && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
                      {(tool as any).badge}
                    </span>
                  )}
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300" style={{ background: `${color}15` }}>
                    <tool.icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3 leading-relaxed">{tool.desc}</p>
                  <span className="text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color }}>
                    Open Tool <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trust strip */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-5 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: "2,500+", label: "Active users" },
            { value: "250K+", label: "AI generations" },
            { value: "4.9 / 5", label: "Avg rating" },
            { value: "10 tools", label: "All in one place" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-xl sm:text-2xl font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <ProfileCompleteness />

      {recentGens.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="glass-card divide-y divide-border/50">
            {recentGens.map((gen) => (
              <div key={gen.id} className="p-4 flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${toolColors[gen.tool_name] || "#00C4EE"}15` }}>
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
