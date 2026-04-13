import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Copy, RotateCcw, Loader2, CheckCheck, ArrowRight, X, Heart, Download, Plus, Trash2, GraduationCap, Briefcase } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useUsage } from "@/hooks/useUsage";
import { useAuth } from "@/contexts/AuthContext";
import { PaywallModal } from "@/components/PaywallModal";
import { ResumeTemplates } from "@/components/ResumeTemplates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface ATSScore {
  score: number;
  positives: string[];
  missing: string[];
}

interface ExperienceEntry {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string;
}

interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  year: string;
}

const emptyExperience = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  company: "",
  jobTitle: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: "",
});

const emptyEducation = (): EducationEntry => ({
  id: crypto.randomUUID(),
  school: "",
  degree: "",
  field: "",
  year: "",
});

export default function ResumeBuilder() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([emptyExperience()]);
  const [educations, setEducations] = useState<EducationEntry[]>([emptyEducation()]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLimitReached, trackUsage, remaining, limit, plan } = useUsage();
  const { user } = useAuth();

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
      if (ext === "pdf") text = await extractTextFromPDF(file);
      else text = await extractTextFromDocx(file);
      setExtractedText(text);
    } catch {
      setError("Could not extract text from file. Please enter your details manually.");
    } finally {
      setExtracting(false);
    }
  }, []);

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const contactFields = [
    { id: "fullName", label: "Full Name", placeholder: "e.g. John Doe", required: true },
    { id: "email", label: "Email", placeholder: "e.g. john@example.com", required: true, type: "email" },
    { id: "phone", label: "Phone (optional)", placeholder: "e.g. +1 555-123-4567" },
    { id: "city", label: "City, State (optional)", placeholder: "e.g. San Francisco, CA" },
    { id: "linkedin", label: "LinkedIn URL (optional)", placeholder: "e.g. linkedin.com/in/johndoe" },
    { id: "portfolio", label: "Portfolio / GitHub URL (optional)", placeholder: "e.g. github.com/johndoe" },
  ];

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string | boolean) => {
    setExperiences(prev => prev.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const addExperience = () => setExperiences(prev => [...prev, emptyExperience()]);
  const removeExperience = (id: string) => setExperiences(prev => prev.length > 1 ? prev.filter(e => e.id !== id) : prev);

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducations(prev => prev.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const addEducation = () => setEducations(prev => [...prev, emptyEducation()]);
  const removeEducation = (id: string) => setEducations(prev => prev.length > 1 ? prev.filter(e => e.id !== id) : prev);

  const buildExperienceText = () => {
    return experiences
      .filter(e => e.company || e.jobTitle)
      .map(e => {
        const dateRange = e.current ? `${e.startDate} – Present` : `${e.startDate} – ${e.endDate}`;
        return `**${e.jobTitle}** at **${e.company}**${e.location ? `, ${e.location}` : ""}\n${dateRange}\n${e.bullets}`;
      })
      .join("\n\n");
  };

  const buildEducationText = () => {
    return educations
      .filter(e => e.school || e.degree)
      .map(e => `${e.degree}${e.field ? ` in ${e.field}` : ""} — ${e.school}${e.year ? ` (${e.year})` : ""}`)
      .join("\n");
  };

  const runAtsScore = async (resumeText: string) => {
    setAtsLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          systemPrompt: `You are an ATS (Applicant Tracking System) expert. Analyze the resume and return ONLY valid JSON, no markdown:\n{"score": <0-100>, "positives": ["<strength 1>", "<strength 2>"], "missing": ["<missing keyword 1>", "<missing keyword 2>"]}\nBe specific. Score based on formatting, keywords, quantified achievements, and ATS compatibility.`,
          userPrompt: `Analyze this resume for ATS compatibility for a ${values.role || "general"} role:\n\n${resumeText}`,
        }),
      });
      if (!resp.ok || !resp.body) return;
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const p = JSON.parse(jsonStr);
            const c = p.choices?.[0]?.delta?.content;
            if (c) fullText += c;
          } catch {}
        }
      }
      const cleaned = fullText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      setAtsScore(JSON.parse(cleaned));
    } catch {} finally {
      setAtsLoading(false);
    }
  };

  const generate = useCallback(async () => {
    if (!values.fullName?.trim() || !values.email?.trim()) {
      setError("Please fill in Full Name and Email.");
      return;
    }
    if (!values.role?.trim()) {
      setError("Please fill in Target Job Title.");
      return;
    }

    const hasExperience = experiences.some(e => e.company && e.jobTitle);
    const hasUpload = !!extractedText;

    if (!hasExperience && !hasUpload) {
      setError("Please add at least one work experience entry or upload your resume.");
      return;
    }

    if (isLimitReached) { setShowPaywall(true); return; }

    setError(""); setLoading(true); setResult(""); setSaved(false); setAtsScore(null);

    try {
      const tracked = await trackUsage("resume-builder");
      if (!tracked) { setShowPaywall(true); setLoading(false); return; }

      const contactInfo = [
        values.fullName,
        values.email,
        values.phone,
        values.city,
        values.linkedin,
        values.portfolio,
      ].filter(Boolean).join(" | ");

      const experienceText = buildExperienceText();
      const educationText = buildEducationText();

      const systemPrompt = `You are an expert resume writer. Create a professional, ATS-optimized resume in clean markdown format.

CRITICAL FORMATTING RULES:
1. Start with the candidate's name as # heading, then contact info on one line separated by |
2. Add a 2-3 sentence professional summary under ## Professional Summary
3. List each job under ## Professional Experience with this EXACT format:
   ### Job Title | Company Name
   **Location** | **Start Date – End Date**
   - Achievement bullet using XYZ format: "Accomplished [X] as measured by [Y], by doing [Z]"
   - Each bullet starts with a strong action verb and includes metrics/numbers
4. ## Education section
5. ## Skills section with comma-separated skills grouped by category
6. Use the candidate's EXACT contact details provided. Never use placeholders like [Name] or [Email].
7. Every bullet point MUST have quantifiable results (%, $, numbers).
8. Keep it to 1-2 pages worth of content.`;

      const userPrompt = hasUpload && !hasExperience
        ? `Improve this resume for a ${values.role} role. Use these exact contact details at the top: ${contactInfo}\n\nKey Skills: ${values.keywords || "Not specified"}\n\nExisting resume content:\n${extractedText}\n\nEducation:\n${educationText || "Include from existing resume"}`
        : `Create a professional resume for a ${values.role} role.\n\nContact: ${contactInfo}\n\nWork Experience:\n${experienceText}\n\nEducation:\n${educationText}\n\nKey Skills: ${values.keywords || "Not specified"}\n\n${hasUpload ? `Additional context from uploaded resume:\n${extractedText}` : ""}`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      if (resp.status === 429) { setError("Too many requests. Please wait a moment."); setLoading(false); return; }
      if (resp.status === 402) { setError("AI credits exhausted. Please try again later."); setLoading(false); return; }
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

      if (fullText) runAtsScore(fullText);

      if (user && fullText) {
        await supabase.from("generations").insert({
          user_id: user.id,
          tool_name: "resume-builder",
          input_data: { ...values, experiences, educations } as any,
          output_text: fullText,
        });
      }
    } catch {
      setError("Failed to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [values, experiences, educations, extractedText, isLimitReached, trackUsage, uploadedFile, user]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = async () => {
    if (!user || !result) return;
    await supabase.from("generations").insert({
      user_id: user.id,
      tool_name: "resume-builder",
      input_data: { ...values, experiences, educations } as any,
      output_text: result,
    });
    setSaved(true);
    toast.success("Saved to history ✓");
    setTimeout(() => setSaved(false), 3000);
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
            <p className="text-sm text-muted-foreground">AI-powered resume creation with structured input & professional templates</p>
          </div>
          {plan !== "premium" && (
            <div className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg">
              {remaining}/{limit} left
            </div>
          )}
        </div>
      </motion.div>

      {/* Upload */}
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
              <p className="text-xs text-muted-foreground">{extracting ? "Extracting text..." : "Text extracted ✓"}</p>
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

      {/* Contact Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-base mb-1">👤 Contact Information</h2>
        <p className="text-xs text-muted-foreground mb-3">This info will be placed directly at the top of your resume.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contactFields.map((field) => (
            <div key={field.id}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{field.label}</label>
              <input type={field.type || "text"} placeholder={field.placeholder} value={values[field.id] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Target Role & Skills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Target Job Title</label>
          <input type="text" placeholder="e.g. Senior Software Engineer" value={values.role || ""}
            onChange={(e) => setValues(v => ({ ...v, role: e.target.value }))}
            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Key Skills / Keywords <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input type="text" placeholder="e.g. React, Node.js, AWS, Agile, Leadership" value={values.keywords || ""}
            onChange={(e) => setValues(v => ({ ...v, keywords: e.target.value }))}
            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
        </div>
      </motion.div>

      {/* Work Experience - Structured */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-base">Work Experience</h2>
          </div>
          <button onClick={addExperience}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
            <Plus className="h-3.5 w-3.5" /> Add Position
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Add your work experience. The AI will enhance your bullet points with metrics and impact.</p>

        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="relative bg-secondary/20 border border-border/30 rounded-xl p-5 space-y-3">
              {experiences.length > 1 && (
                <button onClick={() => removeExperience(exp.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Position {idx + 1}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Job Title *</label>
                  <input type="text" placeholder="e.g. Marketing Manager" value={exp.jobTitle}
                    onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Company *</label>
                  <input type="text" placeholder="e.g. Pinnacle Corp" value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Location</label>
                  <input type="text" placeholder="e.g. Pune, India" value={exp.location}
                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Start Date</label>
                    <input type="text" placeholder="e.g. Jan 2020" value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      {exp.current ? "Present" : "End Date"}
                    </label>
                    {exp.current ? (
                      <div className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-muted-foreground">Present</div>
                    ) : (
                      <input type="text" placeholder="e.g. Dec 2023" value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    )}
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                  className="rounded border-border/50 text-primary focus:ring-primary/50" />
                <span className="text-muted-foreground">I currently work here</span>
              </label>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Key Responsibilities & Achievements</label>
                <textarea placeholder="Describe what you did — the AI will enhance these into impact-driven bullet points.&#10;&#10;Example:&#10;- Managed a team of 5 sales reps&#10;- Increased revenue by 30% through new outreach strategies&#10;- Built automated lead scoring using AI tools"
                  value={exp.bullets}
                  onChange={(e) => updateExperience(exp.id, "bullets", e.target.value)}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y transition-all" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-base">Education</h2>
          </div>
          <button onClick={addEducation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
            <Plus className="h-3.5 w-3.5" /> Add Education
          </button>
        </div>

        <div className="space-y-4">
          {educations.map((edu, idx) => (
            <div key={edu.id} className="relative bg-secondary/20 border border-border/30 rounded-xl p-5 space-y-3">
              {educations.length > 1 && (
                <button onClick={() => removeEducation(edu.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">School / University</label>
                  <input type="text" placeholder="e.g. MIT" value={edu.school}
                    onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Degree</label>
                  <input type="text" placeholder="e.g. Bachelor of Science" value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Field of Study</label>
                  <input type="text" placeholder="e.g. Computer Science" value={edu.field}
                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Graduation Year</label>
                  <input type="text" placeholder="e.g. 2020" value={edu.year}
                    onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="glass-card p-6">
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 mb-4">{error}</motion.p>
        )}
        <button onClick={generate} disabled={loading || extracting}
          className="w-full py-3 min-h-[52px] rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating... (~15 sec)</> : uploadedFile ? "Improve Resume with AI ✨" : "Generate Resume with AI ✨"}
        </button>
      </motion.div>

      {/* Result panel */}
      <AnimatePresence>
        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card overflow-hidden" style={{ borderTop: "3px solid hsl(var(--primary))" }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 pb-0 sm:pb-0 gap-3">
              <h2 className="font-display font-semibold text-lg">Your Results</h2>
              {result && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={copyResult} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-60">
                    <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} /> {saved ? "Saved ✓" : "Save"}
                  </button>
                  <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    <RotateCcw className="h-4 w-4" /> Regen
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-6">
              {loading && !result ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">Generating your resume... (~15 sec)</p>
                  {[85, 70, 90, 60, 75].map((w, i) => (
                    <div key={i} className="h-4 bg-secondary/50 rounded animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-secondary-foreground prose-strong:text-foreground prose-li:text-secondary-foreground">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS Score */}
      <AnimatePresence>
        {(atsLoading || atsScore) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6" style={{ borderTop: "3px solid hsl(var(--accent))" }}>
            <h3 className="font-display font-semibold text-base mb-4">📊 ATS Compatibility Score</h3>
            {atsLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-secondary/50 rounded animate-pulse w-1/2" />
              </div>
            ) : atsScore && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full border-4 ${atsScore.score >= 70 ? "border-green-500" : atsScore.score >= 50 ? "border-amber-500" : "border-red-500"}`}>
                    <span className={`font-display text-xl font-bold ${atsScore.score >= 70 ? "text-green-400" : atsScore.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{atsScore.score}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">ATS Score: {atsScore.score}/100</p>
                    <p className="text-xs text-muted-foreground">{atsScore.score >= 70 ? "Great ATS compatibility!" : atsScore.score >= 50 ? "Good, but room for improvement" : "Needs significant improvement"}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs text-green-400 font-semibold mb-2">✅ Strengths</p>
                    <ul className="space-y-1">
                      {atsScore.positives.map((p, i) => (
                        <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-green-400 shrink-0">✓</span> {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-400 font-semibold mb-2">⚠️ Missing Keywords</p>
                    <ul className="space-y-1">
                      {atsScore.missing.map((m, i) => (
                        <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-amber-400 shrink-0">!</span> {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {result && !loading && <ResumeTemplates content={result} />}

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
        <p className="text-sm text-muted-foreground">Our AI resume builder helps you create ATS-optimized resumes that stand out. Upload your existing resume for AI-powered improvements, or enter your details step-by-step. Using the proven XYZ format for bullet points, your accomplishments are presented with maximum impact.</p>
        <h2 className="font-display text-lg font-semibold">Features</h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Structured experience entry with AI-enhanced bullet points</li>
          <li>Upload & improve existing resumes (PDF/Word)</li>
          <li>Impact-driven XYZ format bullet points</li>
          <li>ATS compatibility score with keyword analysis</li>
          <li>40+ professional resume templates (8 free, 32 Pro)</li>
          <li>Download as PDF in any template</li>
        </ul>
      </div>
    </div>
  );
}
