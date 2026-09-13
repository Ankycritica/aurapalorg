import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight, FileText, Mail, MessageCircle, PenLine, Briefcase, Lightbulb, MessageSquareWarning, FlameKindling, DollarSign, Rocket } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import { HeroMono } from "@/components/landing/HeroMono";
import { TickerBar } from "@/components/landing/TickerBar";
import { PipelineSection } from "@/components/landing/PipelineSection";
import { StatsMono } from "@/components/landing/StatsMono";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { useLenis } from "@/lib/useLenis";
import { useSeo } from "@/lib/useSeo";
import "@/styles/landing-mono.css";

const tools = [
  { title: "Resume Builder", desc: "ATS-scored, XYZ bullets, PDF export", icon: FileText, to: "/resume-builder" },
  { title: "Cover Letter", desc: "Tailored to the job description", icon: Mail, to: "/cover-letter" },
  { title: "Interview Prep", desc: "Likely questions + answer frameworks", icon: MessageCircle, to: "/interview-prep" },
  { title: "LinkedIn Roaster", desc: "Score out of 100, section by section", icon: MessageSquareWarning, to: "/linkedin-roaster" },
  { title: "Resume Roast", desc: "Five scored categories, one fix each", icon: FlameKindling, to: "/resume-roast" },
  { title: "Am I Underpaid?", desc: "P25–P90 benchmark + negotiation ask", icon: DollarSign, to: "/salary-check" },
  { title: "Startup Validator", desc: "Idea scored 0–100 before you quit", icon: Rocket, to: "/startup-validator" },
  { title: "SEO Article", desc: "Keyword-structured posts that rank", icon: PenLine, to: "/seo-article-generator" },
  { title: "Business Plan", desc: "Investor-ready in minutes", icon: Briefcase, to: "/business-plan" },
  { title: "Side Hustle", desc: "Income ideas matched to your hours", icon: Lightbulb, to: "/side-hustle-ideas" },
];

// No testimonials until real users send them. Invented quotes attributed to
// invented people are the fastest way to lose a launch audience's trust.
// These are claims about the product that are true today and checkable.
const promises = [
  { title: "Scored, not vague", body: "Roast tools return a number out of 100 and a specific fix for every weak section — not 'consider strengthening this'." },
  { title: "Nothing to configure", body: "No prompt engineering, no setup. Pick a tool, fill three fields, get a structured result in about thirty seconds." },
  { title: "Yours to keep", body: "Every generation is saved to your history. Copy it, export it, or come back to it later." },
];

const plans = [
  { name: "Free", price: "$0", period: "forever", line: "Enough to see if it sticks.", volume: "5", unit: "generations / day", popular: false, cta: "Start free" },
  { name: "Pro", price: "$19", period: "/ month", line: "For an active job search.", volume: "100", unit: "generations / day", popular: true, cta: "Start Pro" },
  { name: "Premium", price: "$49", period: "/ month", line: "For people who ship daily.", volume: "∞", unit: "unlimited generations", popular: false, cta: "Go Premium" },
];

