import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  FileText, Sparkles, Briefcase, Lightbulb, Linkedin, MessageCircle,
  DollarSign, Rocket, Shield, Zap, Globe, Users, Star, ArrowRight, Check,
} from "lucide-react";
import { Footer } from "@/components/Footer";

const tools = [
  { icon: FileText, name: "AI Resume Builder", desc: "ATS-optimized resumes with XYZ-formula bullets, scored 0–100.", to: "/resume-builder" },
  { icon: MessageCircle, name: "Cover Letter Generator", desc: "Personalized, tone-matched cover letters in under 15 seconds.", to: "/cover-letter" },
  { icon: Briefcase, name: "Interview Prep", desc: "Mock questions with model answers for behavioral, technical & system design.", to: "/interview-prep" },
  { icon: Linkedin, name: "LinkedIn Roaster", desc: "Brutally honest 0–100 audit of your profile with rewrite suggestions.", to: "/linkedin-roaster" },
  { icon: Sparkles, name: "Resume Roast 💀", desc: "A no-mercy critique that surfaces the gaps recruiters silently reject.", to: "/resume-roast" },
  { icon: DollarSign, name: "Salary Checker", desc: "Market percentile + word-for-word negotiation script in 15 seconds.", to: "/salary-check" },
  { icon: Rocket, name: "Startup Idea Validator", desc: "0–100 idea score with red flags, MVP scope, and 90-day GTM plan.", to: "/startup-validator" },
  { icon: Lightbulb, name: "Side Hustle Generator", desc: "Tailored income ideas based on your skills, time, and goals.", to: "/side-hustle-ideas" },
  { icon: Briefcase, name: "Business Plan Generator", desc: "Investor-grade business plans with TAM, GTM, and financial outline.", to: "/business-plan" },
  { icon: Globe, name: "SEO Article Generator", desc: "Long-form, keyword-rich articles ready to rank.", to: "/seo-article-generator" },
];

const reasons = [
  { icon: Zap, title: "Built on frontier AI", desc: "Powered by Google Gemini & GPT-class models — outputs that actually feel expert." },
  { icon: Shield, title: "Free forever plan", desc: "5 generations per day, no credit card. Upgrade only if you want unlimited." },
  { icon: Users, title: "10,000+ professionals", desc: "Trusted by job seekers, founders, and creators across 40+ countries." },
  { icon: Sparkles, title: "Share-ready outputs", desc: "Every result is structured for LinkedIn, Twitter, and shareable image cards." },
];

export default function Features() {
  useEffect(() => {
    document.title = "Features — 10 Free AI Career Tools | AuraPal";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("description", "Explore all 10 free AI career tools on AuraPal: resume builder, cover letter writer, interview prep, LinkedIn roaster, salary checker, startup idea validator and more. No signup wall.");
    setMeta("keywords", "AI career tools, free resume builder, AI cover letter, interview prep AI, LinkedIn audit, salary checker, startup idea validator, AuraPal features");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AuraPal" className="h-8 w-8 rounded-lg" />
            <span className="font-display font-bold text-lg">AuraPal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/pricing" className="hidden sm:inline px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/auth" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all">
              Try free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold text-primary mb-5">
            <Sparkles className="h-3.5 w-3.5" /> 10 free AI tools, one platform
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything AuraPal can do
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A complete AI career & growth engine — from resume to interview to negotiation to launching your own thing. Free forever plan, no credit card.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] transition-all">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="px-6 py-3 rounded-lg border border-border text-sm font-semibold hover:bg-secondary/50 transition-all">
              View pricing
            </Link>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-5">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />)}
            <span className="ml-2">Trusted by 10,000+ professionals · 40+ countries</span>
          </div>
        </motion.div>
      </section>

      {/* Tools grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">All 10 tools</h2>
        <p className="text-center text-sm text-muted-foreground mb-8">Each one is free to use 5 times per day. No signup wall.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={t.to} className="group glass-card p-5 block hover:border-primary/40 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <t.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">{t.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">Why AuraPal</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {reasons.map((r) => (
            <div key={r.title} className="glass-card p-5 flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/15 flex items-center justify-center">
                <r.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plan summary */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="glass-card p-6 sm:p-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Free</p>
              <p className="font-display text-3xl font-bold mb-2">$0</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> 5 generations / day</li>
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> All 10 tools</li>
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> No credit card</li>
              </ul>
            </div>
            <div className="border-x border-border/40 px-4">
              <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">Pro · Most popular</p>
              <p className="font-display text-3xl font-bold mb-2">$19<span className="text-base text-muted-foreground">/mo</span></p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> 100 generations / day</li>
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Priority AI</li>
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Premium templates</li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Premium</p>
              <p className="font-display text-3xl font-bold mb-2">$49<span className="text-base text-muted-foreground">/mo</span></p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Unlimited everything</li>
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Early features</li>
                <li className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> 1:1 support</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-7">
            <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-all">
              Compare plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Start free in 15 seconds</h2>
        <p className="text-muted-foreground mb-6">No credit card. No signup wall. Just open a tool and generate.</p>
        <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] transition-all">
          Try AuraPal free <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
