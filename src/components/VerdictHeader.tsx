import { motion } from "framer-motion";

interface VerdictHeaderProps {
  toolSlug: string;
  result: string;
  inputs: Record<string, string>;
  salaryDiff?: { symbol: string; diff: number; status: "underpaid" | "fair" | "overpaid" } | null;
}

interface Verdict {
  emoji: string;
  title: string;
  subtitle: string;
  tone: "danger" | "warning" | "success" | "neutral";
}

function formatCurrency(amount: number, symbol: string): string {
  if (amount >= 1000) return `${symbol}${Math.round(amount / 1000)}K`;
  return `${symbol}${Math.round(amount)}`;
}

function deriveVerdict(toolSlug: string, result: string, inputs: Record<string, string>, salaryDiff?: VerdictHeaderProps["salaryDiff"]): Verdict | null {
  const lower = result.toLowerCase().slice(0, 800);

  if (toolSlug === "salary-check" && salaryDiff) {
    if (salaryDiff.status === "underpaid") {
      const sub = `${formatCurrency(Math.abs(salaryDiff.diff), salaryDiff.symbol)} below market median`;
      const title = Math.abs(salaryDiff.diff) > 30000 ? "Criminally Underpaid" : "Underpaid";
      return { emoji: "🚨", title, subtitle: sub, tone: "danger" };
    }
    if (salaryDiff.status === "overpaid") {
      return { emoji: "🏆", title: "Above Market", subtitle: `${formatCurrency(Math.abs(salaryDiff.diff), salaryDiff.symbol)} above median — well done`, tone: "success" };
    }
    return { emoji: "👌", title: "Fairly Paid", subtitle: "You're within market range — but there's room to push", tone: "warning" };
  }

  // Roast tools — try to extract a score like "Score: 47/100" or "47/100"
  if (toolSlug === "linkedin-roaster" || toolSlug === "resume-roast") {
    const m = result.match(/(\d{1,3})\s*\/\s*100/);
    if (m) {
      const score = parseInt(m[1], 10);
      if (score < 40) return { emoji: "🚨", title: `${score}/100 — Brutal`, subtitle: "Major work needed before you apply anywhere", tone: "danger" };
      if (score < 65) return { emoji: "⚠️", title: `${score}/100 — Mid`, subtitle: "Decent foundation, but you're being skipped", tone: "warning" };
      if (score < 85) return { emoji: "👍", title: `${score}/100 — Solid`, subtitle: "Above average — small tweaks unlock interviews", tone: "success" };
      return { emoji: "🔥", title: `${score}/100 — Elite`, subtitle: "Recruiter-magnet level. Just polish.", tone: "success" };
    }
  }

  // Startup validator — score 0-100
  if (toolSlug === "startup-validator") {
    const m = result.match(/(\d{1,3})\s*\/\s*100/);
    if (m) {
      const score = parseInt(m[1], 10);
      if (score < 40) return { emoji: "🚫", title: `${score}/100 — Don't quit yet`, subtitle: "This idea has serious gaps to close first", tone: "danger" };
      if (score < 70) return { emoji: "🤔", title: `${score}/100 — Promising`, subtitle: "Worth validating with 10 customer calls this week", tone: "warning" };
      return { emoji: "🚀", title: `${score}/100 — Ship it`, subtitle: "Strong signal. Build the MVP this month.", tone: "success" };
    }
  }

  return null;
}

export function VerdictHeader({ toolSlug, result, inputs, salaryDiff }: VerdictHeaderProps) {
  const verdict = deriveVerdict(toolSlug, result, inputs, salaryDiff);
  if (!verdict) return null;

  const toneClasses = {
    danger: "from-rose-500/15 to-rose-500/5 border-rose-500/30 text-rose-400",
    warning: "from-amber-500/15 to-amber-500/5 border-amber-500/30 text-amber-400",
    success: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    neutral: "from-primary/15 to-primary/5 border-primary/30 text-primary",
  }[verdict.tone];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-4 bg-gradient-to-br border ${toneClasses}`}
    >
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-30 bg-current" />
      <div className="relative flex items-center gap-4">
        <motion.span
          initial={{ scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
          className="text-5xl sm:text-6xl drop-shadow-lg"
        >
          {verdict.emoji}
        </motion.span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">The Verdict</p>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-tight mt-0.5">{verdict.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{verdict.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}
