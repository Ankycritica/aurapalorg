import { FileText, PenLine, Briefcase, Lightbulb, MessageSquareWarning, FlameKindling, Target, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";

const tools = [
  { title: "Resume Builder", desc: "AI-powered resume creation with impact-driven bullet points.", icon: FileText, url: "/resume-builder", color: "from-primary/20 to-primary/5" },
  { title: "SEO Article Generator", desc: "Generate keyword-optimized blog posts with proper structure.", icon: PenLine, url: "/seo-article-generator", color: "from-accent/20 to-accent/5" },
  { title: "Business Plan", desc: "Turn any idea into a structured, investor-ready business plan.", icon: Briefcase, url: "/business-plan", color: "from-primary/20 to-accent/5" },
  { title: "Side Hustle Ideas", desc: "Discover personalized side income opportunities.", icon: Lightbulb, url: "/side-hustle-ideas", color: "from-yellow-500/20 to-yellow-500/5" },
  { title: "LinkedIn Roaster", desc: "Get brutally honest feedback on your LinkedIn profile.", icon: MessageSquareWarning, url: "/linkedin-roaster", color: "from-blue-500/20 to-blue-500/5" },
  { title: "Resume Roast", desc: "Get your resume roasted with actionable improvements.", icon: FlameKindling, url: "/resume-roast", color: "from-orange-500/20 to-orange-500/5" },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const { usageCount, remaining, limit, plan } = useUsage();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || "there";

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
            </div>
            <span className="text-2xl">{s.emoji}</span>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Your Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <motion.div key={tool.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}>
              <Link to={tool.url} className={`glass-card tool-card-hover p-5 block h-full bg-gradient-to-br ${tool.color}`}>
                <div className="h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center mb-3">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{tool.desc}</p>
                <span className="text-sm text-primary font-medium">Open Tool →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
