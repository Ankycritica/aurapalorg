import type { Variants } from "framer-motion";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutExpo } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easeOutExpo } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

export const stagger = (delay = 0.06): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.04 } },
});

/** Reusable viewport reveal props for whileInView sections. */
export const reveal = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, margin: "-80px" },
  variants: fadeUp,
};

/** Word-by-word reveal helper for hero headlines. */
export const wordVariants: Variants = {
  hidden: { opacity: 0, y: "0.5em" },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutExpo } },
};
