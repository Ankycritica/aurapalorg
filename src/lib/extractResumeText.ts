// Shared resume file → text extraction for Resume Roast and Resume Builder.
//
// The pdf.js worker is bundled from the installed pdfjs-dist package via
// Vite's ?url import, so the worker version always matches the library.
// (Loading it from a CDN pinned to an older version made every PDF fail
// with an API/worker version mismatch.)
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export class ResumeExtractError extends Error {}

async function fromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    const lines: string[] = [];
    for (const item of content.items as Array<{ str?: string; hasEOL?: boolean }>) {
      if (typeof item.str !== "string") continue;
      line += item.str;
      if (item.hasEOL) { lines.push(line); line = ""; } else if (item.str && !item.str.endsWith(" ")) line += " ";
    }
    if (line) lines.push(line);
    pages.push(lines.map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n"));
  }
  return pages.join("\n\n").trim();
}

async function fromDocx(file: File): Promise<string> {
  // The prebuilt browser bundle ships its own XML parser; importing "mammoth"
  // directly bundles an @xmldom version whose DOMParser rejects mammoth's calls.
  const mod = await import("mammoth/mammoth.browser.min.js");
  const mammoth = (mod.default ?? mod) as { extractRawText(o: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }> };
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value.trim();
}

/** Returns the resume text, or throws ResumeExtractError with a message safe to show the user. */
export async function extractResumeText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "doc") {
    throw new ResumeExtractError("Old .doc files can't be read in the browser. Save it as .docx or PDF, or paste the text below.");
  }
  if (ext !== "pdf" && ext !== "docx") {
    throw new ResumeExtractError("Please upload a PDF or Word (.docx) file.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new ResumeExtractError("That file is over 10 MB. Please upload a smaller file or paste the text below.");
  }
  let text = "";
  try {
    text = ext === "pdf" ? await fromPdf(file) : await fromDocx(file);
  } catch (err) {
    console.error("[AuraPal] resume extraction failed", err);
    throw new ResumeExtractError("We couldn't read that file. Please paste your resume text below instead.");
  }
  if (text.replace(/\s/g, "").length < 50) {
    throw new ResumeExtractError(
      "We couldn't find any text in that file — it's probably a scanned image. Please paste your resume text below, or export a text-based PDF from Word or Google Docs.",
    );
  }
  return text;
}
