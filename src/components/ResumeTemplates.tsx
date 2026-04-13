import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Lock, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ResumeTemplatesProps {
  content: string;
}

interface TemplateInfo {
  id: string;
  name: string;
  tag: string;
  desc: string;
  pro: boolean;
}

const allTemplates: TemplateInfo[] = [
  // FREE (8)
  { id: "modern", name: "Modern", tag: "Popular", desc: "Clean layout with teal accents & clear hierarchy", pro: false },
  { id: "classic", name: "Classic", tag: "Professional", desc: "Traditional serif elegance for any industry", pro: false },
  { id: "minimal", name: "Minimal", tag: "Clean", desc: "Ultra-clean whitespace-first design", pro: false },
  { id: "bold", name: "Bold", tag: "Standout", desc: "Dark header with high-contrast sections", pro: false },
  { id: "executive", name: "Executive", tag: "Senior", desc: "Refined layout for leadership roles", pro: false },
  { id: "creative", name: "Creative", tag: "Design", desc: "Vibrant purple accents with dot markers", pro: false },
  { id: "compact", name: "Compact", tag: "Dense", desc: "Maximum content in minimal space", pro: false },
  { id: "tech", name: "Tech", tag: "Developer", desc: "Monospace-inspired for engineers", pro: false },
  // PRO (32)
  { id: "pro-elegant", name: "Elegant", tag: "Pro", desc: "Sophisticated italic serif headings", pro: true },
  { id: "pro-gradient", name: "Gradient", tag: "Pro", desc: "Stunning purple gradient header", pro: true },
  { id: "pro-timeline", name: "Timeline", tag: "Pro", desc: "Visual timeline with connected dots", pro: true },
  { id: "pro-sidebar", name: "Sidebar", tag: "Pro", desc: "Two-tone sidebar with dark panel", pro: true },
  { id: "pro-corporate", name: "Corporate", tag: "Pro", desc: "Enterprise navy header layout", pro: true },
  { id: "pro-academic", name: "Academic", tag: "Pro", desc: "Optimized for academic CVs", pro: true },
  { id: "pro-startup", name: "Startup", tag: "Pro", desc: "Energetic orange-accent design", pro: true },
  { id: "pro-swiss", name: "Swiss", tag: "Pro", desc: "Grid-based International style", pro: true },
  { id: "pro-magazine", name: "Magazine", tag: "Pro", desc: "Editorial two-column layout", pro: true },
  { id: "pro-infographic", name: "Infographic", tag: "Pro", desc: "Visual data-driven resume", pro: true },
  { id: "pro-metro", name: "Metro", tag: "Pro", desc: "Modern tile-inspired layout", pro: true },
  { id: "pro-nordic", name: "Nordic", tag: "Pro", desc: "Scandinavian clean aesthetic", pro: true },
  { id: "pro-retro", name: "Retro", tag: "Pro", desc: "Vintage typewriter aesthetic", pro: true },
  { id: "pro-latex", name: "LaTeX", tag: "Pro", desc: "Academic LaTeX-style formatting", pro: true },
  { id: "pro-google", name: "Google", tag: "Pro", desc: "Material Design inspired", pro: true },
  { id: "pro-apple", name: "Apple", tag: "Pro", desc: "Minimalist Apple-inspired layout", pro: true },
  { id: "pro-consulting", name: "Consulting", tag: "Pro", desc: "McKinsey/BCG consulting style", pro: true },
  { id: "pro-banking", name: "Banking", tag: "Pro", desc: "Wall Street finance format", pro: true },
  { id: "pro-healthcare", name: "Healthcare", tag: "Pro", desc: "Medical professional layout", pro: true },
  { id: "pro-legal", name: "Legal", tag: "Pro", desc: "Attorney/law firm format", pro: true },
  { id: "pro-teaching", name: "Teaching", tag: "Pro", desc: "Educator-focused template", pro: true },
  { id: "pro-engineer", name: "Engineer", tag: "Pro", desc: "Technical engineering layout", pro: true },
  { id: "pro-sales", name: "Sales", tag: "Pro", desc: "Results-driven sales format", pro: true },
  { id: "pro-marketing", name: "Marketing", tag: "Pro", desc: "Creative marketing layout", pro: true },
  { id: "pro-data", name: "Data Science", tag: "Pro", desc: "Analytics-focused template", pro: true },
  { id: "pro-design", name: "Designer", tag: "Pro", desc: "Portfolio-style for designers", pro: true },
  { id: "pro-nonprofit", name: "Nonprofit", tag: "Pro", desc: "Mission-driven resume style", pro: true },
  { id: "pro-government", name: "Government", tag: "Pro", desc: "Federal/USAJOBS format", pro: true },
  { id: "pro-freshgrad", name: "Fresh Grad", tag: "Pro", desc: "Entry-level education focus", pro: true },
  { id: "pro-career-change", name: "Career Change", tag: "Pro", desc: "Skills-first for transitions", pro: true },
  { id: "pro-freelance", name: "Freelance", tag: "Pro", desc: "Project-based portfolio style", pro: true },
  { id: "pro-international", name: "International", tag: "Pro", desc: "CV format for global jobs", pro: true },
];

