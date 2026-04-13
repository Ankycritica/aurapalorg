import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Lock, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ResumeTemplatesProps {
  content: string;
}

type TemplateName = string;

interface TemplateInfo {
  id: TemplateName;
  name: string;
  tag: string;
  desc: string;
  pro: boolean;
}

const allTemplates: TemplateInfo[] = [
  // FREE TEMPLATES (8)
  { id: "modern", name: "Modern", tag: "Popular", desc: "Clean single column with cyan accents", pro: false },
  { id: "classic", name: "Classic", tag: "Professional", desc: "Traditional two-column layout", pro: false },
  { id: "minimal", name: "Minimal", tag: "Clean", desc: "Ultra-clean with generous whitespace", pro: false },
  { id: "bold", name: "Bold", tag: "Standout", desc: "Strong headings with dark sidebar", pro: false },
  { id: "executive", name: "Executive", tag: "Senior", desc: "Refined layout for leadership roles", pro: false },
  { id: "creative", name: "Creative", tag: "Design", desc: "Colorful accents with modern typography", pro: false },
  { id: "compact", name: "Compact", tag: "Dense", desc: "Fits more content in less space", pro: false },
  { id: "tech", name: "Tech", tag: "Developer", desc: "Code-inspired with monospace accents", pro: false },
  // PRO TEMPLATES (32)
  { id: "pro-elegant", name: "Elegant", tag: "Pro", desc: "Sophisticated serif typography", pro: true },
  { id: "pro-gradient", name: "Gradient", tag: "Pro", desc: "Subtle gradient header bar", pro: true },
  { id: "pro-timeline", name: "Timeline", tag: "Pro", desc: "Visual timeline for experience", pro: true },
  { id: "pro-sidebar", name: "Sidebar", tag: "Pro", desc: "Left sidebar with contact & skills", pro: true },
  { id: "pro-corporate", name: "Corporate", tag: "Pro", desc: "Enterprise-ready clean layout", pro: true },
  { id: "pro-academic", name: "Academic", tag: "Pro", desc: "Optimized for academic CVs", pro: true },
  { id: "pro-startup", name: "Startup", tag: "Pro", desc: "Energetic modern design", pro: true },
  { id: "pro-swiss", name: "Swiss", tag: "Pro", desc: "Grid-based Swiss design", pro: true },
  { id: "pro-magazine", name: "Magazine", tag: "Pro", desc: "Editorial magazine-style layout", pro: true },
  { id: "pro-infographic", name: "Infographic", tag: "Pro", desc: "Visual data-driven resume", pro: true },
  { id: "pro-metro", name: "Metro", tag: "Pro", desc: "Windows Metro-inspired tiles", pro: true },
  { id: "pro-nordic", name: "Nordic", tag: "Pro", desc: "Scandinavian clean aesthetic", pro: true },
  { id: "pro-retro", name: "Retro", tag: "Pro", desc: "Vintage typewriter feel", pro: true },
  { id: "pro-latex", name: "LaTeX", tag: "Pro", desc: "Academic LaTeX-style formatting", pro: true },
  { id: "pro-google", name: "Google", tag: "Pro", desc: "Material Design inspired", pro: true },
  { id: "pro-apple", name: "Apple", tag: "Pro", desc: "Minimalist Apple-inspired layout", pro: true },
  { id: "pro-consulting", name: "Consulting", tag: "Pro", desc: "McKinsey/BCG style resume", pro: true },
  { id: "pro-banking", name: "Banking", tag: "Pro", desc: "Wall Street finance format", pro: true },
  { id: "pro-healthcare", name: "Healthcare", tag: "Pro", desc: "Medical professional layout", pro: true },
  { id: "pro-legal", name: "Legal", tag: "Pro", desc: "Attorney/law firm style", pro: true },
  { id: "pro-teaching", name: "Teaching", tag: "Pro", desc: "Educator-focused template", pro: true },
  { id: "pro-engineer", name: "Engineer", tag: "Pro", desc: "Technical engineering layout", pro: true },
  { id: "pro-sales", name: "Sales", tag: "Pro", desc: "Results-driven sales format", pro: true },
  { id: "pro-marketing", name: "Marketing", tag: "Pro", desc: "Creative marketing layout", pro: true },
  { id: "pro-data", name: "Data Science", tag: "Pro", desc: "Analytics-focused template", pro: true },
  { id: "pro-design", name: "Designer", tag: "Pro", desc: "Portfolio-style for designers", pro: true },
  { id: "pro-nonprofit", name: "Nonprofit", tag: "Pro", desc: "Mission-driven resume style", pro: true },
  { id: "pro-government", name: "Government", tag: "Pro", desc: "Federal/USAJOBS format", pro: true },
  { id: "pro-freshgrad", name: "Fresh Grad", tag: "Pro", desc: "Entry-level with education focus", pro: true },
  { id: "pro-career-change", name: "Career Change", tag: "Pro", desc: "Skills-first for transitions", pro: true },
  { id: "pro-freelance", name: "Freelance", tag: "Pro", desc: "Project-based portfolio style", pro: true },
  { id: "pro-international", name: "International", tag: "Pro", desc: "CV format for global jobs", pro: true },
];

