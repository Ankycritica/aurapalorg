import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import heroVideo from "@/assets/hero-loop.mp4.asset.json";
import heroPoster from "@/assets/hero-poster.jpg";
import { MagneticButton } from "./MagneticButton";

const HEADLINE = ["Your", "career,", "rewritten", "in", "gold."];

export function CinematicIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="landing-noir relative w-full overflow-hidden grain" style={{ background: "var(--noir-1)", minHeight: "100vh" }}>
      {/* Video background */}
      <motion.div className="absolute inset-0" style={{ y }} aria-hidden>
        <video
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          src={heroVideo.url}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <img
          src={heroPoster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover md:hidden"
          width={1920}
          height={1080}
        />
        {/* Vignette + noir overlay */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.55) 75%, rgba(10,10,10,0.95) 100%)"
        }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(13,13,13,0.4) 0%, rgba(13,13,13,0.2) 40%, var(--noir-1) 100%)" }} />
      </motion.div>

      {/* Content */}
      <motion.div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32 min-h-screen flex flex-col justify-center" style={{ opacity }}>
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <span className="block h-px w-10 animate-hairline gold-hairline" />
          <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">
            The Free AI Career Engine
          </span>
        </div>

        {/* Display headline */}
        <h1 className="font-fraunces font-light text-cream leading-[0.95]"
          style={{ fontSize: "clamp(3.25rem, 9vw, 8.5rem)" }}>
          {HEADLINE.map((w, i) => (
            <span key={i} className="word-rise mr-[0.25em]" style={{ animationDelay: `${0.15 + i * 0.09}s` }}>
              {i === HEADLINE.length - 1 ? <em className="text-gold not-italic font-normal">{w}</em> : w}
            </span>
          ))}
        </h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 max-w-xl text-base sm:text-lg text-cream/70 leading-relaxed"
        >
          Resumes, cover letters, interview prep, salary checks, jobs — every move in
          your career, crafted by AI in seconds. Free to start. No credit card.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-12 flex flex-wrap items-center gap-5"
        >
          <MagneticButton>
            <Link
              to="/auth"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm bg-gold text-noir hover:bg-gold-soft transition-colors"
              style={{ background: "var(--gold)", color: "var(--noir-0)" }}
            >
              Begin free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </MagneticButton>
          <MagneticButton strength={0.15}>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-sm text-cream/80 hover:text-cream border border-cream/15 hover:border-gold/40 transition-colors"
            >
              See how it works
            </a>
          </MagneticButton>
        </motion.div>

        {/* Bottom marker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-10 left-6 right-6 flex items-end justify-between text-[10px] uppercase tracking-[0.3em] text-cream/40 font-mono"
        >
          <span>est. 2026</span>
          <span className="hidden sm:inline">aurapal · career engine</span>
          <span>↓ scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
