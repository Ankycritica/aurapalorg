import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Lock, Crown, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Loader2, Save, Eye, Copy, FileText, Settings2, Target, Layers } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ───────── Types ───────── */

export interface ResumeSection {
  id: string;
  heading: string;
  items: string[];
}

export interface ResumeData {
  name: string;
  contact: string[];
  sections: ResumeSection[];
}

interface TemplateInfo {
  id: string;
  name: string;
  tag: string;
  pro: boolean;
}

const allTemplates: TemplateInfo[] = [
  { id: "modern", name: "Modern", tag: "Popular", pro: false },
  { id: "classic", name: "Classic", tag: "Pro", pro: false },
  { id: "minimal", name: "Minimal", tag: "Clean", pro: false },
  { id: "bold", name: "Bold", tag: "Standout", pro: false },
  { id: "executive", name: "Executive", tag: "Senior", pro: false },
  { id: "creative", name: "Creative", tag: "Design", pro: false },
  { id: "compact", name: "Compact", tag: "Dense", pro: false },
  { id: "tech", name: "Tech", tag: "Dev", pro: false },
  { id: "pro-elegant", name: "Elegant", tag: "Pro", pro: true },
  { id: "pro-gradient", name: "Gradient", tag: "Pro", pro: true },
  { id: "pro-timeline", name: "Timeline", tag: "Pro", pro: true },
  { id: "pro-sidebar", name: "Sidebar", tag: "Pro", pro: true },
  { id: "pro-corporate", name: "Corporate", tag: "Pro", pro: true },
  { id: "pro-startup", name: "Startup", tag: "Pro", pro: true },
  { id: "pro-swiss", name: "Swiss", tag: "Pro", pro: true },
  { id: "pro-magazine", name: "Magazine", tag: "Pro", pro: true },
  { id: "pro-metro", name: "Metro", tag: "Pro", pro: true },
  { id: "pro-google", name: "Google", tag: "Pro", pro: true },
  { id: "pro-apple", name: "Apple", tag: "Pro", pro: true },
  { id: "pro-consulting", name: "Consulting", tag: "Pro", pro: true },
  { id: "pro-banking", name: "Banking", tag: "Pro", pro: true },
  { id: "pro-marketing", name: "Marketing", tag: "Pro", pro: true },
  { id: "pro-design", name: "Designer", tag: "Pro", pro: true },
];

/* ───────── Markdown <-> Structured ───────── */

const cleanMd = (t: string) => t.replace(/\*\*(.*?)\*\*/g, "$1").trim();

export function parseMarkdownToResume(md: string): ResumeData {
  const lines = md.split("\n");
  const data: ResumeData = { name: "", contact: [], sections: [] };
  let currentSection: ResumeSection | null = null;
  let isFirstHeading = true;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^#\s/.test(line) && isFirstHeading) {
      data.name = cleanMd(line.replace(/^#+\s*/, ""));
      isFirstHeading = false;
      continue;
    }

    if (/^#{2,3}\s/.test(line)) {
      if (currentSection) data.sections.push(currentSection);
      currentSection = {
        id: crypto.randomUUID(),
        heading: cleanMd(line.replace(/^#+\s*/, "")),
        items: [],
      };
      continue;
    }

    if (/^[-*•]\s/.test(line)) {
      const item = cleanMd(line.replace(/^[-*•]\s*/, ""));
      if (currentSection) currentSection.items.push(item);
      else if (!data.name) data.name = item;
      continue;
    }

    // Pre-section text after name = contact line(s)
    if (!currentSection) {
      // Split by common contact separators
      const parts = line.split(/\s*[|•·♦]\s*/).map(cleanMd).filter(Boolean);
      data.contact.push(...parts);
    } else {
      currentSection.items.push(cleanMd(line));
    }
  }

  if (currentSection) data.sections.push(currentSection);

  // Ensure at least empty defaults
  if (!data.sections.length) {
    data.sections.push({
      id: crypto.randomUUID(),
      heading: "Professional Summary",
      items: [""],
    });
  }

  return data;
}

export function resumeToMarkdown(data: ResumeData): string {
  const out: string[] = [];
  out.push(`# ${data.name || "Your Name"}`);
  if (data.contact.length) out.push(data.contact.filter(Boolean).join(" | "));
  for (const sec of data.sections) {
    out.push("");
    out.push(`## ${sec.heading}`);
    for (const item of sec.items) {
      if (item.trim()) out.push(`- ${item}`);
    }
  }
  return out.join("\n");
}

/* ───────── Editable primitives ───────── */

interface EditableProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

function Editable({ value, onChange, className = "", multiline = false, placeholder }: EditableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Sync external changes only when not focused (prevents caret jump)
  useEffect(() => {
    if (ref.current && !focused && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value, focused]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false);
        const text = (e.target as HTMLDivElement).innerText.replace(/\n+/g, multiline ? "\n" : " ").trim();
        onChange(text);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLDivElement).blur();
        }
      }}
      data-placeholder={placeholder}
      className={`outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-sm hover:bg-blue-50/50 transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 ${className}`}
    >
      {value}
    </div>
  );
}

