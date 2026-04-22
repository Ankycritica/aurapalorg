import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RotateCcw, Loader2, CheckCheck, ArrowRight, Trash2, Eye, Clock, Download, Heart, Lock, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useAuth } from "@/contexts/AuthContext";
import { PaywallModal } from "@/components/PaywallModal";
import { SharePanel } from "@/components/SharePanel";
import { SocialProofBadge } from "@/components/SocialProofBadge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { attributionFooter } from "@/lib/referral";

interface ToolField {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface ToolPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  toolSlug: string;
  fields: ToolField[];
  systemPrompt: string;
  buildUserPrompt: (values: Record<string, string>) => string;
  metaTitle?: string;
  metaDescription?: string;
  seoContent?: React.ReactNode;
  accentColor?: string;
  generateLabel?: string;
}

const toolSuggestions = [
  { title: "Resume Builder", url: "/resume-builder", emoji: "📄", desc: "Land more interviews" },
  { title: "SEO Article", url: "/seo-article-generator", emoji: "✍️", desc: "Rank on Google" },
  { title: "Business Plan", url: "/business-plan", emoji: "💼", desc: "Investor-ready in minutes" },
  { title: "Side Hustle", url: "/side-hustle-ideas", emoji: "💡", desc: "Make extra income" },
  { title: "LinkedIn Roaster", url: "/linkedin-roaster", emoji: "🔥", desc: "Brutal profile audit" },
  { title: "Resume Roast", url: "/resume-roast", emoji: "🌶️", desc: "What recruiters won't tell you" },
  { title: "Cover Letter", url: "/cover-letter", emoji: "✉️", desc: "Tailored to any job" },
  { title: "Interview Prep", url: "/interview-prep", emoji: "🎤", desc: "Ace your next interview" },
  { title: "Am I Underpaid?", url: "/salary-check", emoji: "💸", desc: "Find out in 15 seconds" },
  { title: "Startup Validator", url: "/startup-validator", emoji: "🚀", desc: "Score your idea 0–100" },
];

interface HistoryItem {
  id: string;
  output_text: string;
  created_at: string;
  input_data: any;
}

