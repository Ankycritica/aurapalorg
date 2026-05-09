import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const TOOLS = [
  "Resume Builder",
  "Resume Roast",
  "Cover Letter",
  "LinkedIn Roaster",
  "Interview Prep",
  "Salary Check",
  "Job Finder",
  "Aura Agent",
];

export function StickyToolReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const activeIndex = useTransform(scrollYProgress, [0, 1], [0, TOOLS.length - 0.001]);

  return (
    <section ref={ref} className="landing-noir relative" style={{ background: "var(--noir-1)", height: `${TOOLS.length * 80}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grain" />
        <div className="relative max-w-5xl mx-auto px-6 w-full">
          <div className="flex items-center gap-3 mb-10">
            <span className="block h-px w-10 gold-hairline" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">Capabilities</span>
          </div>
          <div className="relative h-[1.05em]" style={{ fontSize: "clamp(2.25rem, 8vw, 7rem)" }}>
            {TOOLS.map((t, i) => (
              <ToolWord key={t} word={t} index={i} progress={activeIndex} />
            ))}
          </div>
          <p className="mt-10 max-w-md text-cream/55 text-sm">
            One free engine. Every move that matters in your career — handled.
          </p>
        </div>
      </div>
    </section>
  );
}

function ToolWord({ word, index, progress }: { word: string; index: number; progress: any }) {
  const opacity = useTransform(progress, [index - 0.5, index, index + 0.5], [0, 1, 0]);
  const y = useTransform(progress, [index - 0.5, index, index + 0.5], [40, 0, -40]);
  const blur = useTransform(progress, [index - 0.5, index, index + 0.5], [10, 0, 10]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.div
      style={{ opacity, y, filter }}
      className="absolute inset-0 font-fraunces font-light text-cream leading-none"
    >
      {word}
      <span className="text-gold">.</span>
    </motion.div>
  );
}
