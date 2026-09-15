import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/lib/useSeo";
import { posts } from "@/content/posts";
import "@/styles/landing-mono.css";

export default function Blog() {
  useSeo({
    title: "AuraPal Blog — Career Guides & Job Search Tactics",
    description:
      "Practical guides on ATS resumes, LinkedIn headlines and salary benchmarking. Written to be useful, not to sell you anything.",
    path: "/blog",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "AuraPal Blog",
      url: "https://aurapal.org/blog",
      description: "Career guides, resume tactics and salary research from AuraPal.",
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        description: p.teaser,
        datePublished: p.date,
        url: `https://aurapal.org/blog/${p.slug}`,
      })),
    },
  });

  return (
    <div className="lm min-h-screen">
      <nav className="border-b hairline">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AuraPal" className="h-7 w-7 rounded-md" />
            <span className="font-display font-semibold text-[15px]">AuraPal</span>
          </Link>
          <Link to="/auth" className="btn-invert px-4 py-2 text-sm">Open AuraPal</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 sm:px-6 pt-16 pb-20">
        <p className="section-number mb-3">Writing.</p>
        <h1 className="font-display text-[36px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.03em] mb-4">
          Career guides that say something.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed max-w-xl mb-14" style={{ color: "var(--lm-fg-2)" }}>
          Written to be useful on their own. If a tool here helps afterwards, good — but
          nothing below depends on you signing up for anything.
        </p>

        <div className="border-t hairline">
          {posts.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={`/blog/${p.slug}`}
                className="group block border-b hairline py-8 hover:bg-white/[0.02] transition-colors -mx-4 px-4"
              >
                <p className="section-number mb-3">
                  {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{p.readingMinutes} min read
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-[-0.02em] mb-2 flex items-start gap-2">
                  {p.title}
                  <ArrowRight className="h-4 w-4 mt-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                </h2>
                <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: "var(--lm-fg-2)" }}>
                  {p.teaser}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
