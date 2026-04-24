import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";

const mockToolLines = [
  { label: "Resume Score", value: "92/100", color: "#32D583" },
  { label: "ATS Compatibility", value: "Excellent", color: "#00C4EE" },
  { label: "Impact Bullets", value: "12 generated", color: "#7C6FF7" },
  { label: "Cover Letter", value: "Ready to send", color: "#F5C842" },
];

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #060A14 0%, hsl(220 20% 7%) 100%)" }}>
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(173 80% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(173 80% 40%) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Glow orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(173 80% 40%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: "hsl(262 83% 58%)" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">AI-Powered Career Engine</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Land Your Dream Job<br />
              with <span className="gradient-text">AI on Your Side</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg mt-6 max-w-lg leading-relaxed">
              Build resumes, prep for interviews, generate cover letters, and grow your income — all powered by AI.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/auth" className="px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all text-sm inline-flex items-center gap-2 justify-center">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="px-8 py-3.5 rounded-xl font-semibold border border-border/50 text-foreground hover:bg-secondary/50 transition-all text-sm text-center">
                See how it works
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {["S", "J", "P", "M"].map((l, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-semibold text-muted-foreground">{l}</div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-foreground font-medium">2,500+ professionals</span>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />)}
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right — animated dashboard mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden lg:block">
            <div className="glass-card p-1 rounded-2xl shadow-2xl" style={{ boxShadow: "0 25px 60px -12px hsl(173 80% 40% / 0.15)" }}>
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">AuraPal — Dashboard</span>
              </div>
              {/* Mockup content */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Welcome back</p>
                    <p className="text-sm font-semibold text-foreground">Sarah's Career Hub</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Pro Plan</div>
                </div>
                <div className="space-y-2.5">
                  {mockToolLines.map((line, i) => (
                    <motion.div key={line.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/30">
                      <span className="text-xs text-muted-foreground">{line.label}</span>
                      <span className="text-xs font-semibold" style={{ color: line.color }}>{line.value}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 1.2, duration: 0.8 }}
                  className="h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
