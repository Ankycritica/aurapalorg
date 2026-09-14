import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const rows = [
  { k: "Role", v: "Senior Developer · DC", tone: "" },
  { k: "Market median", v: "$162,000", tone: "text-[#22c55e]" },
  { k: "Your salary", v: "$100,000", tone: "text-[#ef4444]" },
  { k: "Gap", v: "−$62,000 below median", tone: "text-[#ef4444] font-semibold" },
  { k: "Verdict", v: "Criminally underpaid", tone: "text-[#f59e0b] font-semibold" },
];

export function HeroMono() {
  return (
    <section className="relative pt-36 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
        {/* Copy */}
        <div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="section-number mb-6">
            10 AI career tools · one account
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="font-display font-bold tracking-[-0.03em] leading-[0.98] text-[44px] sm:text-[60px] lg:text-[72px]"
          >
            Your AI career engine.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-6 text-[17px] sm:text-lg leading-relaxed max-w-[520px]"
            style={{ color: "var(--lm-fg-2)" }}
          >
            Build resumes. Roast your LinkedIn. Check your salary. Prep for interviews. Every result in under fifteen seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <Link to="/auth" className="btn-invert px-6 py-3 text-sm inline-flex items-center justify-center gap-2">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#pipeline" className="btn-ghost px-6 py-3 text-sm text-center">
              See how it works
            </a>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 text-xs" style={{ color: "var(--lm-fg-3)" }}>
            Free to start · No card required · Powered by Google Gemini
          </motion.p>
        </div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="panel overflow-hidden"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 60px -30px rgba(0,0,0,0.9)" }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b hairline">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="mono text-[11px] ml-2" style={{ color: "var(--lm-fg-3)" }}>aurapal.org/salary-check</span>
          </div>

          <div className="p-5">
            <p className="text-xs mb-4" style={{ color: "var(--lm-fg-3)" }}>Am I underpaid?</p>
            <div className="divide-y hairline border-y hairline">
              {rows.map((r, i) => (
                <motion.div
                  key={r.k}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.18 }}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-[13px]" style={{ color: "var(--lm-fg-2)" }}>{r.k}</span>
                  <span className={`mono text-[13px] ${r.tone}`}>{r.v}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex justify-between mono text-[10px] mb-2" style={{ color: "var(--lm-fg-3)" }}>
                <span>you</span><span>P25</span><span>P50</span><span>P75</span><span>P90</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: "31%" }}
                  transition={{ delay: 1.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-[#ef4444]"
                />
              </div>
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="mono text-[11px] mt-4" style={{ color: "var(--lm-fg-3)" }}>
              generated in 4.2s
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
