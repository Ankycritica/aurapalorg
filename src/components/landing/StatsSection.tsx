import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const stats: { value: number; suffix: string; label: string; decimals?: number }[] = [
  { value: 10, suffix: "", label: "AI Tools Included", decimals: 0 },
  { value: 5, suffix: "/day", label: "Free Generations" },
  { value: 0, suffix: "", label: "Card Required" },
  { value: 30, suffix: "s", label: "To First Result" },
];

function AnimatedNumber({ target, decimals = 0, suffix }: { target: number; decimals?: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1500;
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(eased * target);
          if (p < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="text-center">
            <p className="text-3xl md:text-4xl font-display font-bold gradient-text">
              <AnimatedNumber target={s.value} decimals={s.decimals} suffix={s.suffix} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