/* ───────── Templates (re-styled, editable) ───────── */

interface TemplateProps {
  data: ResumeData;
  update: (next: ResumeData) => void;
  onAiRewrite: (sectionId: string, itemIdx: number) => void;
  rewritingKey: string | null;
}

function SectionItems({ section, sIdx, update, data, onAiRewrite, rewritingKey }: {
  section: ResumeSection;
  sIdx: number;
  data: ResumeData;
  update: (n: ResumeData) => void;
  onAiRewrite: (sectionId: string, itemIdx: number) => void;
  rewritingKey: string | null;
}) {
  const updateItem = (idx: number, v: string) => {
    update({ ...data, sections: data.sections.map(s => s.id === section.id ? { ...s, items: s.items.map((it, j) => j === idx ? v : it) } : s) });
  };
  const removeItem = (idx: number) => {
    update({ ...data, sections: data.sections.map(s => s.id === section.id ? { ...s, items: s.items.filter((_, j) => j !== idx) } : s) });
  };
  const addItem = () => {
    update({ ...data, sections: data.sections.map(s => s.id === section.id ? { ...s, items: [...s.items, ""] } : s) });
  };

  return (
    <div className="space-y-1">
      {section.items.map((item, idx) => {
        const key = `${section.id}-${idx}`;
        const isRewriting = rewritingKey === key;
        return (
          <div key={idx} className="group/item flex items-start gap-1 relative">
            <div className="flex-1">
              <Editable
                value={item}
                onChange={(v) => updateItem(idx, v)}
                placeholder="Click to add..."
                className="text-inherit"
              />
            </div>
            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-0.5 shrink-0 print:hidden">
              <button
                onClick={() => onAiRewrite(section.id, idx)}
                disabled={isRewriting || !item.trim()}
                title="Rewrite with AI"
                className="p-1 rounded hover:bg-purple-100 text-purple-600 disabled:opacity-30"
              >
                {isRewriting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              </button>
              <button
                onClick={() => removeItem(idx)}
                title="Remove"
                className="p-1 rounded hover:bg-red-100 text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
      <button
        onClick={addItem}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 print:hidden"
      >
        <Plus className="h-2.5 w-2.5" /> Add line
      </button>
    </div>
  );
}

function SectionHeader({ section, sIdx, data, update }: {
  section: ResumeSection;
  sIdx: number;
  data: ResumeData;
  update: (n: ResumeData) => void;
}) {
  const realIdx = data.sections.findIndex(s => s.id === section.id);
  const moveUp = () => {
    if (realIdx <= 0) return;
    const next = [...data.sections];
    [next[realIdx - 1], next[realIdx]] = [next[realIdx], next[realIdx - 1]];
    update({ ...data, sections: next });
  };
  const moveDown = () => {
    if (realIdx === -1 || realIdx === data.sections.length - 1) return;
    const next = [...data.sections];
    [next[realIdx + 1], next[realIdx]] = [next[realIdx], next[realIdx + 1]];
    update({ ...data, sections: next });
  };
  const remove = () => {
    update({ ...data, sections: data.sections.filter(s => s.id !== section.id) });
  };
  const updateHeading = (v: string) => {
    update({ ...data, sections: data.sections.map(s => s.id === section.id ? { ...s, heading: v } : s) });
  };

  return (
    <div className="flex items-center gap-1.5 group/sec">
      <Editable value={section.heading} onChange={updateHeading} className="flex-1" placeholder="Section heading" />
      <div className="opacity-0 group-hover/sec:opacity-100 transition-opacity flex gap-0.5 shrink-0 print:hidden">
        <button onClick={moveUp} title="Move up" className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30" disabled={realIdx <= 0}>
          <ArrowUp className="h-3 w-3" />
        </button>
        <button onClick={moveDown} title="Move down" className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30" disabled={realIdx === data.sections.length - 1}>
          <ArrowDown className="h-3 w-3" />
        </button>
        <button onClick={remove} title="Remove section" className="p-1 rounded hover:bg-red-100 text-red-500">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* Generic editable template — accepts theme */

interface ThemeProps {
  accent: string;
  headerBg?: string;
  serif?: boolean;
  font?: string;
  uppercase?: boolean;
  centerHeader?: boolean;
  borderStyle?: "underline" | "fill" | "dot" | "left";
  sidebar?: boolean;
}

function ThemedTemplate({ data, update, onAiRewrite, rewritingKey, theme }: TemplateProps & { theme: ThemeProps }) {
  const updateName = (v: string) => update({ ...data, name: v });
  const updateContact = (v: string) => update({ ...data, contact: v.split(/\s*[|•·]\s*/).map(s => s.trim()).filter(Boolean) });

  const fontClass = theme.serif ? "font-serif" : "font-sans";
  const headerStyle = theme.headerBg ? { backgroundColor: theme.headerBg, color: "white" } : {};

  if (theme.sidebar) {
    return (
      <div className={`bg-white text-gray-900 ${fontClass} text-[12.5px] flex min-h-[600px] group`}>
        <div className="w-[35%] bg-slate-800 text-white px-5 py-7 space-y-4">
          <div>
            <Editable value={data.name} onChange={updateName} className="text-lg font-bold tracking-tight" placeholder="Your Name" />
            <Editable value={data.contact.join(" | ")} onChange={updateContact} className="text-slate-400 text-[10px] mt-2" placeholder="Contact" />
          </div>
          {data.sections.filter((_, i) => i % 3 === 0).map((sec) => {
            const sIdx = data.sections.indexOf(sec);
            return (
              <div key={sec.id}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300 mb-1.5">
                  <SectionHeader section={sec} sIdx={sIdx} data={data} update={update} />
                </h2>
                <SectionItems section={sec} sIdx={sIdx} data={data} update={update} onAiRewrite={onAiRewrite} rewritingKey={rewritingKey} />
              </div>
            );
          })}
        </div>
        <div className="flex-1 px-6 py-7 space-y-5">
          {data.sections.filter((_, i) => i % 3 !== 0).map((sec) => {
            const sIdx = data.sections.indexOf(sec);
            return (
              <div key={sec.id}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1 mb-2">
                  <SectionHeader section={sec} sIdx={sIdx} data={data} update={update} />
                </h2>
                <SectionItems section={sec} sIdx={sIdx} data={data} update={update} onAiRewrite={onAiRewrite} rewritingKey={rewritingKey} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const headingBorder = (() => {
    if (theme.borderStyle === "fill") return { backgroundColor: theme.accent, color: "white", padding: "2px 8px", borderRadius: "2px" };
    if (theme.borderStyle === "left") return { borderLeft: `3px solid ${theme.accent}`, paddingLeft: "8px" };
    return { borderBottom: `1px solid ${theme.accent}30`, paddingBottom: "2px" };
  })();

  return (
    <div className={`bg-white text-gray-900 ${fontClass} text-[12.5px] leading-relaxed group`}>
      <div className={`px-8 ${theme.headerBg ? "py-6" : "pt-8 pb-4"}`} style={headerStyle}>
        <Editable
          value={data.name}
          onChange={updateName}
          className={`text-2xl font-bold tracking-tight ${theme.uppercase ? "uppercase" : ""} ${theme.centerHeader ? "text-center" : ""}`}
          placeholder="Your Name"
        />
        <Editable
          value={data.contact.join(" | ")}
          onChange={updateContact}
          className={`text-xs mt-1.5 ${theme.headerBg ? "text-white/70" : "text-gray-500"} ${theme.centerHeader ? "text-center" : ""}`}
          placeholder="email | phone | location"
        />
        {!theme.headerBg && theme.borderStyle !== "underline" && (
          <div className="mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: theme.accent }} />
        )}
      </div>
      <div className="px-8 py-5 space-y-5">
        {data.sections.map((sec, sIdx) => (
          <div key={sec.id}>
            <h2 className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-2`} style={{ color: theme.accent, ...headingBorder }}>
              <SectionHeader section={sec} sIdx={sIdx} data={data} update={update} />
            </h2>
            <div className="text-gray-700">
              <SectionItems section={sec} sIdx={sIdx} data={data} update={update} onAiRewrite={onAiRewrite} rewritingKey={rewritingKey} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const themes: Record<string, ThemeProps> = {
  modern: { accent: "#0EA5E9", borderStyle: "underline" },
  classic: { accent: "#1F2937", serif: true, centerHeader: true, uppercase: true, borderStyle: "underline" },
  minimal: { accent: "#9CA3AF", borderStyle: "underline" },
  bold: { accent: "#000000", headerBg: "#111827", borderStyle: "underline" },
  executive: { accent: "#374151", serif: true, borderStyle: "underline" },
  creative: { accent: "#7C3AED", borderStyle: "left" },
  compact: { accent: "#1F2937", borderStyle: "fill" },
  tech: { accent: "#10B981", headerBg: "#0F172A", borderStyle: "underline" },
  "pro-elegant": { accent: "#6B7280", serif: true, centerHeader: true, borderStyle: "underline" },
  "pro-gradient": { accent: "#7C3AED", headerBg: "#7C3AED", borderStyle: "underline" },
  "pro-timeline": { accent: "#3B82F6", borderStyle: "left" },
  "pro-sidebar": { accent: "#1E293B", sidebar: true },
  "pro-corporate": { accent: "#1E3A5F", headerBg: "#1E3A5F", borderStyle: "underline" },
  "pro-startup": { accent: "#F97316", borderStyle: "left" },
  "pro-swiss": { accent: "#DC2626", borderStyle: "fill" },
  "pro-magazine": { accent: "#D97706", serif: true, borderStyle: "underline" },
  "pro-metro": { accent: "#2563EB", borderStyle: "fill" },
  "pro-google": { accent: "#4285F4", borderStyle: "underline" },
  "pro-apple": { accent: "#1D1D1F", borderStyle: "underline" },
  "pro-consulting": { accent: "#0F2942", headerBg: "#0F2942", borderStyle: "underline" },
  "pro-banking": { accent: "#1E3A5F", headerBg: "#1E3A5F", serif: true, borderStyle: "underline" },
  "pro-marketing": { accent: "#EC4899", borderStyle: "left" },
  "pro-design": { accent: "#8B5CF6", borderStyle: "left" },
};

/* ───────── Main editor ───────── */

interface ResumeEditorProps {
  initialMarkdown: string;
  inputData: any;
}

export function ResumeEditor({ initialMarkdown, inputData }: ResumeEditorProps) {
  const [data, setData] = useState<ResumeData>(() => parseMarkdownToResume(initialMarkdown));
  const [selected, setSelected] = useState("modern");
  const [rewritingKey, setRewritingKey] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSmartControls, setShowSmartControls] = useState(true);
  const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>({});
  const [density, setDensity] = useState<"compact" | "balanced" | "detailed">("balanced");
  const [focus, setFocus] = useState<"none" | "experience" | "skills" | "leadership">("none");
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "premium";
  const generationIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  // Reparse if AI generates fresh content
  useEffect(() => {
    setData(parseMarkdownToResume(initialMarkdown));
    generationIdRef.current = null;
  }, [initialMarkdown]);

  const selectedTpl = allTemplates.find(t => t.id === selected)!;
  const isLocked = selectedTpl?.pro && !isPro;
  const theme = themes[selected] || themes.modern;

  // Auto-save (debounced 1.5s)
  const autoSave = useCallback(async (latest: ResumeData) => {
    if (!user) return;
    setSavingState("saving");
    const md = resumeToMarkdown(latest);
    try {
      if (generationIdRef.current) {
        await supabase.from("generations").insert({
          user_id: user.id,
          tool_name: "resume-builder",
          input_data: { ...inputData, edited: true } as any,
          output_text: md,
        });
      } else {
        const { data: inserted } = await supabase.from("generations").insert({
          user_id: user.id,
          tool_name: "resume-builder",
          input_data: { ...inputData, edited: true } as any,
          output_text: md,
        }).select("id").single();
        generationIdRef.current = inserted?.id || null;
      }
      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 1500);
    } catch {
      setSavingState("idle");
    }
  }, [user, inputData]);

  const update = useCallback((next: ResumeData) => {
    setData(next);
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => autoSave(next), 2500);
  }, [autoSave]);

  const addSection = () => {
    update({
      ...data,
      sections: [...data.sections, { id: crypto.randomUUID(), heading: "New Section", items: [""] }],
    });
  };

  const onAiRewrite = useCallback(async (sectionId: string, itemIdx: number) => {
    const section = data.sections.find(s => s.id === sectionId);
    if (!section) return;
    const original = section.items[itemIdx];
    if (!original?.trim()) return;
    const key = `${sectionId}-${itemIdx}`;
    setRewritingKey(key);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          systemPrompt: "You are a resume writing expert. Rewrite the bullet point using the XYZ format: 'Accomplished [X] as measured by [Y], by doing [Z]'. Use a strong action verb, include quantifiable metrics (%, $, numbers), and keep it under 25 words. Reply with ONLY the rewritten bullet, no quotes, no preamble.",
          userPrompt: `Section: ${section.heading}\n\nRewrite this bullet point to be more impactful:\n${original}`,
        }),
      });
      if (!resp.ok || !resp.body) {
        toast.error("AI rewrite failed");
        return;
      }
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
      const cleaned = fullText.replace(/^[ "'\-•*\s]+|[ "'\s]+$/g, "").trim();
      if (cleaned) {
        const next = {
          ...data,
          sections: data.sections.map(s => s.id === sectionId
            ? { ...s, items: s.items.map((it, j) => j === itemIdx ? cleaned : it) }
            : s),
        };
        update(next);
        toast.success("Bullet rewritten ✨");
      }
    } catch {
      toast.error("AI rewrite failed");
    } finally {
      setRewritingKey(null);
    }
  }, [data, update]);

  const downloadPDF = async () => {
    if (isLocked) { navigate("/pricing"); return; }
    const el = document.getElementById("resume-editor-preview");
    if (!el) return;
    toast.loading("Generating PDF...", { id: "pdf" });
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`${data.name || "resume"}.pdf`);
      toast.success("PDF downloaded!", { id: "pdf" });
    } catch {
      toast.error("PDF generation failed", { id: "pdf" });
    }
  };

  const manualSave = async () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    await autoSave(data);
    toast.success("Saved to history ✓");
  };

  /* ───────── Smart controls: derived view data ───────── */

  const focusKeywords: Record<typeof focus, string[]> = {
    none: [],
    experience: ["experience", "work", "employment", "professional"],
    skills: ["skill", "tools", "tech", "stack", "competenc"],
    leadership: ["leadership", "management", "leading", "led ", "managed", "directed"],
  };

  const sectionMatchesFocus = (heading: string) => {
    if (focus === "none") return false;
    const h = heading.toLowerCase();
    return focusKeywords[focus].some(k => h.includes(k));
  };

  const displayData = useMemo<ResumeData>(() => {
    let sections = data.sections.filter(s => !hiddenSections[s.id]);

    // Focus mode → push matching sections to top
    if (focus !== "none") {
      const match = sections.filter(s => sectionMatchesFocus(s.heading));
      const rest = sections.filter(s => !sectionMatchesFocus(s.heading));
      sections = [...match, ...rest];
    }

    // Density → trim/expand visible bullets per section
    if (density === "compact") {
      sections = sections.map(s => ({ ...s, items: s.items.slice(0, Math.max(2, Math.ceil(s.items.length * 0.6))) }));
    }
    // "balanced" = unchanged; "detailed" = unchanged (full content shown)

    return { ...data, sections };
  }, [data, hiddenSections, focus, density]);

  const densityClass =
    density === "compact" ? "[&_p]:!my-0 [&_div]:!leading-snug text-[11.5px]"
    : density === "detailed" ? "[&_p]:my-1.5 leading-loose text-[13.5px]"
    : "";

  const focusEmphasisClass = focus !== "none" ? "[&_strong]:text-black [&_strong]:font-bold" : "";

  /* ───────── Export helpers ───────── */

  const buildPlainText = (d: ResumeData) => {
    const out: string[] = [];
    out.push((d.name || "").toUpperCase());
    if (d.contact.length) out.push(d.contact.filter(Boolean).join(" | "));
    out.push("");
    for (const s of d.sections) {
      out.push(s.heading.toUpperCase());
      out.push("-".repeat(Math.min(40, s.heading.length + 4)));
      for (const it of s.items) if (it.trim()) out.push(`• ${it}`);
      out.push("");
    }
    return out.join("\n").trim();
  };

  const copyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText(displayData));
      toast.success("Copied as plain text ✓");
    } catch {
      toast.error("Could not copy");
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([buildPlainText(displayData)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || "resume"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .txt ✓");
  };

  const freeList = allTemplates.filter(t => !t.pro);
  const proList = allTemplates.filter(t => t.pro);

  /* ───────── Smart-controls UI bits ───────── */

  const styleOptions: { id: string; label: string }[] = [
    { id: "minimal", label: "ATS Minimal (default)" },
    { id: "tech", label: "Modern Tech" },
    { id: "executive", label: "Executive Clean" },
    { id: "creative", label: "Creative Edge" },
    { id: "compact", label: "Compact One-Page" },
    { id: "modern", label: "Modern" },
    { id: "classic", label: "Classic" },
    { id: "bold", label: "Bold" },
  ];

  const SegBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick}
      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        active ? "bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.6)]" : "text-muted-foreground hover:text-foreground"
      }`}>
      {children}
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Toolbar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-display font-semibold text-base">✏️ Smart Resume Editor</h2>
          <span className="text-[10px] text-muted-foreground bg-secondary/60 px-2 py-1 rounded-full">
            Click any text to edit
          </span>
          {savingState === "saving" && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving...
            </span>
          )}
          {savingState === "saved" && (
            <span className="text-[10px] text-green-500 flex items-center gap-1">✓ Saved</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowSmartControls(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm text-foreground hover:bg-secondary transition-all">
            <Settings2 className="h-4 w-4" /> Controls
          </button>
          <button onClick={() => setShowTemplates(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm text-foreground hover:bg-secondary transition-all">
            <Eye className="h-4 w-4" /> {showTemplates ? "Hide" : "All"} Templates
          </button>
          <button onClick={addSection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
            <Plus className="h-3.5 w-3.5" /> Section
          </button>
          <button onClick={copyPlainText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm text-foreground hover:bg-secondary transition-all">
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button onClick={downloadTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm text-foreground hover:bg-secondary transition-all">
            <FileText className="h-4 w-4" /> .txt
          </button>
          <button onClick={manualSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm text-foreground hover:bg-secondary transition-all">
            <Save className="h-4 w-4" /> Save
          </button>
          <button onClick={downloadPDF}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isLocked ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30" : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            }`}>
            {isLocked ? <><Lock className="h-4 w-4" /> Upgrade</> : <><Download className="h-4 w-4" /> PDF</>}
          </button>
        </div>
      </div>

      {/* Smart Controls Panel */}
      <AnimatePresence initial={false}>
        {showSmartControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* Style dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Layers className="h-3 w-3" /> Resume Style
                </label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <optgroup label="Curated">
                    {styleOptions.map(o => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Pro Templates">
                    {proList.map(t => (
                      <option key={t.id} value={t.id}>{t.name} {!isPro ? "🔒" : ""}</option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-muted-foreground">Switches instantly. Content preserved.</p>
              </div>

              {/* Density */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Resume Length
                </label>
                <div className="flex gap-1 bg-secondary/40 p-1 rounded-lg border border-border/50">
                  <SegBtn active={density === "compact"} onClick={() => setDensity("compact")}>Compact</SegBtn>
                  <SegBtn active={density === "balanced"} onClick={() => setDensity("balanced")}>Balanced</SegBtn>
                  <SegBtn active={density === "detailed"} onClick={() => setDensity("detailed")}>Detailed</SegBtn>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {density === "compact" ? "Tighter spacing, fewer bullets" : density === "detailed" ? "Expanded spacing, all bullets" : "Default balanced layout"}
                </p>
              </div>

              {/* Focus */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Target className="h-3 w-3" /> Focus Area
                </label>
                <div className="flex gap-1 bg-secondary/40 p-1 rounded-lg border border-border/50 flex-wrap">
                  <SegBtn active={focus === "none"} onClick={() => setFocus("none")}>None</SegBtn>
                  <SegBtn active={focus === "experience"} onClick={() => setFocus("experience")}>Experience</SegBtn>
                  <SegBtn active={focus === "skills"} onClick={() => setFocus("skills")}>Skills</SegBtn>
                  <SegBtn active={focus === "leadership"} onClick={() => setFocus("leadership")}>Leadership</SegBtn>
                </div>
                <p className="text-[10px] text-muted-foreground">Reorders sections + bolds key metrics.</p>
              </div>

              {/* Section toggles */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Sections
                </label>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {data.sections.map(sec => {
                    const visible = !hiddenSections[sec.id];
                    return (
                      <label key={sec.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-secondary/40 hover:bg-secondary/60 transition-colors cursor-pointer">
                        <span className="text-xs text-foreground truncate flex-1">{sec.heading || "Untitled"}</span>
                        <button
                          type="button"
                          onClick={() => setHiddenSections(h => ({ ...h, [sec.id]: visible }))}
                          aria-label={`Toggle ${sec.heading}`}
                          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                            visible ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${visible ? "translate-x-3.5" : "translate-x-0.5"}`} />
                        </button>
                      </label>
                    );
                  })}
                  {!data.sections.length && (
                    <p className="text-[10px] text-muted-foreground italic">No sections yet</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates (full grid — kept) */}
      {showTemplates && (
        <div className="glass-card p-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Free Templates</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {freeList.map(t => (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className={`p-2 rounded-lg text-center text-xs border transition-all ${
                    selected === t.id ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border/50 hover:border-primary/50 text-foreground"
                  }`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pro Templates</p>
              {!isPro && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-semibold flex items-center gap-1">
                  <Crown className="h-2.5 w-2.5" /> Pro
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {proList.map(t => (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className={`p-2 rounded-lg text-center text-xs border transition-all relative ${
                    selected === t.id ? "border-amber-500 bg-amber-500/10 text-amber-500 font-semibold" : "border-border/50 hover:border-amber-500/50 text-foreground"
                  } ${!isPro ? "opacity-75" : ""}`}>
                  {!isPro && <Lock className="absolute top-1 right-1 h-2.5 w-2.5 text-amber-500" />}
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview — paper-style container */}
      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-30 bg-background/85 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3 p-6">
            <Lock className="h-10 w-10 text-amber-500" />
            <p className="text-base font-semibold text-foreground">Pro Template</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">Upgrade to Pro to use this premium template and download as PDF.</p>
            <button onClick={() => navigate("/pricing")}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
              View Pricing
            </button>
          </div>
        )}
        <motion.div
          key={`${selected}-${density}-${focus}`}
          initial={{ opacity: 0.4, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          id="resume-editor-preview"
          className={`border border-border/30 rounded-lg overflow-hidden bg-white transition-all duration-300 ${densityClass} ${focusEmphasisClass}`}
          style={{ boxShadow: "0 0 0 1px hsl(var(--primary) / 0.15), 0 25px 50px -15px rgba(0,0,0,0.6), 0 0 60px -20px hsl(var(--primary) / 0.25)" }}
        >
          <ThemedTemplate data={displayData} update={update} onAiRewrite={onAiRewrite} rewritingKey={rewritingKey} theme={theme} />
        </motion.div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          💡 Hover any line for AI rewrite or delete. Use Controls above to toggle sections, change density, or set focus.
        </p>
      </div>
    </motion.div>
  );
}
