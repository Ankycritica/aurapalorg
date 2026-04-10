import { FileText, PenLine, Briefcase, Lightbulb, MessageSquareWarning, FlameKindling, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ProfileCompleteness } from "@/components/ProfileCompleteness";

const toolColors: Record<string, string> = {
  "Resume Builder": "#00C4EE",
  "Cover Letter": "#EC4899",
  "Interview Prep": "#06B6D4",
  "SEO Article Generator": "#7C6FF7",
  "Business Plan": "#32D583",
  "Side Hustle": "#F5C842",
  "LinkedIn Roaster": "#F97066",
  "Resume Roast": "#FFA94D",
};

const tools = [
  { title: "Resume Builder", desc: "AI-powered resume creation with impact-driven bullet points.", icon: FileText, url: "/resume-builder" },
  { title: "Cover Letter", desc: "Personalized cover letters tailored to every job.", icon: Mail, url: "/cover-letter" },
  { title: "Interview Prep", desc: "AI-generated questions with ideal answer frameworks.", icon: MessageCircle, url: "/interview-prep" },
  { title: "SEO Article Generator", desc: "Generate keyword-optimized blog posts.", icon: PenLine, url: "/seo-article-generator" },
  { title: "Business Plan", desc: "Turn any idea into an investor-ready plan.", icon: Briefcase, url: "/business-plan" },
  { title: "Side Hustle", desc: "Discover personalized income opportunities.", icon: Lightbulb, url: "/side-hustle-ideas" },
  { title: "LinkedIn Roaster", desc: "Brutally honest LinkedIn profile feedback.", icon: MessageSquareWarning, url: "/linkedin-roaster" },
  { title: "Resume Roast", desc: "Get your resume roasted with improvements.", icon: FlameKindling, url: "/resume-roast" },
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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || "there";

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
        <h1 className="font-display text-3xl md:text-4xl font-bold">{greeting}, {displayName} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your career growth snapshot. Pick a tool to get started.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
              {s.label === "Used Today" && plan !== "premium" && (
                <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (usageCount / limit) * 100)}%` }} />
                </div>
              )}
            </div>
            <span className="text-2xl">{s.emoji}</span>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Your Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool, i) => {
            const color = toolColors[tool.title] || "#00C4EE";
            return (
              <motion.div key={tool.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.03, duration: 0.3 }}>
                <Link to={tool.url} className="glass-card tool-card-hover p-5 block h-full" style={{ borderTop: `3px solid ${color}` }}>
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
                    <tool.icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">{tool.desc}</p>
                  <span className="text-sm font-medium" style={{ color }}>Open Tool →</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <ProfileCompleteness />


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
