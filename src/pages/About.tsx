import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";

export default function About() {
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

      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold mb-6">About AuraPal</h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            AuraPal is an AI-powered career engine built to help job seekers land better opportunities faster. 
            We combine the latest AI with career expertise to give everyone access to tools that used to cost 
            hundreds of dollars per hour.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-12">
            From resume building and cover letter generation to interview prep and LinkedIn optimization — 
            our 8 free AI tools cover every stage of the job search. Whether you're a fresh graduate or a 
            seasoned professional, AuraPal helps you present your best self.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-12">Built in 2025. Powered by AI.</p>
          <Link to="/dashboard" className="inline-block px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all text-sm">
            Try AuraPal free →
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