function parseResumeContent(md: string) {
  const sections: { heading: string; items: string[] }[] = [];
  let currentHeading = "";
  let currentItems: string[] = [];

  for (const line of md.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ") || trimmed.startsWith("### ") || trimmed.startsWith("# ")) {
      if (currentHeading || currentItems.length) {
        sections.push({ heading: currentHeading, items: [...currentItems] });
        currentItems = [];
      }
      currentHeading = trimmed.replace(/^#+\s*/, "");
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      currentItems.push(trimmed.replace(/^[-*•]\s*/, ""));
    } else if (trimmed && !trimmed.startsWith("---")) {
      currentItems.push(trimmed);
    }
  }
  if (currentHeading || currentItems.length) {
    sections.push({ heading: currentHeading, items: currentItems });
  }
  return sections;
}

const cleanBold = (t: string) => t.replace(/\*\*(.*?)\*\*/g, "$1");

// ─── FREE TEMPLATES ───

function ModernTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-white text-gray-900 p-8 font-sans text-sm leading-relaxed">
      {sections.map((s, i) => (
        <div key={i} className="mb-4">
          {s.heading && (
            <h3 className="text-base font-bold uppercase tracking-wide border-b-2 pb-1 mb-2" style={{ borderColor: "#00C4EE", color: "#00C4EE" }}>
              {s.heading}
            </h3>
          )}
          {s.items.map((item, j) => (
            <p key={j} className="text-gray-700 mb-1">{cleanBold(item)}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

function ClassicTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  const leftSections = sections.filter((_, i) => i % 2 === 0);
  const rightSections = sections.filter((_, i) => i % 2 !== 0);
  return (
    <div className="bg-white text-gray-900 p-8 font-serif text-sm leading-relaxed">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {leftSections.map((s, i) => (
            <div key={i}>
              {s.heading && <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2 text-gray-800">{s.heading}</h3>}
              {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1">{cleanBold(item)}</p>)}
            </div>
          ))}
        </div>
        <div className="space-y-4 border-l border-gray-200 pl-4">
          {rightSections.map((s, i) => (
            <div key={i}>
              {s.heading && <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2 text-gray-800">{s.heading}</h3>}
              {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1 text-xs">{cleanBold(item)}</p>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MinimalTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-white text-gray-900 p-10 font-sans text-sm leading-loose">
      {sections.map((s, i) => (
        <div key={i} className="mb-6">
          {s.heading && <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">{s.heading}</h3>}
          {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1">{cleanBold(item)}</p>)}
        </div>
      ))}
    </div>
  );
}

function BoldTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  const nameSection = sections[0];
  const rest = sections.slice(1);
  return (
    <div className="bg-white text-gray-900 font-sans text-sm">
      <div className="bg-gray-900 text-white p-6">
        {nameSection && (
          <>
            {nameSection.heading && <h2 className="text-2xl font-extrabold tracking-tight">{nameSection.heading}</h2>}
            {nameSection.items.map((item, j) => <p key={j} className="text-gray-300 text-xs mt-1">{cleanBold(item)}</p>)}
          </>
        )}
      </div>
      <div className="p-8 space-y-5">
        {rest.map((s, i) => (
          <div key={i}>
            {s.heading && <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-1 mb-2">{s.heading}</h3>}
            {s.items.map((item, j) => <p key={j} className="text-gray-700 mb-1">{cleanBold(item)}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-white text-gray-900 p-10 font-serif text-sm leading-relaxed">
      {sections.map((s, i) => (
        <div key={i} className="mb-5">
          {s.heading && (
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-300 pb-1.5 mb-3 tracking-wide">{s.heading}</h3>
          )}
          {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1.5 leading-relaxed">{cleanBold(item)}</p>)}
        </div>
      ))}
    </div>
  );
}

function CreativeTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-white text-gray-900 p-8 font-sans text-sm">
      {sections.map((s, i) => (
        <div key={i} className="mb-5">
          {s.heading && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700">{s.heading}</h3>
            </div>
          )}
          {s.items.map((item, j) => <p key={j} className="text-gray-700 mb-1 pl-4">{cleanBold(item)}</p>)}
        </div>
      ))}
    </div>
  );
}

function CompactTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-white text-gray-900 p-6 font-sans text-xs leading-snug">
      {sections.map((s, i) => (
        <div key={i} className="mb-3">
          {s.heading && <h3 className="text-xs font-bold uppercase tracking-wide text-gray-800 border-b border-gray-200 pb-0.5 mb-1">{s.heading}</h3>}
          {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-0.5">{cleanBold(item)}</p>)}
        </div>
      ))}
    </div>
  );
}

function TechTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-gray-50 text-gray-900 p-8 font-sans text-sm">
      {sections.map((s, i) => (
        <div key={i} className="mb-5">
          {s.heading && (
            <h3 className="text-sm font-bold text-green-700 mb-2 font-mono">
              {">"} {s.heading}
            </h3>
          )}
          {s.items.map((item, j) => <p key={j} className="text-gray-700 mb-1 pl-4">{cleanBold(item)}</p>)}
        </div>
      ))}
    </div>
  );
}

// ─── PRO TEMPLATES (showing a few unique ones, rest use variations) ───

function ProElegantTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-white text-gray-900 p-10 font-serif text-sm leading-relaxed">
      {sections.map((s, i) => (
        <div key={i} className="mb-5">
          {s.heading && <h3 className="text-base font-normal italic text-gray-700 border-b border-gray-200 pb-2 mb-3">{s.heading}</h3>}
          {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1">{cleanBold(item)}</p>)}
        </div>
      ))}
    </div>
  );
}

function ProGradientTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  const nameSection = sections[0];
  const rest = sections.slice(1);
  return (
    <div className="bg-white text-gray-900 font-sans text-sm">
      <div className="p-6" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        {nameSection && (
          <>
            {nameSection.heading && <h2 className="text-2xl font-bold text-white">{nameSection.heading}</h2>}
            {nameSection.items.map((item, j) => <p key={j} className="text-white/80 text-xs mt-1">{cleanBold(item)}</p>)}
          </>
        )}
      </div>
      <div className="p-8 space-y-5">
        {rest.map((s, i) => (
          <div key={i}>
            {s.heading && <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 border-b border-purple-200 pb-1 mb-2">{s.heading}</h3>}
            {s.items.map((item, j) => <p key={j} className="text-gray-700 mb-1">{cleanBold(item)}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProTimelineTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  return (
    <div className="bg-white text-gray-900 p-8 font-sans text-sm">
      {sections.map((s, i) => (
        <div key={i} className="mb-5 flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
            {i < sections.length - 1 && <div className="w-0.5 flex-1 bg-blue-200 mt-1" />}
          </div>
          <div className="flex-1">
            {s.heading && <h3 className="text-sm font-bold text-gray-800 mb-1">{s.heading}</h3>}
            {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1 text-xs">{cleanBold(item)}</p>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProSidebarTemplate({ content }: { content: string }) {
  const sections = parseResumeContent(content);
  const sidebar = sections.filter((_, i) => i % 3 === 0);
  const main = sections.filter((_, i) => i % 3 !== 0);
  return (
    <div className="bg-white text-gray-900 font-sans text-sm flex">
      <div className="w-1/3 bg-slate-800 text-white p-6 space-y-4">
        {sidebar.map((s, i) => (
          <div key={i}>
            {s.heading && <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">{s.heading}</h3>}
            {s.items.map((item, j) => <p key={j} className="text-slate-400 mb-1 text-xs">{cleanBold(item)}</p>)}
          </div>
        ))}
      </div>
      <div className="flex-1 p-6 space-y-4">
        {main.map((s, i) => (
          <div key={i}>
            {s.heading && <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1 mb-2">{s.heading}</h3>}
            {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1">{cleanBold(item)}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic pro template for the remaining ones
function GenericProTemplate({ content, accentColor, headerBg }: { content: string; accentColor: string; headerBg?: string }) {
  const sections = parseResumeContent(content);
  const nameSection = sections[0];
  const rest = sections.slice(1);
  return (
    <div className="bg-white text-gray-900 font-sans text-sm">
      {headerBg ? (
        <div className="p-6" style={{ backgroundColor: headerBg }}>
          {nameSection && (
            <>
              {nameSection.heading && <h2 className="text-xl font-bold text-white">{nameSection.heading}</h2>}
              {nameSection.items.map((item, j) => <p key={j} className="text-white/80 text-xs mt-1">{cleanBold(item)}</p>)}
            </>
          )}
        </div>
      ) : nameSection && (
        <div className="p-8 pb-4">
          {nameSection.heading && <h2 className="text-xl font-bold" style={{ color: accentColor }}>{nameSection.heading}</h2>}
          {nameSection.items.map((item, j) => <p key={j} className="text-gray-500 text-xs mt-1">{cleanBold(item)}</p>)}
        </div>
      )}
      <div className="p-8 pt-4 space-y-4">
        {rest.map((s, i) => (
          <div key={i}>
            {s.heading && <h3 className="text-sm font-bold uppercase tracking-wider pb-1 mb-2 border-b" style={{ color: accentColor, borderColor: accentColor + "40" }}>{s.heading}</h3>}
            {s.items.map((item, j) => <p key={j} className="text-gray-700 mb-1">{cleanBold(item)}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Map template IDs to components
const freeTemplateComponents: Record<string, React.FC<{ content: string }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  bold: BoldTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  compact: CompactTemplate,
  tech: TechTemplate,
};

const proTemplateStyles: Record<string, { accent: string; headerBg?: string }> = {
  "pro-elegant": { accent: "#4A5568" },
  "pro-gradient": { accent: "#667eea" },
  "pro-timeline": { accent: "#3B82F6" },
  "pro-sidebar": { accent: "#1E293B" },
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

const specialProComponents: Record<string, React.FC<{ content: string }>> = {
  "pro-elegant": ProElegantTemplate,
  "pro-gradient": ProGradientTemplate,
  "pro-timeline": ProTimelineTemplate,
  "pro-sidebar": ProSidebarTemplate,
};

function getTemplateComponent(id: string): React.FC<{ content: string }> {
  if (freeTemplateComponents[id]) return freeTemplateComponents[id];
  if (specialProComponents[id]) return specialProComponents[id];
  const style = proTemplateStyles[id] || { accent: "#3B82F6" };
  return ({ content }) => <GenericProTemplate content={content} accentColor={style.accent} headerBg={style.headerBg} />;
}

export function ResumeTemplates({ content }: ResumeTemplatesProps) {
  const [selected, setSelected] = useState<string>("modern");
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "premium";

  const selectedTemplate = allTemplates.find(t => t.id === selected)!;
  const isLockedTemplate = selectedTemplate?.pro && !isPro;

  const SelectedComponent = getTemplateComponent(selected);

  const downloadPDF = async () => {
    if (isLockedTemplate) {
      navigate("/pricing");
      return;
    }
    const el = document.getElementById("resume-template-preview");
    if (!el) return;

    const { default: html2canvas } = await import("html2canvas");
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("resume.pdf");
  };

  const freeTemplates = allTemplates.filter(t => !t.pro);
  const proTemplates = allTemplates.filter(t => t.pro);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-base">📄 Resume Templates</h2>
        <button onClick={downloadPDF}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isLockedTemplate
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}>
          {isLockedTemplate ? <><Lock className="h-4 w-4" /> Upgrade to Download</> : <><Download className="h-4 w-4" /> Download PDF</>}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Choose a template, preview your resume, then download as PDF.</p>

      {/* Free Templates */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Free Templates ({freeTemplates.length})</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {freeTemplates.map((tpl) => (
            <button key={tpl.id} onClick={() => setSelected(tpl.id)}
              className={`p-3 rounded-lg text-left border transition-all ${
                selected === tpl.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
              }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold">{tpl.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tpl.tag}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pro Templates */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pro Templates ({proTemplates.length})</p>
          {!isPro && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold flex items-center gap-1">
              <Crown className="h-2.5 w-2.5" /> Pro Plan
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {proTemplates.map((tpl) => (
            <button key={tpl.id} onClick={() => setSelected(tpl.id)}
              className={`p-3 rounded-lg text-left border transition-all relative ${
                selected === tpl.id ? "border-amber-500 bg-amber-500/5" : "border-border/50 hover:border-amber-500/50"
              } ${!isPro ? "opacity-75" : ""}`}>
              {!isPro && <Lock className="absolute top-2 right-2 h-3 w-3 text-amber-500" />}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold">{tpl.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">{tpl.tag}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="relative">
        {isLockedTemplate && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3">
            <Lock className="h-8 w-8 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Pro Template</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">Upgrade to Pro to unlock {proTemplates.length} premium resume templates and download as PDF.</p>
            <button onClick={() => navigate("/pricing")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
              View Pricing
            </button>
          </div>
        )}
        <div id="resume-template-preview" className="border border-border/50 rounded-lg overflow-hidden shadow-lg max-h-[600px] overflow-y-auto">
          <SelectedComponent content={content} />
        </div>
      </div>
    </motion.div>
  );
}
