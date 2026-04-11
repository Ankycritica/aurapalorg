import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const articles = [
  {
    title: "How to Write an ATS-Optimized Resume in 2025",
    teaser: "Learn the exact format, keywords, and structure that pass automated screening systems.",
  },
  {
    title: "The LinkedIn Profile Mistakes Killing Your Job Search",
    teaser: "Your headline is probably costing you interviews. Here's what recruiters actually look for.",
  },
  {
    title: "10 Side Hustles You Can Start This Weekend With AI",
    teaser: "From freelancing to micro-SaaS — profitable ideas you can launch in hours, not months.",
  },
];

export default function Blog() {
  const [email, setEmail] = useState("");

  const handleNotify = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }
    toast.success("You'll be notified when we publish!");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AuraPal" className="h-7 w-7 rounded-lg" />
            <span className="font-display font-bold">AuraPal</span>
          </Link>
          <Link to="/auth" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">
            Get started free
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">Career Tips & AI Insights</h1>
          <p className="text-muted-foreground">Coming soon — we're writing guides to help you land your dream job.</p>
        </motion.div>

        <div className="flex gap-2 max-w-md mx-auto mb-16">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={handleNotify} className="px-5 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all whitespace-nowrap">
            Notify me
          </button>
        </div>

        <div className="grid gap-6">
          {articles.map((article, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 relative overflow-hidden">
              <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-full">
                Coming soon
              </span>
              <h2 className="font-display text-lg font-semibold mb-2 pr-24">{article.title}</h2>
              <p className="text-sm text-muted-foreground">{article.teaser}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
