import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RotateCcw, Loader2, CheckCheck, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { PaywallModal } from "@/components/PaywallModal";

interface ToolPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  toolSlug: string;
  fields: { id: string; label: string; placeholder: string; type?: "text" | "textarea" }[];
  systemPrompt: string;
  buildUserPrompt: (values: Record<string, string>) => string;
  metaTitle?: string;
  metaDescription?: string;
  seoContent?: React.ReactNode;
}

const toolSuggestions = [
  { title: "Resume Builder", url: "/resume-builder", emoji: "📄" },
  { title: "SEO Article", url: "/seo-article-generator", emoji: "✍️" },
  { title: "Business Plan", url: "/business-plan", emoji: "💼" },
  { title: "Side Hustle", url: "/side-hustle-ideas", emoji: "💡" },
  { title: "LinkedIn Roaster", url: "/linkedin-roaster", emoji: "🔥" },
  { title: "Resume Roast", url: "/resume-roast", emoji: "🌶️" },
];

export function ToolPage({ title, description, icon: Icon, toolSlug, fields, systemPrompt, buildUserPrompt, seoContent }: ToolPageProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { isLimitReached, trackUsage, remaining, limit, plan } = useUsage();

  const otherTools = toolSuggestions.filter(t => t.title !== title).slice(0, 3);

  const generate = useCallback(async () => {
    const missing = fields.filter(f => !values[f.id]?.trim());
    if (missing.length) {
      setError(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    if (isLimitReached) {
      setShowPaywall(true);
      return;
    }

    setError("");
    setLoading(true);
    setResult("");

    try {
      const tracked = await trackUsage(toolSlug);
      if (!tracked) {
        setShowPaywall(true);
        setLoading(false);
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ systemPrompt, userPrompt: buildUserPrompt(values) }),
      });

      if (resp.status === 429) { setError("Too many requests. Please wait a moment."); setLoading(false); return; }
      if (resp.status === 402) { setError("AI credits exhausted. Please try again later."); setLoading(false); return; }
      if (!resp.ok || !resp.body) { setError("Something went wrong. Please try again."); setLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullText += content; setResult(fullText); }
          } catch {}
        }
      }
    } catch {
      setError("Failed to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [values, fields, systemPrompt, buildUserPrompt, isLimitReached, trackUsage, toolSlug]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {plan !== "premium" && (
            <div className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg">
              {remaining}/{limit} left
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea placeholder={field.placeholder} value={values[field.id] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-y transition-all duration-200" />
            ) : (
              <input type="text" placeholder={field.placeholder} value={values[field.id] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
            )}
          </div>
        ))}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
            {error}
          </motion.p>
        )}

        <button onClick={generate} disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : "Generate with AI ✨"}
        </button>
      </motion.div>

      <AnimatePresence>
        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">Result</h2>
              {result && (
                <div className="flex gap-2">
                  <button onClick={copyResult} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                    {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                    <RotateCcw className="h-4 w-4" /> Regenerate
                  </button>
                </div>
              )}
            </div>
            {loading && !result ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-secondary/50 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                ))}
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-secondary-foreground prose-strong:text-foreground prose-li:text-secondary-foreground">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
            <p className="text-sm font-medium text-muted-foreground mb-3">🚀 Try another tool</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {otherTools.map((tool) => (
                <Link key={tool.title} to={tool.url} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 group">
                  <span className="text-lg">{tool.emoji}</span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tool.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {seoContent}
    </div>
  );
}
