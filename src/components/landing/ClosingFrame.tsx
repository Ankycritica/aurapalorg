import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

export function ClosingFrame() {
  return (
    <section className="landing-noir relative overflow-hidden grain" style={{ background: "var(--noir-1)" }}>
      <div className="relative max-w-6xl mx-auto px-6 py-32 sm:py-44 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <span className="block h-px w-12 gold-hairline" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold">Your move</span>
          <span className="block h-px w-12 gold-hairline" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-fraunces font-light text-cream leading-none"
          style={{ fontSize: "clamp(4rem, 16vw, 14rem)" }}
        >
          Begin<span className="text-gold">.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 text-cream/60 text-sm"
        >
          No credit card. 5 free generations every day. Forever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="mt-10 inline-flex"
        >
          <MagneticButton>
            <Link
              to="/auth"
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-sm"
              style={{ background: "var(--gold)", color: "var(--noir-0)" }}
            >
              Start your career engine
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
