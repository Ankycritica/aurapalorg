import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

export const SEO_LINKS = [
  { to: "/ats-resume-checker", label: "ATS resume checker" },
  { to: "/ai-resume-roast", label: "AI resume roast" },
  { to: "/free-cover-letter-generator", label: "Cover letter generator" },
  { to: "/linkedin-profile-review", label: "LinkedIn profile review" },
  { to: "/ai-interview-questions", label: "Interview questions" },
  { to: "/salary-checker-free", label: "Salary checker" },
  { to: "/startup-idea-validator", label: "Startup idea validator" },
];

interface SeoLandingProps {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  h1: string;
  subhead: string;
  ctaTo: string;
  ctaLabel: string;
  benefits: string[];
  exampleTitle: string;
  exampleOutput: string;
  faq: { q: string; a: string }[];
  /** Optional. Omit until a real, attributable quote exists. */
  testimonial?: { quote: string; name: string; role: string };
  keywords?: string;
}

export function SeoLandingLayout(props: SeoLandingProps) {
  useEffect(() => {
    document.title = props.metaTitle;
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const setMetaProp = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const url = `https://www.aurapal.org${window.location.pathname}`;
    setMetaName("description", props.metaDescription);
    if (props.keywords) setMetaName("keywords", props.keywords);
    setMetaProp("og:title", props.metaTitle);
    setMetaProp("og:description", props.metaDescription);
    setMetaProp("og:url", url);
    setMetaProp("og:type", "article");
    setMetaName("twitter:title", props.metaTitle);
    setMetaName("twitter:description", props.metaDescription);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", url);

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: props.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    document.querySelectorAll('script[data-seo="faq-jsonld"]').forEach((n) => n.remove());
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo", "faq-jsonld");
    s.textContent = JSON.stringify(faqLd);
    document.head.appendChild(s);
    return () => {
      document.querySelectorAll('script[data-seo="faq-jsonld"]').forEach((n) => n.remove());
    };
  }, [props.metaTitle, props.metaDescription, props.keywords, props.faq]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AuraPal" className="h-8 w-8 rounded-lg" />
            <span className="font-display font-bold text-lg">AuraPal</span>
          </Link>
          <Link to={props.ctaTo} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all">
            Try it free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold text-primary mb-5">
            <Sparkles className="h-3.5 w-3.5" /> {props.badge}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {props.h1}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {props.subhead}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link to={props.ctaTo}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] transition-all">
              {props.ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-muted-foreground">Free · No credit card</span>
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">What you get</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {props.benefits.map((b) => (
            <div key={b} className="glass-card p-4 flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-secondary-foreground">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example output */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">{props.exampleTitle}</h2>
        <p className="text-center text-sm text-muted-foreground mb-6">An example of the output format. Yours is built from your own input.</p>
        <div className="glass-card p-6 sm:p-8 whitespace-pre-line text-sm text-secondary-foreground leading-relaxed border-l-4 border-primary">
          {props.exampleOutput}
        </div>
        <div className="text-center mt-6">
          <Link to={props.ctaTo}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] transition-all">
            Generate yours free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Testimonial */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="glass-card p-6 sm:p-8 text-center">
          {props.testimonial ? (
            <>
              <p className="text-base sm:text-lg text-foreground italic mb-3">"{props.testimonial.quote}"</p>
              <p className="text-sm text-muted-foreground">— {props.testimonial.name}, {props.testimonial.role}</p>
            </>
          ) : (
            <>
              <p className="text-base sm:text-lg text-foreground mb-3">Free to start. No credit card, no trial timer.</p>
              <p className="text-sm text-muted-foreground">Free across all 10 tools. No card, no paid plan.</p>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-6">Frequently asked</h2>
        <div className="space-y-3">
          {props.faq.map((f) => (
            <details key={f.q} className="glass-card p-5 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                {f.q}
                <span className="text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="glass-card gradient-border p-8 sm:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Ready to try it?</h2>
          <p className="text-muted-foreground mb-6">Free. No credit card. Sign in with Google and get your first result in under a minute.</p>
          <Link to={props.ctaTo}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] transition-all">
            {props.ctaLabel} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Related free tools — internal links */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display text-xl font-bold text-center mb-4">More free career tools</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {SEO_LINKS.filter((l) => l.to !== (typeof window !== "undefined" ? window.location.pathname : "")).map((l) => (
            <Link key={l.to} to={l.to} className="px-3 py-1.5 rounded-full border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
