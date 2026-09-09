import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ---------- mockups ---------- */

function TerminalMock() {
  const lines = [
    { t: "analyzing 7 years of experience…", c: "" },
    { t: "rewriting 14 bullets → XYZ format", c: "" },
    { t: "ATS keywords matched: 23/26", c: "" },
    { t: "ATS score: 87/100 ✓", c: "text-[#22c55e]" },
    { t: "resume ready → download PDF", c: "text-white" },
  ];
  return (
    <div className="panel p-4 mono text-[12px] leading-6">
      <p style={{ color: "var(--lm-fg-3)" }}>$ aurapal build --role "Senior Developer"</p>
      {lines.map((l, i) => (
        <motion.p key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.25 }}
          className={l.c} style={l.c ? undefined : { color: "var(--lm-fg-2)" }}>
          <span style={{ color: "var(--lm-fg-3)" }}>› </span>{l.t}
        </motion.p>
      ))}
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.6 }} className="cursor" style={{ color: "var(--lm-fg-3)" }}>$ </motion.p>
    </div>
  );
}

function RoastMock() {
  const items = [
    { k: "Headline", v: "Criminally vague", dot: "bg-[#ef4444]" },
    { k: "About", v: "Generic. No voice.", dot: "bg-[#f59e0b]" },
    { k: "Experience", v: "Solid, quantified", dot: "bg-[#22c55e]" },
  ];
  return (
    <div className="panel p-5">
      <div className="flex items-end justify-between border-b hairline pb-4 mb-4">
        <div>
          <p className="text-xs" style={{ color: "var(--lm-fg-3)" }}>LinkedIn score</p>
          <p className="mono text-4xl font-semibold mt-1">61<span className="text-lg" style={{ color: "var(--lm-fg-3)" }}>/100</span></p>
        </div>
        <p className="text-xs text-right max-w-[160px]" style={{ color: "var(--lm-fg-2)" }}>"Technically employed, barely memorable."</p>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <motion.div key={it.k} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${it.dot}`} />{it.k}</span>
            <span style={{ color: "var(--lm-fg-2)" }}>{it.v}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SalaryMock() {
  const bands = [
    { k: "P25", v: "$138K", w: 60 },
    { k: "P50", v: "$162K", w: 72 },
    { k: "P75", v: "$188K", w: 84 },
    { k: "P90", v: "$215K", w: 96 },
  ];
  return (
    <div className="panel p-5">
      <p className="text-xs mb-4" style={{ color: "var(--lm-fg-3)" }}>Senior Developer · Washington DC</p>
      <div className="space-y-3">
        {bands.map((b, i) => (
          <div key={b.k} className="grid grid-cols-[36px_1fr_56px] items-center gap-3 text-[12px]">
            <span className="mono" style={{ color: "var(--lm-fg-3)" }}>{b.k}</span>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${b.w}%` }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.12, duration: 0.7 }} className="h-full bg-white/70" />
            </div>
            <span className="mono text-right">{b.v}</span>
          </div>
        ))}
        <div className="grid grid-cols-[36px_1fr_56px] items-center gap-3 text-[12px] pt-2 border-t hairline mt-2">
          <span className="mono text-[#ef4444]">you</span>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "44%" }} viewport={{ once: true }} transition={{ delay: 0.75, duration: 0.7 }} className="h-full bg-[#ef4444]" />
          </div>
          <span className="mono text-right text-[#ef4444]">$100K</span>
        </div>
      </div>
      <p className="mono text-[11px] mt-4 text-[#ef4444]">−$62,000 below median</p>
    </div>
  );
}

function GrowMock() {
  const cards = [
    { k: "SEO article", v: "“Best AI tools for developers in 2026” · 1,480 words · title + meta ready" },
    { k: "Business plan", v: "Executive summary · TAM $2.1B · 18-month runway model" },
    { k: "Side hustle", v: "Technical writing retainer · $1.2K–2.5K/mo · 6 hrs/week" },
  ];
  return (
    <div className="space-y-2">
      {cards.map((c, i) => (
        <motion.div key={c.k} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.15 }}
          className="panel px-4 py-3">
          <p className="mono text-[11px] mb-1" style={{ color: "var(--lm-fg-3)" }}>{c.k}</p>
          <p className="text-[13px]" style={{ color: "var(--lm-fg-2)" }}>{c.v}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- stages ---------- */

const stages = [
  {
    n: "01", tag: "build", title: "A resume and cover letter, rewritten per role.",
    body: "Upload what you have or start from nothing. AuraPal rewrites every bullet in XYZ format, scores it against ATS filters, and exports a clean PDF in three templates.",
    cta: { label: "Build my resume", to: "/resume-builder" }, mock: TerminalMock,
  },
  {
    n: "02", tag: "roast", title: "The feedback your friends won't give you.",
    body: "Paste your LinkedIn or resume. Get a score out of 100, a one-line verdict, and a fix for every weak section. Brutal, specific, shareable.",
    cta: { label: "Roast my LinkedIn", to: "/linkedin-roaster" }, mock: RoastMock,
  },
  {
    n: "03", tag: "check", title: "Know your number before they name theirs.",
    body: "Salary benchmarked to P25–P90 for your role, city, and experience — with a realistic ask for your next negotiation. Or score a startup idea before you quit.",
    cta: { label: "Check my salary", to: "/salary-check" }, mock: SalaryMock,
  },
  {
    n: "04", tag: "grow", title: "Content, plans, and income on the side.",
    body: "SEO articles that rank. Investor-ready business plans. Side-hustle ideas matched to your skills and the hours you actually have.",
    cta: { label: "See all tools", to: "/auth" }, mock: GrowMock,
  },
];

export function PipelineSection() {
  return (
    <section id="pipeline" className="px-4 sm:px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <p className="section-number mb-3">The pipeline.</p>
        <h2 className="font-display font-bold tracking-[-0.02em] text-3xl sm:text-4xl lg:text-5xl max-w-2xl mb-20">
          Four stages. Ten tools. One account.
        </h2>

        <div className="space-y-24">
          {stages.map((s, i) => {
            const Mock = s.mock;
            const flip = i % 2 === 1;
            return (
              <div key={s.n} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}>
                  <p className="section-number mb-4">{s.n} · {s.tag}</p>
                  <h3 className="font-display font-semibold tracking-[-0.02em] text-2xl sm:text-[32px] leading-tight mb-4">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed max-w-[460px] mb-6" style={{ color: "var(--lm-fg-2)" }}>{s.body}</p>
                  <Link to={s.cta.to} className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all">
                    {s.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: 0.1 }}>
                  <Mock />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
