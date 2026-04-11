import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlameKindling, Loader2, Copy, RotateCcw, CheckCheck, Share2, Download } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useAuth } from "@/contexts/AuthContext";
import { PaywallModal } from "@/components/PaywallModal";
import { ShareScoreModal } from "@/components/ShareScoreModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoastSection {
  name: string;
  score: number;
  critique: string;
  fix: string;
}

interface RoastResult {
  total_score: number;
  one_liner: string;
  sections: RoastSection[];
  top_3_fixes: string[];
}

function getScoreColor(score: number, max: number = 100) {
  const pct = (score / max) * 100;
  if (pct <= 40) return "text-red-400";
  if (pct <= 70) return "text-amber-400";
  return "text-green-400";
}

function getScoreRing(score: number) {
  if (score <= 40) return "border-red-500";
  if (score <= 70) return "border-amber-500";
  return "border-green-500";
}

function getSectionBg(score: number) {
  if (score <= 4) return "bg-red-500/10 border-red-500/20";
  if (score <= 7) return "bg-amber-500/10 border-amber-500/20";
  return "bg-green-500/10 border-green-500/20";
}

export default function ResumeRoast() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RoastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { isLimitReached, trackUsage, remaining, limit, plan } = useUsage();
  const { user } = useAuth();

  const generate = useCallback(async () => {
    if (!values.resume?.trim()) { setError("Please paste your resume."); return; }
    if (isLimitReached) { setShowPaywall(true); return; }

    setError(""); setLoading(true); setResult(null);

    try {
      const tracked = await trackUsage("resume-roast");
      if (!tracked) { setShowPaywall(true); setLoading(false); return; }

      const systemPrompt = `You are a resume roast expert — brutally honest but constructive. 

CRITICAL: Return ONLY valid JSON, no markdown, no code fences. Use this exact schema:
{
  "total_score": <number 0-100>,
  "one_liner": "<one savage but fair sentence>",
  "sections": [
    { "name": "Format & Readability", "score": <0-10>, "critique": "<2-3 sentences>", "fix": "<specific fix>" },
    { "name": "Bullet Point Impact", "score": <0-10>, "critique": "<2-3 sentences>", "fix": "<specific fix>" },
    { "name": "ATS Keyword Optimization", "score": <0-10>, "critique": "<2-3 sentences>", "fix": "<specific fix>" },
    { "name": "Quantified Achievements", "score": <0-10>, "critique": "<2-3 sentences>", "fix": "<specific fix>" },
    { "name": "Overall Impression", "score": <0-10>, "critique": "<2-3 sentences>", "fix": "<specific fix>" }
  ],
  "top_3_fixes": ["<fix 1>", "<fix 2>", "<fix 3>"]
}`;

      const userPrompt = `Roast this resume${values.role ? ` (targeting: ${values.role})` : ""}:\n\n${values.resume}`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
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
          tool_name: "resume-roast",
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
    const text = `Resume Score: ${result.total_score}/100\n${result.one_liner}\n\n${result.sections.map(s => `${s.name}: ${s.score}/10\n${s.critique}\nFix: ${s.fix}`).join("\n\n")}\n\nTop 3 Fixes:\n${result.top_3_fixes.map(f => `- ${f}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!result) return;
    const text = `RESUME ROAST REPORT\n${"=".repeat(40)}\n\nScore: ${result.total_score}/100\n${result.one_liner}\n\n${result.sections.map(s => `${s.name} (${s.score}/10)\n${s.critique}\nFix: ${s.fix}`).join("\n\n")}\n\nTop 3 Priority Fixes:\n${result.top_3_fixes.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\nGenerated by AuraPal — aurapal.org`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-roast-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      {result && <ShareScoreModal open={showShare} onClose={() => setShowShare(false)} score={result.total_score} type="resume" />}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <FlameKindling className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold">Resume Roast 🔥</h1>
            <p className="text-sm text-muted-foreground">Get your resume roasted with actionable improvements</p>
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
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Paste Your Resume</label>
          <textarea placeholder="Paste the full text of your resume here..."
            value={values.resume || ""}
            onChange={(e) => setValues(v => ({ ...v, resume: e.target.value }))}
            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[160px] resize-y transition-all duration-200" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Target Role (optional)</label>
          <input type="text" placeholder="e.g. Product Manager at Google"
            value={values.role || ""}
            onChange={(e) => setValues(v => ({ ...v, role: e.target.value }))}
            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">{error}</motion.p>
        )}

        <button onClick={generate} disabled={loading}
          className="w-full py-3 min-h-[52px] rounded-lg font-semibold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Roasting...</> : "Roast My Resume 🔥"}
        </button>
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loading && !result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-4">Preparing your roast... 🔥</p>
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
              <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full border-4 ${getScoreRing(result.total_score)} mb-4`}>
                <span className={`font-display text-3xl font-bold ${getScoreColor(result.total_score)}`}>{result.total_score}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Resume Score</p>
              <p className="text-base font-medium text-foreground italic">"{result.one_liner}"</p>
            </div>

            {/* 5 sections */}
            <div className="glass-card p-6 space-y-5">
              {result.sections.map((section, i) => (
                <div key={i} className={`border rounded-lg p-4 ${getSectionBg(section.score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-sm">{section.name}</h3>
                    <span className={`font-display font-bold text-lg ${getScoreColor(section.score, 10)}`}>{section.score}/10</span>
                  </div>
                  <p className="text-sm text-secondary-foreground mb-2">{section.critique}</p>
                  <p className="text-sm text-foreground"><span className="font-semibold">Fix:</span> {section.fix}</p>
                </div>
              ))}
            </div>

            {/* Top 3 fixes */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-3">🎯 Top 3 Priority Fixes</h3>
              <ol className="space-y-2">
                {result.top_3_fixes.map((fix, i) => (
                  <li key={i} className="flex gap-3 text-sm text-secondary-foreground">
                    <span className="font-display font-bold text-primary shrink-0">{i + 1}.</span> {fix}
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={downloadReport}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-secondary/60 hover:bg-secondary text-foreground transition-all">
                <Download className="h-4 w-4" /> Download Roast Report
              </button>
              <button onClick={() => setShowShare(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-all">
                <Share2 className="h-4 w-4" /> Share Your Score 🔥
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
