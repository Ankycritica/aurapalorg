import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Star, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

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
  testimonial: { quote: string; name: string; role: string };
  keywords?: string;
}

export function SeoLandingLayout(props: SeoLandingProps) {
  useEffect(() => {
    document.title = props.metaTitle;
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", props.metaDescription);
    if (props.keywords) setMeta("keywords", props.keywords);
  }, [props.metaTitle, props.metaDescription, props.keywords]);

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
            <span className="text-sm text-muted-foreground">No credit card · Free forever plan</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="ml-2">Trusted by 10,000+ professionals</span>
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
        <p className="text-center text-sm text-muted-foreground mb-6">A real sample of what AuraPal generates in seconds.</p>
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
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
          </div>
          <p className="text-base sm:text-lg text-foreground italic mb-3">"{props.testimonial.quote}"</p>
          <p className="text-sm text-muted-foreground">— {props.testimonial.name}, {props.testimonial.role}</p>
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
          <p className="text-muted-foreground mb-6">Free forever plan. No credit card. 15 seconds to your first result.</p>
          <Link to={props.ctaTo}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] transition-all">
            {props.ctaLabel} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