export function ToolPage({ title, description, icon: Icon, toolSlug, fields, systemPrompt, buildUserPrompt, seoContent, accentColor, generateLabel }: ToolPageProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { isLimitReached, trackUsage, remaining, limit, plan } = useUsage();
  const { user } = useAuth();
  const { track } = useAnalytics();

  const otherTools = toolSuggestions.filter(t => t.title !== title).slice(0, 3);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data } = await supabase.from("generations")
      .select("id, output_text, created_at, input_data")
      .eq("user_id", user.id).eq("tool_name", toolSlug)
      .order("created_at", { ascending: false }).limit(20);
    if (data) setHistory(data);
    setHistoryLoading(false);
  }, [user, toolSlug]);

  useEffect(() => { if (activeTab === "history") fetchHistory(); }, [activeTab, fetchHistory]);

  const saveGeneration = useCallback(async (outputText: string) => {
    if (!user) return;
    await supabase.from("generations").insert({
      user_id: user.id,
      tool_name: toolSlug,
      input_data: values,
      output_text: outputText,
    });
  }, [user, toolSlug, values]);

  const saveToHistory = async () => {
    if (!user || !result) return;
    await saveGeneration(result);
    setSaved(true);
    toast.success("Saved to history ✓");
    setTimeout(() => setSaved(false), 3000);
  };

  const deleteGeneration = async (id: string) => {
    await supabase.from("generations").delete().eq("id", id);
    setHistory(h => h.filter(item => item.id !== id));
  };

  const generate = useCallback(async () => {
    const requiredFields = fields.filter(f => f.required !== false && f.type !== "select");
    const missing = requiredFields.filter(f => !values[f.id]?.trim());
    if (missing.length) { setError(`Please fill in: ${missing.map(f => f.label).join(", ")}`); return; }
    if (isLimitReached) { setShowPaywall(true); return; }

    setError(""); setLoading(true); setResult(""); setSaved(false);

    try {
      const tracked = await trackUsage(toolSlug);
      if (!tracked) { setShowPaywall(true); setLoading(false); return; }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ systemPrompt, userPrompt: buildUserPrompt(values) }),
      });

      if (resp.status === 429) { setError("Too many requests. Please wait."); setLoading(false); return; }
      if (resp.status === 402) { setError("AI credits exhausted."); setLoading(false); return; }
      if (!resp.ok || !resp.body) { setError("Something went wrong. Please try again."); setLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", fullText = "";

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

      if (fullText) {
        await saveGeneration(fullText);
        track("tool_used", { tool: toolSlug, plan, length: fullText.length });
      }
    } catch {
      setError("Failed to connect. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [values, fields, systemPrompt, buildUserPrompt, isLimitReached, trackUsage, toolSlug, saveGeneration]);

  const copyResult = () => {
    navigator.clipboard.writeText(result + attributionFooter());
    setCopied(true);
    toast.success("Copied with AuraPal attribution ✓");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = (format: "txt" | "pdf") => {
    if (format === "txt") {
      const blob = new Blob([result + attributionFooter()], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${toolSlug}-result.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const borderColor = accentColor || "hsl(var(--primary))";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-1 ring-primary/20 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.4)]">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          {plan !== "premium" && limit !== Infinity && (
            <div className="w-full sm:w-52 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Daily uses</span>
                <span className={`font-semibold ${remaining <= 1 ? "text-destructive" : "text-foreground"}`}>
                  {remaining} / {limit} left
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, (remaining / limit) * 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${remaining <= 1 ? "bg-destructive" : "bg-gradient-to-r from-primary to-accent"}`}
                />
              </div>
            </div>
          )}
          {plan === "premium" && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/15 to-accent/15 text-primary ring-1 ring-primary/30">
              ✦ Unlimited
            </div>
          )}
        </div>
        <div className="mt-3">
          <SocialProofBadge toolSlug={toolSlug} trending={["resume-roast", "linkedin-roaster", "salary-check", "startup-validator"].includes(toolSlug)} />
        </div>
      </motion.div>
      <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab("generate")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "generate" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Generate
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === "history" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Clock className="h-3.5 w-3.5" /> History
        </button>
      </div>

      {activeTab === "generate" ? (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {field.label}
                  {field.required === false && !field.label.toLowerCase().includes("optional") && (
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  )}
                </label>
                {field.type === "select" && field.options ? (
                  <select
                    value={values[field.id] || field.options[0]?.value || ""}
                    onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
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

            {error && !result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-destructive/30 bg-destructive/10 rounded-lg p-4">
                <p className="text-sm text-destructive font-medium mb-2">Generation failed</p>
                <p className="text-sm text-destructive/80 mb-3">{error}</p>
                <button onClick={generate} className="text-sm font-semibold text-destructive hover:underline">Retry →</button>
              </motion.div>
            )}

            <button onClick={generate} disabled={loading}
              className="group relative w-full py-3 min-h-[52px] rounded-lg font-semibold text-sm bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] transition-all duration-300 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating expert-grade output…</> : (generateLabel || "Generate with AI ✨")}
            </button>
          </motion.div>

          {/* Loading skeleton */}
          <AnimatePresence>
            {loading && !result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-4">Generating your results... this takes 10-20 seconds</p>
                <div className="space-y-3">
                  {[85, 70, 90, 60].map((w, i) => (
                    <div key={i} className="h-4 bg-secondary/50 rounded animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result panel */}
          <AnimatePresence>
            {result && (() => {
              // Paywall blur: free users see only ~60% of long results
              const shouldBlur = plan === "free" && result.length > 800 && !loading;
              const visibleResult = shouldBlur ? result.slice(0, Math.floor(result.length * 0.55)) : result;
              return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-card overflow-hidden" style={{ borderTop: `3px solid ${borderColor}` }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 pb-0 sm:pb-0 gap-3">
                  <h2 className="font-display font-semibold text-lg">Your Results</h2>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={copyResult} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                      {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 disabled:opacity-60">
                      <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} /> {saved ? "Saved ✓" : "Save"}
                    </button>
                    <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                      <RotateCcw className="h-4 w-4" /> Regen
                    </button>
                  </div>
                </div>
                <div className="relative p-4 sm:p-6">
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-secondary-foreground prose-strong:text-foreground prose-li:text-secondary-foreground">
                    <ReactMarkdown>{visibleResult}</ReactMarkdown>
                  </div>
                  {shouldBlur && (
                    <>
                      {/* Blurred preview of remainder */}
                      <div className="relative mt-2 select-none pointer-events-none" aria-hidden="true">
                        <div className="prose prose-invert prose-sm max-w-none blur-md opacity-60 max-h-40 overflow-hidden">
                          <ReactMarkdown>{result.slice(Math.floor(result.length * 0.55), Math.floor(result.length * 0.85))}</ReactMarkdown>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/80 to-card" />
                      </div>
                      {/* Unlock overlay */}
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="relative mt-4 rounded-xl p-5 bg-gradient-to-br from-primary/15 via-card/50 to-accent/15 border border-primary/30 text-center">
                        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent mb-3 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]">
                          <Lock className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-1">Unlock the full result + deeper insights</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                          You're seeing the preview. Upgrade to Pro to reveal the rest, get 100 daily generations, PDF exports, and priority AI.
                        </p>
                        <Link to="/pricing" onClick={() => track("tool_used", { action: "unlock_clicked", tool: toolSlug })}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] transition-all active:scale-[0.98]">
                          <Sparkles className="h-4 w-4" /> Upgrade Now — Unlock Full Result
                        </Link>
                        <p className="text-[11px] text-muted-foreground mt-3">7-day money-back guarantee · Cancel anytime</p>
                      </motion.div>
                    </>
                  )}
                </div>
                {!shouldBlur && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <button onClick={() => downloadResult("txt")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/60 text-sm text-muted-foreground hover:text-foreground transition-all">
                      <Download className="h-4 w-4" /> Download as TXT
                    </button>
                  </div>
                )}
              </motion.div>
              );
            })()}
          </AnimatePresence>

          <AnimatePresence>
            {result && !loading && (
              <SharePanel result={result} toolTitle={title} toolSlug={toolSlug} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && !loading && plan !== "premium" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="relative overflow-hidden rounded-xl p-5 sm:p-6 bg-gradient-to-br from-primary/10 via-card/40 to-accent/10 border border-primary/20">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{plan === "free" ? "Free plan" : "Pro plan"}</p>
                    <h3 className="font-display font-semibold text-base sm:text-lg text-foreground">
                      Unlock {plan === "free" ? "20× more" : "unlimited"} AI generations
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan === "free"
                        ? "Pro gives you 100/day, priority AI, and PDF exports — for less than a coffee a week."
                        : "Premium removes all daily limits and unlocks priority support."}
                    </p>
                  </div>
                  <Link to="/pricing" onClick={() => track("tool_used", { action: "upgrade_card_clicked", tool: toolSlug })}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)] transition-all active:scale-[0.98]">
                    Upgrade <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">🚀 Try next</p>
                  <span className="text-xs text-muted-foreground">Recommended for you</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {otherTools.map((tool) => (
                    <Link key={tool.title} to={tool.url}
                      className="group p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{tool.emoji}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="glass-card divide-y divide-border/50">
          {historyLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No history yet. Generate your first result!
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{format(new Date(item.created_at), "MMM d, yyyy 'at' HH:mm")}</p>
                  <p className="text-sm text-secondary-foreground line-clamp-2">{item.output_text.slice(0, 120)}...</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => { setResult(item.output_text); setActiveTab("generate"); }}
                    className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteGeneration(item.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {seoContent}
    </div>
  );
}
