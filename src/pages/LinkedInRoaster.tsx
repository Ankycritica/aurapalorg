import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareWarning, Loader2, Copy, RotateCcw, CheckCheck, Share2, Link as LinkIcon } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useAuth } from "@/contexts/AuthContext";
import { PaywallModal } from "@/components/PaywallModal";
import { ShareScoreModal } from "@/components/ShareScoreModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoastResult {
  score: number;
  one_liner: string;
  headline: { rating: string; critique: string; rewrite: string };
  about: { rating: string; critique: string; rewrite: string };
  experience: { rating: string; critique: string; fixes: string[] };
}

function getBadge(rating: string) {
  if (rating === "critical") return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">🔴 Critical</span>;
  if (rating === "needs_work") return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">🟡 Needs Work</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">🟢 Good</span>;
}

function getScoreColor(score: number) {
  if (score <= 40) return "text-red-400";
  if (score <= 70) return "text-amber-400";
  return "text-green-400";
}

function getScoreRing(score: number) {
  if (score <= 40) return "border-red-500";
  if (score <= 70) return "border-amber-500";
  return "border-green-500";
}

export default function LinkedInRoaster() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RoastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { isLimitReached, trackUsage, remaining, limit, plan } = useUsage();
  const { user } = useAuth();

  const fields: { id: string; label: string; placeholder: string; type?: "text" | "textarea"; required?: boolean; hint?: string }[] = [
    { id: "profileUrl", label: "LinkedIn Profile URL (optional)", placeholder: "e.g. https://linkedin.com/in/yourname", hint: "We won't scrape it — just for context and reference" },
    { id: "headline", label: "Your Headline (first impressions matter...)", placeholder: "e.g. Marketing Manager | Growth Hacker | Coffee Lover", required: true },
    { id: "about", label: "Your About Section (let's see that story)", placeholder: "Paste your LinkedIn About section here...", type: "textarea", required: true },
    { id: "experience", label: "Your Experience (the highlight reel)", placeholder: "Brief overview of your listed roles, companies, and key achievements...", type: "textarea", required: true },
    { id: "skills", label: "Your Skills (optional — comma separated)", placeholder: "e.g. SEO, Content Marketing, Growth Hacking, Data Analysis" },
  ];

  const generate = useCallback(async () => {
    const required = ["headline", "about", "experience"];
    const missing = required.filter(id => !values[id]?.trim());
    if (missing.length) { setError("Please fill in headline, about, and experience sections."); return; }
    
    // Check minimum content length
    const totalContent = [values.headline, values.about, values.experience].join(" ").trim();
    if (totalContent.length < 80) {
      setError("Please provide more detail in your profile sections. A few words isn't enough for an accurate roast — give us your real LinkedIn content!");
      return;
    }
    
    if (isLimitReached) { setShowPaywall(true); return; }

    setError(""); setLoading(true); setResult(null);

    try {
      const tracked = await trackUsage("linkedin-roaster");
      if (!tracked) { setShowPaywall(true); setLoading(false); return; }

      const systemPrompt = `You are a LinkedIn profile roast expert — think comedy roast meets career advice. Be funny, brutally honest, and savage BUT always constructive. 

IMPORTANT SCORING RULES:
- Score based on the ACTUAL quality and depth of content provided.
- Short or vague sections should be scored harshly (e.g., a one-word headline = critical).
- If the headline is generic buzzwords like "Manager | Leader | Passionate", rate it critically.
- If the about section is under 2 sentences, rate it critically.
- Only rate "good" if the section is genuinely strong, specific, and compelling.
- A mediocre profile should score 30-50. Only truly polished profiles score 70+.

CRITICAL: Return ONLY valid JSON, no markdown, no code fences. Use this exact schema:
{
  "score": <number 0-100>,
  "one_liner": "<one witty sentence summarizing the profile>",
  "headline": { "rating": "<critical|needs_work|good>", "critique": "<2-3 sentences>", "rewrite": "<suggested rewrite>" },
  "about": { "rating": "<critical|needs_work|good>", "critique": "<2-3 sentences>", "rewrite": "<suggested rewrite>" },
  "experience": { "rating": "<critical|needs_work|good>", "critique": "<2-3 sentences>", "fixes": ["<fix 1>", "<fix 2>", "<fix 3>"] }
}`;

      const userPrompt = `Roast this LinkedIn profile:\n\n${values.profileUrl ? `Profile URL: ${values.profileUrl}\n\n` : ""}Headline: ${values.headline}\n\nAbout: ${values.about}\n\nExperience: ${values.experience}${values.skills ? `\n\nSkills: ${values.skills}` : ""}`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      if (resp.status === 429) { setError("Too many requests. Please wait."); setLoading(false); return; }
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
            if (content) fullText += content;
          } catch {}
        }
      }

      const cleaned = fullText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned) as RoastResult;
      setResult(parsed);

      if (user) {
        await supabase.from("generations").insert({
          user_id: user.id,
          tool_name: "linkedin-roaster",
          input_data: values as any,
          output_text: fullText,
        });
      }
    } catch {
      setError("Failed to parse roast results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [values, isLimitReached, trackUsage, user]);

  const copyResult = () => {
    if (!result) return;
    const text = `LinkedIn Score: ${result.score}/100\n${result.one_liner}\n\nHeadline: ${result.headline.critique}\nRewrite: ${result.headline.rewrite}\n\nAbout: ${result.about.critique}\nRewrite: ${result.about.rewrite}\n\nExperience: ${result.experience.critique}\nFixes:\n${result.experience.fixes.map(f => `- ${f}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      {result && <ShareScoreModal open={showShare} onClose={() => setShowShare(false)} score={result.score} type="LinkedIn" />}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <MessageSquareWarning className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold">LinkedIn Roaster 🔥</h1>
            <p className="text-sm text-muted-foreground">Paste your profile below. We'll be brutally honest.</p>
          </div>
          {plan !== "premium" && (
            <div className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg">
              {remaining}/{limit} left
            </div>
          )}
        </div>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.hint && (
              <p className="text-xs text-muted-foreground/70 mb-1.5">{field.hint}</p>
            )}
            {field.type === "textarea" ? (
              <textarea placeholder={field.placeholder} value={values[field.id] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-y transition-all duration-200" />
            ) : (
              <div className="relative">
                {field.id === "profileUrl" && (
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <input type="text" placeholder={field.placeholder} value={values[field.id] || ""}
                  onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                  className={`w-full bg-secondary/50 border border-border/50 rounded-lg py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${field.id === "profileUrl" ? "pl-10 pr-4" : "px-4"}`} />
              </div>
            )}
          </div>
        ))}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">{error}</motion.p>
        )}

        <button onClick={generate} disabled={loading}
          className="w-full py-3 min-h-[52px] rounded-lg font-semibold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Roasting...</> : "Roast Me 🔥"}
        </button>
      </motion.div>

      {/* Loading skeleton */}
      <AnimatePresence>
        {loading && !result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-4">Analyzing your LinkedIn profile... 🔥 This takes 10-20 seconds</p>
            <div className="space-y-3">
              {[85, 70, 90, 60].map((w, i) => (
                <div key={i} className="h-4 bg-secondary/50 rounded animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score card */}
            <div className="glass-card p-6 text-center" style={{ borderTop: "3px solid #F97066" }}>
              <div className="flex items-center justify-end gap-2 mb-4">
                <button onClick={copyResult} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  <RotateCcw className="h-4 w-4" /> Regen
                </button>
              </div>
              <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full border-4 ${getScoreRing(result.score)} mb-4`}>
                <span className={`font-display text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Your LinkedIn Score</p>
              <p className="text-base font-medium text-foreground italic">"{result.one_liner}"</p>
            </div>

            {/* Sections */}
            <div className="glass-card p-6 space-y-6">
              {/* Headline */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-semibold">Headline Analysis</h3>
                  {getBadge(result.headline.rating)}
                </div>
                <p className="text-sm text-secondary-foreground mb-3">{result.headline.critique}</p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-green-400 font-semibold mb-1">✨ Suggested Rewrite</p>
                  <p className="text-sm text-foreground">{result.headline.rewrite}</p>
                </div>
              </div>

              {/* About */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-semibold">About Section Review</h3>
                  {getBadge(result.about.rating)}
                </div>
                <p className="text-sm text-secondary-foreground mb-3">{result.about.critique}</p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-green-400 font-semibold mb-1">✨ Suggested Rewrite</p>
                  <p className="text-sm text-foreground">{result.about.rewrite}</p>
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-semibold">Experience & Skills</h3>
                  {getBadge(result.experience.rating)}
                </div>
                <p className="text-sm text-secondary-foreground mb-3">{result.experience.critique}</p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-400 font-semibold mb-2">🔧 Top Fixes</p>
                  <ul className="space-y-1">
                    {result.experience.fixes.map((fix, i) => (
                      <li key={i} className="text-sm text-foreground flex gap-2">
                        <span className="text-amber-400 shrink-0">•</span> {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="flex justify-center">
              <button onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-all">
                <Share2 className="h-4 w-4" /> Share Your Score 🔥
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
