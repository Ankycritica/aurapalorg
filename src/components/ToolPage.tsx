import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RotateCcw, Loader2, CheckCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import type { LucideIcon } from "lucide-react";

interface ToolPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  fields: { id: string; label: string; placeholder: string; type?: "text" | "textarea" }[];
  systemPrompt: string;
  buildUserPrompt: (values: Record<string, string>) => string;
  metaTitle?: string;
  metaDescription?: string;
  seoContent?: React.ReactNode;
}

export function ToolPage({ title, description, icon: Icon, fields, systemPrompt, buildUserPrompt, seoContent }: ToolPageProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    const missing = fields.filter(f => !values[f.id]?.trim());
    if (missing.length) {
      setError(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
      return;
    }
    setError("");
    setLoading(true);
    setResult("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt: buildUserPrompt(values),
        }),
      });

      if (resp.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        setError("AI credits exhausted. Please try again later.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

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
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {}
        }
      }
    } catch (e) {
      setError("Failed to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [values, fields, systemPrompt, buildUserPrompt]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                placeholder={field.placeholder}
                value={values[field.id] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-y"
              />
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                value={values[field.id] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>
        ))}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : "Generate with AI ✨"}
        </button>
      </motion.div>

      <AnimatePresence>
        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">Result</h2>
              {result && (
                <div className="flex gap-2">
                  <button onClick={copyResult} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground transition-colors">
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

      {seoContent}
    </div>
  );
}
