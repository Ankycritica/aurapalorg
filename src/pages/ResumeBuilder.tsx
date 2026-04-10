import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Copy, RotateCcw, Loader2, CheckCheck, ArrowRight, ExternalLink, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useUsage } from "@/hooks/useUsage";
import { PaywallModal } from "@/components/PaywallModal";

const RESUME_TEMPLATES = [
  {
    name: "Jake's Resume",
    description: "Clean LaTeX template, ATS-friendly, popular on r/resumes",
    url: "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs",
    tag: "Most Popular",
  },
  {
    name: "Harvard Template",
    description: "Classic format recommended by Harvard career services",
    url: "https://hwpi.harvard.edu/files/ocs/files/undergrad_resumes_and_cover_letters.pdf",
    tag: "Traditional",
  },
  {
    name: "Canva Resume",
    description: "Modern, visually polished templates with drag & drop editor",
    url: "https://www.canva.com/resumes/templates/",
    tag: "Visual",
  },
  {
    name: "Novoresume",
    description: "Professional builder with ATS-tested formats",
    url: "https://novoresume.com/resume-templates",
    tag: "ATS-Tested",
  },
];

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export default function ResumeBuilder() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLimitReached, trackUsage, remaining, limit, plan } = useUsage();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext || "")) {
      setError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }

    setUploadedFile(file);
    setExtracting(true);
    setError("");

    try {
      let text = "";
      if (ext === "pdf") {
        text = await extractTextFromPDF(file);
      } else {
        text = await extractTextFromDocx(file);
      }
      setValues(v => ({ ...v, experience: text }));
    } catch {
      setError("Could not extract text from file. Please paste your resume content manually.");
    } finally {
      setExtracting(false);
    }
  }, []);

  const removeFile = () => {
    setUploadedFile(null);
    setValues(v => ({ ...v, experience: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fields: { id: string; label: string; placeholder: string; type?: "text" | "textarea" }[] = [
    { id: "role", label: "Target Job Title", placeholder: "e.g. Senior Software Engineer" },
    { id: "experience", label: "Your Experience", placeholder: "Paste your work experience, skills, and achievements...", type: "textarea" },
    { id: "keywords", label: "Key Skills / Keywords", placeholder: "e.g. React, Node.js, AWS, Agile" },
  ];

  const generate = useCallback(async () => {
    const missing = fields.filter(f => !values[f.id]?.trim());
    if (missing.length) {
      setError(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
      return;
    }
    if (isLimitReached) { setShowPaywall(true); return; }

    setError(""); setLoading(true); setResult("");

    try {
      const tracked = await trackUsage("resume-builder");
      if (!tracked) { setShowPaywall(true); setLoading(false); return; }

      const systemPrompt = uploadedFile
        ? "You are an expert resume writer and career coach. The user has uploaded their existing resume. Analyze it and provide a significantly improved version. Use impact-driven XYZ format bullet points: 'Accomplished [X] as measured by [Y], by doing [Z]'. Fix weak bullet points, add quantifiable metrics, improve structure, optimize for ATS. Keep the factual content but dramatically improve the presentation."
        : "You are an expert resume writer and career coach. Create a professional, ATS-optimized resume. Use impact-driven XYZ format bullet points: 'Accomplished [X] as measured by [Y], by doing [Z]'. Structure with clear sections: Summary, Experience, Skills, Education. Use strong action verbs. Be specific with metrics and results.";

      const userPrompt = uploadedFile
        ? `Improve this resume for a ${values.role} role. Here is my current resume:\n\n${values.experience}\n\nKey Skills to highlight: ${values.keywords}`
        : `Create a professional resume for a ${values.role} role.\n\nExperience:\n${values.experience}\n\nKey Skills: ${values.keywords}`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ systemPrompt, userPrompt }),
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
  }, [values, fields, isLimitReached, trackUsage, uploadedFile]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const otherTools = [
    { title: "SEO Article", url: "/seo-article-generator", emoji: "✍️" },
    { title: "Business Plan", url: "/business-plan", emoji: "💼" },
    { title: "Resume Roast", url: "/resume-roast", emoji: "🌶️" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <title>AI Resume Builder — AuraPal | Create ATS-Optimized Resumes</title>
      <meta name="description" content="Build professional, ATS-optimized resumes with AI. Get impact-driven bullet points in XYZ format that land interviews." />
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold">Resume Builder</h1>
            <p className="text-sm text-muted-foreground">AI-powered resume creation & improvement with impact-driven XYZ bullet points</p>
          </div>
          {plan !== "premium" && (
            <div className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg">
              {remaining}/{limit} left
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card p-6">
        <h2 className="font-display font-semibold text-base mb-3">📄 Upload Existing Resume (Optional)</h2>
        <p className="text-sm text-muted-foreground mb-4">Have an existing resume? Upload it and our AI will analyze and improve it.</p>

        {!uploadedFile ? (
          <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all duration-200">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload PDF or Word document</span>
            <span className="text-xs text-muted-foreground/60">Supports .pdf, .doc, .docx</span>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
          </label>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {extracting ? "Extracting text..." : "Text extracted — edit below if needed"}
              </p>
            </div>
            {extracting ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
            ) : (
              <button onClick={removeFile} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
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

        <button onClick={generate} disabled={loading || extracting}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : uploadedFile ? "Improve Resume with AI ✨" : "Generate with AI ✨"}
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card p-6">
        <h2 className="font-display font-semibold text-base mb-1">🏆 Best Resume Templates</h2>
        <p className="text-sm text-muted-foreground mb-4">Use these proven templates to format your AI-generated resume content.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RESUME_TEMPLATES.map((tpl) => (
            <a key={tpl.name} href={tpl.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/30 hover:border-primary/30 transition-all duration-200 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{tpl.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tpl.tag}</span>
                </div>
                <p className="text-xs text-muted-foreground">{tpl.description}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0" />
            </a>
          ))}
        </div>
      </motion.div>

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

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold">Why Use an AI Resume Builder?</h2>
        <p className="text-sm text-muted-foreground">Our AI resume builder helps you create ATS-optimized resumes that stand out. Upload your existing resume for AI-powered improvements, or start from scratch. Using the proven XYZ format for bullet points, your accomplishments are presented with maximum impact.</p>
        <h2 className="font-display text-lg font-semibold">Features</h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Upload & improve existing resumes (PDF/Word)</li>
          <li>Impact-driven XYZ format bullet points</li>
          <li>ATS-optimized keyword placement</li>
          <li>Curated best resume templates</li>
          <li>Tailored to your target role</li>
        </ul>
      </div>
    </div>
  );
}
