import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye } from "lucide-react";

interface ResumeTemplatesProps {
  content: string;
}

type TemplateName = "modern" | "classic" | "minimal";

const templates: { id: TemplateName; name: string; tag: string; desc: string }[] = [
  { id: "modern", name: "Modern", tag: "Popular", desc: "Clean single column with cyan accents" },
  { id: "classic", name: "Classic", tag: "Professional", desc: "Traditional two-column layout" },
  { id: "minimal", name: "Minimal", tag: "Clean", desc: "Ultra-clean with generous whitespace" },
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
            <p key={j} className="text-gray-700 mb-1">{item.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
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
              {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1">{item.replace(/\*\*(.*?)\*\*/g, "$1")}</p>)}
            </div>
          ))}
        </div>
        <div className="space-y-4 border-l border-gray-200 pl-4">
          {rightSections.map((s, i) => (
            <div key={i}>
              {s.heading && <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2 text-gray-800">{s.heading}</h3>}
              {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1 text-xs">{item.replace(/\*\*(.*?)\*\*/g, "$1")}</p>)}
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
          {s.items.map((item, j) => <p key={j} className="text-gray-600 mb-1">{item.replace(/\*\*(.*?)\*\*/g, "$1")}</p>)}
        </div>
      ))}
    </div>
  );
}

const templateComponents: Record<TemplateName, React.FC<{ content: string }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

export function ResumeTemplates({ content }: ResumeTemplatesProps) {
  const [selected, setSelected] = useState<TemplateName>("modern");
  const [previewing, setPreviewing] = useState(false);

  const SelectedTemplate = templateComponents[selected];

  const downloadPDF = async () => {
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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-base">📄 Resume Templates</h2>
        <button onClick={downloadPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Preview your resume with different templates. Click to select, then download.</p>

      <div className="grid grid-cols-3 gap-2">
        {templates.map((tpl) => (
          <button key={tpl.id} onClick={() => { setSelected(tpl.id); setPreviewing(true); }}
            className={`p-3 rounded-lg text-left border transition-all ${
              selected === tpl.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
            }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm font-semibold">{tpl.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tpl.tag}</span>
            </div>
            <p className="text-xs text-muted-foreground">{tpl.desc}</p>
          </button>
        ))}
      </div>

      <div id="resume-template-preview" className="border border-border/50 rounded-lg overflow-hidden shadow-lg max-h-[600px] overflow-y-auto">
        <SelectedTemplate content={content} />
      </div>
    </motion.div>
  );
}
