import { motion } from "framer-motion";

const logos = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"];

export function TrustBar() {
  return (
    <section className="py-10 px-4 border-y border-border/30 bg-secondary/10">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6"><p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Used by job seekers targeting</p></p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((name, i) => (
            <motion.span key={name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="text-lg font-display font-bold text-muted-foreground/40 select-none">
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