const faqs = [
  { q: "Is AuraPal really free?", a: "Yes. The free plan gives you 5 AI generations per day across all 10 tools. No card required." },
  { q: "What AI powers it?", a: "Claude, made by Anthropic. Every tool uses a purpose-built prompt designed around what recruiters and hiring managers actually look for." },
  { q: "Can I cancel anytime?", a: "Yes. Stop billing in one click from Settings. Your generations and history stay." },
  { q: "Is my resume data private?", a: "Encrypted in transit and at rest, never sold, never used to train models. Delete any generation from your dashboard." },
  { q: "What can I export?", a: "Pro and Premium export resumes, cover letters and reports to PDF. Everyone can copy to clipboard." },
  { q: "Why not just use ChatGPT?", a: "You can. AuraPal is faster: no prompt engineering, structured scored outputs, history, templates, and a tracker for the jobs you apply to." },
];

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useSeo({
    title: "AuraPal — Free AI Career Engine for Resumes & Jobs",
    description: "AuraPal: 10 free AI career tools — resume builder, cover letter, interview prep, LinkedIn roaster, salary check & more. No credit card.",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  });

  useLenis(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = "text-sm transition-colors hover:text-white";

  return (
    <div className="lm min-h-screen">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${scrolled ? "bg-[#050505]/90 backdrop-blur border-b hairline" : ""}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AuraPal" className="h-7 w-7 rounded-md" />
            <span className="font-display font-semibold text-[15px]">AuraPal</span>
          </Link>
          <div className="hidden md:flex items-center gap-7" style={{ color: "var(--lm-fg-2)" }}>
            <a href="#pipeline" className={navLink}>How it works</a>
            <a href="#tools" className={navLink}>Tools</a>
            <a href="#pricing" className={navLink}>Pricing</a>
            <Link to="/blog" className={navLink}>Blog</Link>
            <Link to="/auth" className={navLink}>Log in</Link>
            <Link to="/auth" className="btn-invert px-4 py-2 text-sm">Sign up</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-[#050505] border-b hairline px-4 py-4 space-y-3" style={{ color: "var(--lm-fg-2)" }}>
            <a href="#pipeline" onClick={() => setMobileMenu(false)} className="block text-sm">How it works</a>
            <a href="#tools" onClick={() => setMobileMenu(false)} className="block text-sm">Tools</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block text-sm">Pricing</a>
            <Link to="/blog" className="block text-sm">Blog</Link>
            <Link to="/auth" className="block text-sm">Log in</Link>
            <Link to="/auth" className="btn-invert block text-center px-4 py-2.5 text-sm">Sign up</Link>
          </div>
        )}
      </nav>

      <HeroMono />
      <TickerBar />
      <PipelineSection />
      <StatsMono />

      {/* Tools index */}
      <section id="tools" className="px-4 sm:px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="section-number mb-3">Every tool.</p>
          <h2 className="font-display font-bold tracking-[-0.02em] text-3xl sm:text-4xl mb-12">Ten tools. Same account. Same credits.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 border-t border-l hairline">
            {tools.map((t) => (
              <Link key={t.title} to={t.to} className="group border-r border-b hairline p-5 hover:bg-white/[0.03] transition-colors">
                <t.icon className="h-4 w-4 mb-4" style={{ color: "var(--lm-fg-3)" }} />
                <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  {t.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--lm-fg-3)" }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 py-24 border-t hairline">
        <div className="max-w-6xl mx-auto">
          <p className="section-number mb-12">What you get.</p>
          <div className="grid md:grid-cols-3 gap-10">
            {promises.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="border-l hairline-2 pl-5">
                <p className="text-[15px] font-medium mb-2">{t.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--lm-fg-2)" }}>{t.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 sm:px-6 py-24 border-t hairline">
        <div className="max-w-6xl mx-auto">
          <p className="section-number mb-3">Pricing.</p>
          <h2 className="font-display font-bold tracking-[-0.02em] text-3xl sm:text-4xl mb-3">Pay for results. Not the tool.</h2>
          <p className="text-[15px] mb-12 max-w-lg" style={{ color: "var(--lm-fg-2)" }}>Every plan is the full product with all ten tools. Plans differ only by volume.</p>

          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p.name} className={`panel p-6 flex flex-col ${p.popular ? "border-white/40" : ""}`}>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.popular && <span className="mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white text-black">Most popular</span>}
                </div>
                <p className="mono text-4xl font-semibold tracking-tight">{p.price}<span className="text-sm font-normal ml-1" style={{ color: "var(--lm-fg-3)" }}>{p.period}</span></p>
                <p className="text-sm mt-2 mb-6" style={{ color: "var(--lm-fg-2)" }}>{p.line}</p>
                <div className="border-t hairline pt-5 mb-6">
                  <p className="text-xs mb-1" style={{ color: "var(--lm-fg-3)" }}>You get</p>
                  <p className="mono text-2xl font-semibold">{p.volume}</p>
                  <p className="text-xs" style={{ color: "var(--lm-fg-3)" }}>{p.unit}</p>
                </div>
                <Link to="/auth" className={`mt-auto text-center py-2.5 text-sm ${p.popular ? "btn-invert" : "btn-ghost"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mt-10 text-xs" style={{ color: "var(--lm-fg-3)" }}>
            <p><span className="text-white">Cancel any time.</span> Stop billing in one click.</p>
            <p><span className="text-white">5 free per day.</span> No card required.</p>
            <p><span className="text-white">All ten tools.</span> On every plan, including free.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 sm:px-6 py-24 border-t hairline">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <div>
            <p className="section-number mb-3">Frequently asked.</p>
            <h2 className="font-display font-bold tracking-[-0.02em] text-3xl sm:text-4xl mb-4">What people ask before signing up.</h2>
            <p className="text-sm" style={{ color: "var(--lm-fg-2)" }}>
              Something else? Write to <a href="mailto:contact@aurapal.org" className="text-white underline underline-offset-4">contact@aurapal.org</a>. A real person replies.
            </p>
          </div>
          <Accordion type="single" collapsible className="border-t hairline">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`} className="border-b hairline">
                <AccordionTrigger className="text-[15px] font-medium py-5 hover:no-underline text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm pb-5 leading-relaxed" style={{ color: "var(--lm-fg-2)" }}>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA — inverted */}
      <section className="bg-white text-black px-4 sm:px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="mono text-[11px] uppercase tracking-[0.12em] text-black/50 mb-3">Five free. Then upgrade if it sticks.</p>
          <h2 className="font-display font-bold tracking-[-0.03em] text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-8">Get your first result in the next sixty seconds.</h2>
          <Link to="/auth" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-85 transition-opacity">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
