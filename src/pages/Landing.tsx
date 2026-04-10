import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star, Menu, X, FileText, PenLine, Lightbulb, MessageSquareWarning, Mail, MessageCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBar } from "@/components/landing/TrustBar";
import { StatsSection } from "@/components/landing/StatsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";

const features = [
  { title: "AI Resume Builder", desc: "Create ATS-optimized resumes with impact-driven bullet points.", icon: FileText, color: "#00C4EE" },
  { title: "Cover Letter Generator", desc: "Tailored cover letters for every job application.", icon: Mail, color: "#EC4899" },
  { title: "Interview Prep", desc: "Mock sessions with AI-scored feedback and frameworks.", icon: MessageCircle, color: "#06B6D4" },
  { title: "LinkedIn Profile Optimizer", desc: "Get noticed by recruiters with a polished profile.", icon: MessageSquareWarning, color: "#F97066" },
  { title: "Side Hustle Ideas", desc: "Discover new income streams tailored to your skills.", icon: Lightbulb, color: "#F5C842" },
  { title: "SEO Article Generator", desc: "Build your personal brand with optimized content.", icon: PenLine, color: "#7C6FF7" },
];

const testimonials = [
  { quote: "AuraPal helped me rewrite my resume in 10 minutes. Got 3 interviews the next week.", name: "Sarah K.", role: "Marketing Manager" },
  { quote: "The LinkedIn Roaster was brutally honest and exactly what I needed.", name: "James T.", role: "Software Engineer" },
  { quote: "Generated a full business plan for my startup in under 5 minutes.", name: "Priya M.", role: "Founder" },
];

const plans = [
  { name: "Free", price: "$0", period: "forever", features: ["5 AI generations per day", "All 8 tools", "Basic output formatting", "Copy to clipboard"], popular: false },
  { name: "Pro", price: "$19", period: "/month", features: ["100 AI generations per day", "All 8 tools", "Advanced formatting", "Priority AI processing", "Export to PDF"], popular: true },
  { name: "Premium", price: "$49", period: "/month", features: ["Unlimited generations", "All 8 tools", "Advanced formatting", "Priority processing", "Export to PDF", "Priority support"], popular: false },
];

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AuraPal" className="h-8 w-8 rounded-lg" />
            <span className="font-display font-bold text-lg">AuraPal</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/auth" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">
              Get started free
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm text-muted-foreground">Features</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block text-sm text-muted-foreground">Pricing</a>
            <Link to="/auth" className="block text-sm text-muted-foreground">Sign in</Link>
            <Link to="/auth" className="block w-full text-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground">Get started free</Link>
          </div>
        )}
      </nav>

      <HeroSection />
      <TrustBar />

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">Everything you need to advance your career</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Powerful AI tools designed to help you land jobs, grow your income, and build your personal brand.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to="/auth" className="glass-card p-6 block h-full hover:-translate-y-1 transition-all duration-300 group" style={{ borderTop: `3px solid ${f.color}` }}>
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}20` }}>
                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{f.desc}</p>
                  <span className="text-sm font-medium text-primary group-hover:underline">Try free →</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection />

      {/* How it works */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign up free", desc: "Create your account in 10 seconds. No credit card needed." },
              { step: "2", title: "Pick your tool", desc: "Choose from 8 AI-powered career tools." },
              { step: "3", title: "Get instant results", desc: "AI generates professional content in seconds." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-display font-bold text-xl flex items-center justify-center mx-auto mb-4">{s.step}</div>
                <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">What users are saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-sm text-secondary-foreground mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-center mb-12">No credit card required for the free plan.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 flex flex-col ${p.popular ? "gradient-border ring-1 ring-primary/20" : ""}`}>
                {p.popular && <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 w-fit mb-4">Most Popular</span>}
                <h3 className="font-display text-xl font-bold mb-1">{p.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-display font-bold">{p.price}</span>
                  <span className="text-muted-foreground text-sm">{p.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-secondary-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className={`w-full py-3 rounded-lg font-semibold text-sm text-center transition-all block ${
                  p.popular ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" : "bg-secondary/60 hover:bg-secondary text-foreground"
                }`}>{p.popular ? "Get started" : "Start free"}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ComparisonTable />
      <FAQSection />

      {/* Final CTA */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(180deg, hsl(220 20% 7%) 0%, #0A0F1E 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-6">Ready to supercharge your career?</h2>
          <Link to="/auth" className="inline-block px-10 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all text-sm">
            Get started free →
          </Link>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