/* ── helpers ── */

interface Section {
  heading: string;
  items: string[];
  subItems?: { title: string; meta: string; bullets: string[] }[];
}

function parseResume(md: string): Section[] {
  const sections: Section[] = [];
  let curH = "";
  let curItems: string[] = [];

  for (const line of md.split("\n")) {
    const t = line.trim();
    if (/^#{1,3}\s/.test(t)) {
      if (curH || curItems.length) sections.push({ heading: curH, items: [...curItems] });
      curH = t.replace(/^#+\s*/, "");
      curItems = [];
    } else if (/^[-*•]\s/.test(t)) {
      curItems.push(t.replace(/^[-*•]\s*/, ""));
    } else if (t && !t.startsWith("---")) {
      curItems.push(t);
    }
  }
  if (curH || curItems.length) sections.push({ heading: curH, items: curItems });
  return sections;
}

const clean = (t: string) => t.replace(/\*\*(.*?)\*\*/g, "$1");
const getName = (sections: Section[]) => sections[0]?.heading || "";
const getContact = (sections: Section[]) => sections[0]?.items || [];
const getBody = (sections: Section[]) => sections.slice(1);

/* ═══════════════════════════════════════════════
   FREE TEMPLATES — 8 unique, polished designs
   ═══════════════════════════════════════════════ */

function ModernTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 font-sans text-[13px] leading-relaxed">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b-[3px]" style={{ borderColor: "#0EA5E9" }}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{getName(s)}</h1>
        <p className="text-xs text-gray-500 mt-1">{getContact(s).map(clean).join("  •  ")}</p>
      </div>
      <div className="px-8 py-6 space-y-5">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "#0EA5E9" }}>{sec.heading}</h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-700 mb-1 pl-3 relative before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-sky-400">
                {clean(item)}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassicTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 p-8 font-serif text-[13px] leading-relaxed">
      <div className="text-center mb-5 pb-3 border-b-2 border-gray-800">
        <h1 className="text-2xl font-bold uppercase tracking-[0.08em]">{getName(s)}</h1>
        <p className="text-xs text-gray-600 mt-1.5 tracking-wide">{getContact(s).map(clean).join("  |  ")}</p>
      </div>
      {getBody(s).map((sec, i) => (
        <div key={i} className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-800 border-b border-gray-300 pb-1 mb-2">{sec.heading}</h2>
          {sec.items.map((item, j) => (
            <p key={j} className="text-gray-700 mb-1 indent-4">{clean(item)}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

function MinimalTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 px-12 py-10 font-sans text-[13px] leading-loose">
      <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-1">{getName(s)}</h1>
      <p className="text-xs text-gray-400 mb-8 tracking-wide">{getContact(s).map(clean).join("  ·  ")}</p>
      {getBody(s).map((sec, i) => (
        <div key={i} className="mb-7">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">{sec.heading}</h2>
          <div className="border-l-2 border-gray-200 pl-4">
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-600 mb-1">{clean(item)}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BoldTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 font-sans text-[13px]">
      <div className="bg-gray-900 px-8 py-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{getName(s)}</h1>
        <p className="text-gray-400 text-xs mt-1.5">{getContact(s).map(clean).join("  |  ")}</p>
      </div>
      <div className="px-8 py-6 space-y-5">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 pb-1.5 mb-2 border-b-2 border-gray-900">{sec.heading}</h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-700 mb-1 pl-3 relative before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-gray-900">
                {clean(item)}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 font-serif text-[13px] leading-relaxed">
      <div className="px-10 pt-10 pb-5 border-b border-gray-300">
        <h1 className="text-2xl font-bold tracking-wide text-gray-800">{getName(s)}</h1>
        <p className="text-xs text-gray-500 mt-1 tracking-wide">{getContact(s).map(clean).join("  •  ")}</p>
      </div>
      <div className="px-10 py-6 space-y-5">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <h2 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-1 mb-2.5 tracking-wide">{sec.heading}</h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-600 mb-1.5">{clean(item)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CreativeTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 font-sans text-[13px]">
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-purple-700">{getName(s)}</h1>
        <p className="text-xs text-gray-500 mt-1">{getContact(s).map(clean).join("  •  ")}</p>
        <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-400" />
      </div>
      <div className="px-8 py-5 space-y-5">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-purple-700">{sec.heading}</h2>
            </div>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-700 mb-1 pl-4">{clean(item)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompactTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 px-6 py-5 font-sans text-[11px] leading-snug">
      <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-gray-300">
        <h1 className="text-lg font-bold">{getName(s)}</h1>
        <p className="text-[10px] text-gray-500">{getContact(s).map(clean).join(" | ")}</p>
      </div>
      <div className="space-y-2.5">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-800 bg-gray-100 px-2 py-0.5 rounded mb-1">{sec.heading}</h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-600 mb-0.5">{clean(item)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TechTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-[#FAFAFA] text-gray-900 font-sans text-[13px]">
      <div className="px-8 pt-7 pb-4 bg-[#1E293B] text-white">
        <h1 className="text-xl font-bold font-mono tracking-tight">{getName(s)}</h1>
        <p className="text-gray-400 text-xs mt-1 font-mono">{getContact(s).map(clean).join("  //  ")}</p>
      </div>
      <div className="px-8 py-6 space-y-5">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <h2 className="text-xs font-bold font-mono text-emerald-700 mb-2">
              <span className="text-gray-400">$</span> {sec.heading}
            </h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-700 mb-1 pl-4 relative before:absolute before:left-0 before:top-[6px] before:text-emerald-500 before:content-['→'] before:text-[10px]">
                {clean(item)}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRO TEMPLATES — 4 unique + 28 accent-varied
   ═══════════════════════════════════════════════ */

function ProElegantTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 px-10 py-10 font-serif text-[13px] leading-relaxed">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-normal italic text-gray-700 tracking-wide">{getName(s)}</h1>
        <div className="mt-2 mx-auto w-16 h-px bg-gray-400" />
        <p className="text-xs text-gray-500 mt-2 tracking-widest">{getContact(s).map(clean).join("  ♦  ")}</p>
      </div>
      {getBody(s).map((sec, i) => (
        <div key={i} className="mb-5">
          <h2 className="text-sm font-normal italic text-gray-600 border-b border-gray-200 pb-1.5 mb-2.5">{sec.heading}</h2>
          {sec.items.map((item, j) => (
            <p key={j} className="text-gray-600 mb-1">{clean(item)}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProGradientTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 font-sans text-[13px]">
      <div className="px-8 py-6" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <h1 className="text-2xl font-bold text-white">{getName(s)}</h1>
        <p className="text-white/70 text-xs mt-1.5">{getContact(s).map(clean).join("  •  ")}</p>
      </div>
      <div className="px-8 py-6 space-y-5">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-purple-700 border-b border-purple-200 pb-1 mb-2">{sec.heading}</h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-700 mb-1">{clean(item)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProTimelineTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 font-sans text-[13px]">
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-blue-600">{getName(s)}</h1>
        <p className="text-xs text-gray-500 mt-1">{getContact(s).map(clean).join("  |  ")}</p>
      </div>
      <div className="px-8 pb-8 space-y-0">
        {getBody(s).map((sec, i, arr) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
              {i < arr.length - 1 && <div className="w-0.5 flex-1 bg-blue-200 mt-0.5" />}
            </div>
            <div className="flex-1 pb-5">
              <h2 className="text-xs font-bold text-gray-800 mb-1">{sec.heading}</h2>
              {sec.items.map((item, j) => (
                <p key={j} className="text-gray-600 mb-0.5 text-xs">{clean(item)}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProSidebarTemplate({ content }: { content: string }) {
  const s = parseResume(content);
  const body = getBody(s);
  const sidebar = body.filter((_, i) => i % 3 === 0);
  const main = body.filter((_, i) => i % 3 !== 0);
  return (
    <div className="bg-white text-gray-900 font-sans text-[13px] flex min-h-[500px]">
      <div className="w-[35%] bg-slate-800 text-white px-5 py-7 space-y-5">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{getName(s)}</h1>
          <div className="mt-2 space-y-0.5">
            {getContact(s).map((c, i) => (
              <p key={i} className="text-slate-400 text-[10px]">{clean(c)}</p>
            ))}
          </div>
        </div>
        {sidebar.map((sec, i) => (
          <div key={i}>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1.5">{sec.heading}</h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-slate-300 mb-0.5 text-xs">{clean(item)}</p>
            ))}
          </div>
        ))}
      </div>
      <div className="flex-1 px-6 py-7 space-y-5">
        {main.map((sec, i) => (
          <div key={i}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1 mb-2">{sec.heading}</h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-600 mb-1">{clean(item)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Generic Pro with accent + optional header bg */
function GenericProTemplate({ content, accentColor, headerBg }: { content: string; accentColor: string; headerBg?: string }) {
  const s = parseResume(content);
  return (
    <div className="bg-white text-gray-900 font-sans text-[13px]">
      {headerBg ? (
        <div className="px-8 py-6" style={{ backgroundColor: headerBg }}>
          <h1 className="text-xl font-bold text-white">{getName(s)}</h1>
          <p className="text-white/70 text-xs mt-1">{getContact(s).map(clean).join("  •  ")}</p>
        </div>
      ) : (
        <div className="px-8 pt-8 pb-3">
          <h1 className="text-xl font-bold" style={{ color: accentColor }}>{getName(s)}</h1>
          <p className="text-gray-500 text-xs mt-1">{getContact(s).map(clean).join("  •  ")}</p>
          <div className="mt-2 h-0.5 w-12 rounded-full" style={{ backgroundColor: accentColor }} />
        </div>
      )}
      <div className="px-8 py-5 space-y-4">
        {getBody(s).map((sec, i) => (
          <div key={i}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] pb-1 mb-2 border-b" style={{ color: accentColor, borderColor: accentColor + "30" }}>
              {sec.heading}
            </h2>
            {sec.items.map((item, j) => (
              <p key={j} className="text-gray-700 mb-1">{clean(item)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Template registry ── */

const freeComponents: Record<string, React.FC<{ content: string }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  bold: BoldTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  compact: CompactTemplate,
  tech: TechTemplate,
};

const specialPro: Record<string, React.FC<{ content: string }>> = {
  "pro-elegant": ProElegantTemplate,
  "pro-gradient": ProGradientTemplate,
  "pro-timeline": ProTimelineTemplate,
  "pro-sidebar": ProSidebarTemplate,
};

const proStyles: Record<string, { accent: string; headerBg?: string }> = {
  "pro-corporate": { accent: "#1E3A5F", headerBg: "#1E3A5F" },
  "pro-academic": { accent: "#7C3AED" },
  "pro-startup": { accent: "#F97316" },
  "pro-swiss": { accent: "#DC2626" },
  "pro-magazine": { accent: "#D97706" },
  "pro-infographic": { accent: "#0D9488" },
  "pro-metro": { accent: "#2563EB" },
  "pro-nordic": { accent: "#6B7280" },
  "pro-retro": { accent: "#92400E" },
  "pro-latex": { accent: "#1F2937" },
  "pro-google": { accent: "#4285F4" },
  "pro-apple": { accent: "#1D1D1F" },
  "pro-consulting": { accent: "#1E3A5F", headerBg: "#0F2942" },
  "pro-banking": { accent: "#1E3A5F", headerBg: "#1E3A5F" },
  "pro-healthcare": { accent: "#059669", headerBg: "#059669" },
  "pro-legal": { accent: "#4A5568", headerBg: "#1A202C" },
  "pro-teaching": { accent: "#7C3AED" },
  "pro-engineer": { accent: "#374151" },
  "pro-sales": { accent: "#DC2626" },
  "pro-marketing": { accent: "#EC4899" },
  "pro-data": { accent: "#0891B2" },
  "pro-design": { accent: "#8B5CF6" },
  "pro-nonprofit": { accent: "#059669" },
  "pro-government": { accent: "#1E3A5F", headerBg: "#1E3A5F" },
  "pro-freshgrad": { accent: "#3B82F6" },
  "pro-career-change": { accent: "#D97706" },
  "pro-freelance": { accent: "#8B5CF6" },
  "pro-international": { accent: "#1E3A5F" },
};

function getComponent(id: string): React.FC<{ content: string }> {
  if (freeComponents[id]) return freeComponents[id];
  if (specialPro[id]) return specialPro[id];
  const style = proStyles[id] || { accent: "#3B82F6" };
  return ({ content }) => <GenericProTemplate content={content} accentColor={style.accent} headerBg={style.headerBg} />;
}

/* ── Main Export ── */

export function ResumeTemplates({ content }: ResumeTemplatesProps) {
  const [selected, setSelected] = useState("modern");
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "premium";

  const selectedTpl = allTemplates.find(t => t.id === selected)!;
  const isLocked = selectedTpl?.pro && !isPro;
  const Comp = getComponent(selected);

  const freeList = allTemplates.filter(t => !t.pro);
  const proList = allTemplates.filter(t => t.pro);

  const downloadPDF = async () => {
    if (isLocked) { navigate("/pricing"); return; }
    const el = document.getElementById("resume-template-preview");
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save("resume.pdf");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-base">📄 Resume Templates</h2>
        <button onClick={downloadPDF}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isLocked ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-primary text-primary-foreground hover:opacity-90"
          }`}>
          {isLocked ? <><Lock className="h-4 w-4" /> Upgrade to Download</> : <><Download className="h-4 w-4" /> Download PDF</>}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Choose a template, preview your resume, then download as PDF.</p>

      {/* Free */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Free Templates ({freeList.length})</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {freeList.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`p-3 rounded-lg text-left border transition-all ${
                selected === t.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
              }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold">{t.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t.tag}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pro */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pro Templates ({proList.length})</p>
          {!isPro && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold flex items-center gap-1">
              <Crown className="h-2.5 w-2.5" /> Pro Plan
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {proList.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`p-3 rounded-lg text-left border transition-all relative ${
                selected === t.id ? "border-amber-500 bg-amber-500/5" : "border-border/50 hover:border-amber-500/50"
              } ${!isPro ? "opacity-75" : ""}`}>
              {!isPro && <Lock className="absolute top-2 right-2 h-3 w-3 text-amber-500" />}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold">{t.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">{t.tag}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3">
            <Lock className="h-8 w-8 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Pro Template</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">Upgrade to Pro to unlock {proList.length} premium templates and download as PDF.</p>
            <button onClick={() => navigate("/pricing")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
              View Pricing
            </button>
          </div>
        )}
        <div id="resume-template-preview" className="border border-border/50 rounded-lg overflow-hidden shadow-lg max-h-[600px] overflow-y-auto">
          <Comp content={content} />
        </div>
      </div>
    </motion.div>
  );
}
