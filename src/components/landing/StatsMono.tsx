import { useEffect, useRef, useState } from "react";

// Facts about the product, not invented traction. AuraPal launched this
// month; usage and rating claims would be fabricated, and they are the first
// thing a sceptical reader checks.
const stats: { value: number; suffix: string; label: string; decimals?: number }[] = [
  { value: 10, suffix: "", label: "AI tools included", decimals: 0 },
  { value: 5, suffix: "/day", label: "Free generations" },
  { value: 0, suffix: "", label: "Card required to start" },
  { value: 30, suffix: "s", label: "To your first result" },
];

function Num({ target, decimals = 0, suffix }: { target: number; decimals?: number; suffix: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const t0 = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - t0) / 1200, 1);
        setV((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      tick();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()}{suffix}</span>;
}

export function StatsMono() {
  return (
    <section className="border-y hairline">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-6 py-10 ${i % 2 === 1 ? "border-l hairline" : ""} ${i >= 2 ? "border-t lg:border-t-0 hairline" : ""} ${i === 2 ? "lg:border-l" : ""} ${i === 3 ? "lg:border-l" : ""}`}>
            <p className="mono text-3xl sm:text-4xl font-semibold tracking-tight"><Num target={s.value} decimals={s.decimals} suffix={s.suffix} /></p>
            <p className="text-xs mt-2" style={{ color: "var(--lm-fg-3)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
