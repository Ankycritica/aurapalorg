import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Star, ArrowRight, Sparkles, TrendingUp, Flame } from "lucide-react";
import { useEffect, useState } from "react";

// Animated counter
function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value]);
  return <span>{display}</span>;
}

// Live demo states cycle every ~7s
const DEMO_STEPS = ["input", "analyzing", "result"] as const;
type DemoStep = typeof DEMO_STEPS[number];

function LiveDemo() {
  const [step, setStep] = useState<DemoStep>("input");
  const [scoreTarget, setScoreTarget] = useState(42);

  useEffect(() => {
    let mounted = true;
    const cycle = () => {
      if (!mounted) return;
      setStep("input");
      setScoreTarget(42);
      setTimeout(() => mounted && setStep("analyzing"), 1800);
      setTimeout(() => { if (mounted) { setStep("result"); setScoreTarget(87); } }, 3800);
    };
    cycle();
    const id = setInterval(cycle, 8000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="relative glass-card p-1 rounded-2xl shadow-2xl overflow-hidden"
      style={{ boxShadow: "0 25px 60px -12px hsl(173 80% 40% / 0.25), 0 0 0 1px hsl(173 80% 40% / 0.15)" }}>
      {/* Border glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "linear-gradient(135deg, hsl(173 80% 40% / 0.18), transparent 40%, hsl(262 83% 58% / 0.18))",
        }}
      />
      {/* Title bar */}
      <div className="relative flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[11px] text-muted-foreground ml-2 font-mono">aurapal.ai · live demo</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
        </span>
      </div>

      {/* Body */}
      <div className="relative p-5 space-y-4 min-h-[340px]">
        {/* Input */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Your input</p>
          <div className="px-3 py-2.5 rounded-lg bg-secondary/50 border border-border/40 text-sm font-mono text-foreground/90">
            <motion.span
              key={step === "input" ? "typing" : "static"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              Data Analyst <span className="text-muted-foreground">|</span> 3 years experience
              {step === "input" && <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary align-middle animate-pulse" />}
            </motion.span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm text-foreground font-medium">Analyzing<span className="inline-flex">
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}>.</motion.span>
              </span></span>
              <div className="ml-auto flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-primary"
                    animate={{ scale: [0.6, 1, 0.6] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-3.5"
            >
              {/* Score */}
              <div className="px-3 py-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/25">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Resume Score</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <TrendingUp className="h-3 w-3" /> +45 pts
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-display font-bold text-muted-foreground line-through opacity-60">42</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="text-3xl font-display font-bold gradient-text">
                    <AnimatedNumber value={scoreTarget} duration={1.4} />
                  </span>
                  <span className="text-base">🔥</span>
                </div>
              </div>

              {/* Bullet rewrite */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Bullet rewrite</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-red-500/[0.06] border border-red-500/15">
                    <span className="text-red-400 text-xs font-bold mt-0.5">✗</span>
                    <span className="text-xs text-muted-foreground line-through">Worked on dashboards</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-emerald-500/[0.08] border border-emerald-500/25"
                  >
                    <span className="text-emerald-400 text-xs font-bold mt-0.5">✓</span>
                    <span className="text-xs text-foreground font-medium">Built 15+ dashboards improving decision speed by <span className="text-emerald-400 font-bold">30%</span></span>
                  </motion.div>
                </div>
              </div>

              {/* Inner CTA */}
              <Link to="/auth"
                className="group flex items-center justify-between px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/30 hover:from-primary/25 hover:to-accent/20 transition-all">
                <span className="text-xs font-semibold text-foreground">Try this on your resume</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [livePeople, setLivePeople] = useState(() => Math.floor(Math.random() * 80) + 120);

  useEffect(() => {
    const id = setInterval(() => {
      setLivePeople((p) => Math.max(95, Math.min(240, p + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4))));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative pt-28 pb-20 px-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #060A14 0%, hsl(220 20% 7%) 100%)" }}>
      {/* Animated mesh gradient */}
      <motion.div
        aria-hidden
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 25%, hsl(173 80% 40% / 0.30), transparent 40%), radial-gradient(circle at 80% 30%, hsl(262 83% 58% / 0.28), transparent 45%), radial-gradient(circle at 50% 90%, hsl(330 80% 60% / 0.20), transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(hsl(173 80% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(173 80% 40%) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Floating particles */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/40"
            style={{ left: `${(i * 13 + 8) % 95}%`, top: `${(i * 19 + 12) % 85}%` }}
            animate={{ y: [0, -22, 0], opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Aura Agent — your AI Career OS</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.05] tracking-tight">
              Stop getting rejected.<br />
              Fix your resume in <span className="gradient-text-animated">30 seconds.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-muted-foreground text-base sm:text-lg mt-5 max-w-lg leading-relaxed">
              AuraPal analyzes your resume, LinkedIn, and career strategy — and turns it into a job-winning plan instantly.
            </motion.p>

            {/* Proof strip */}
            <motion.ul initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="mt-6 space-y-1.5 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <span>🔥</span> <span><span className="text-foreground font-semibold">2,500+</span> professionals improved their resumes this week</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span>⭐</span> <span>Avg score increase: <span className="text-emerald-400 font-semibold">+32 points</span></span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span>💼</span> <span><span className="text-foreground font-semibold">1,200+</span> interviews landed</span>
              </li>
            </motion.ul>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link to="/auth"
                className="group relative px-7 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm inline-flex items-center gap-2 justify-center overflow-hidden animate-pulse-glow hover:scale-[1.04] transition-transform duration-200">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                  style={{ background: "linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.35) 50%, transparent 70%)" }} />
                <span className="relative">👉 Fix My Resume Now</span>
                <ArrowRight className="relative h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span className="text-xs text-muted-foreground">Takes 30 seconds. No signup needed.</span>
            </motion.div>

            {/* Live people */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-7 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 ring-1 ring-orange-500/25 text-orange-400 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5 animate-pulse" />
              <span className="tabular-nums"><AnimatedNumber value={livePeople} duration={0.6} /></span> people improving their careers right now
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex items-center gap-3 mt-5">
              <div className="flex -space-x-2">
                {["S", "J", "P", "M"].map((l, i) => (
                  <div key={i} className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground">{l}</div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />)}
              </div>
              <span className="text-xs text-muted-foreground">2,500+ professionals hired faster</span>
            </motion.div>
          </div>

          {/* Right — live demo */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            <LiveDemo />
          </motion.div>
        </div>

        {/* See the transformation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20"
        >
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">See the <span className="gradient-text-animated">transformation</span></h2>
            <p className="text-sm text-muted-foreground mt-2">Real before & after — 30 seconds, zero effort.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 relative max-w-4xl mx-auto">
            {/* BEFORE */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-card/50 backdrop-blur-xl p-5"
              style={{ boxShadow: "0 4px 20px -8px hsl(0 84% 60% / 0.25)" }}>
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-20 blur-2xl" style={{ background: "hsl(0 84% 60%)" }} />
              <div className="flex items-center justify-between mb-3 relative">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 ring-1 ring-red-500/30">❌ Before</span>
                <span className="text-xs text-red-400 font-semibold">Score: 42/100</span>
              </div>
              <div className="space-y-2 text-[13px] text-muted-foreground font-mono leading-relaxed relative">
                <p className="line-through opacity-70">• Worked on dashboards</p>
                <p className="line-through opacity-70">• Helped the team with various tasks</p>
                <p className="line-through opacity-70">• Did data analysis</p>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center shadow-lg shadow-primary/40 ring-4 ring-background">
              <ArrowRight className="h-5 w-5 text-primary-foreground" />
            </div>

            {/* AFTER */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-card/60 to-card/40 backdrop-blur-xl p-5"
              style={{ boxShadow: "0 4px 20px -8px hsl(160 84% 40% / 0.3)" }}>
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-25 blur-2xl" style={{ background: "hsl(160 84% 40%)" }} />
              <div className="flex items-center justify-between mb-3 relative">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">✅ After</span>
                <span className="text-xs text-emerald-400 font-semibold">Score: 87/100 🔥</span>
              </div>
              <div className="space-y-2 text-[13px] text-foreground leading-relaxed relative">
                <p>• Built <span className="text-emerald-400 font-semibold">15+ dashboards</span> improving decision speed by <span className="text-emerald-400 font-semibold">30%</span></p>
                <p>• Led <span className="text-emerald-400 font-semibold">cross-functional</span> team of 6, shipped 12 features</p>
                <p>• Cut reporting time <span className="text-emerald-400 font-semibold">by 8 hrs/week</span> via Python automation</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
