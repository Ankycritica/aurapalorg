import { motion, useReducedMotion } from "framer-motion";

/**
 * Cinematic ambient backdrop. Fixed, behind everything, GPU-friendly.
 * Three large soft radial blobs that drift on a slow loop + subtle grain.
 * Honors prefers-reduced-motion.
 */
export function AuroraBackground({ intensity = "default" }: { intensity?: "default" | "subtle" }) {
  const reduce = useReducedMotion();
  const opacity = intensity === "subtle" ? 0.45 : 0.7;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(30 20% 8%), hsl(var(--background)) 70%)" }} />

      {/* Aurora blob 1 — primary teal, top-left drift */}
      <motion.div
        className="absolute -top-32 -left-24 h-[42rem] w-[42rem] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(43 70% 50% / 0.32), transparent 60%)",
          filter: "blur(110px)",
          opacity,
          willChange: "transform",
        }}
        animate={reduce ? undefined : { x: [0, 60, -20, 0], y: [0, 40, 80, 0] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Aurora blob 2 — accent violet, top-right drift */}
      <motion.div
        className="absolute -top-20 right-[-10rem] h-[38rem] w-[38rem] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(28 88% 58% / 0.28), transparent 60%)",
          filter: "blur(120px)",
          opacity,
          willChange: "transform",
        }}
        animate={reduce ? undefined : { x: [0, -50, 30, 0], y: [0, 60, -10, 0] }}
        transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Aurora blob 3 — magenta, bottom drift */}
      <motion.div
        className="absolute bottom-[-12rem] left-[20%] h-[36rem] w-[36rem] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(18 85% 55% / 0.22), transparent 60%)",
          filter: "blur(120px)",
          opacity: opacity * 0.85,
          willChange: "transform",
        }}
        animate={reduce ? undefined : { x: [0, 40, -60, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Film grain to kill banding */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/></svg>\")",
        }}
      />

      {/* Edge vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 55%, hsl(var(--background) / 0.6) 100%)",
      }} />
    </div>
  );
}
