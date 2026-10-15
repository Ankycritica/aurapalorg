import { SeoLandingLayout } from "./SeoLandingLayout";

export default function AtsResumeChecker() {
  return (
    <SeoLandingLayout
      metaTitle="Free ATS Resume Checker — See What the Parser Sees | AuraPal"
      metaDescription="Free ATS resume checker. Find formatting that breaks parsers, missing keywords from the job description, and weak bullets — then fix them. No credit card."
      keywords="ats resume checker, free ats resume checker, ats score, resume ats test, ats friendly resume checker, resume keyword scanner"
      badge="Free ATS Resume Checker"
      h1="Free ATS resume checker"
      subhead="Applicant tracking systems parse your resume into fields before a human sees it. AuraPal checks whether yours survives that step and whether it matches the job you're applying for."
      ctaTo="/resume-builder"
      ctaLabel="Check my resume free"
      benefits={[
        "ATS score with the reasons behind it, not just a number",
        "Keyword match against the job description you paste",
        "Flags layouts that scramble reading order: tables, text boxes, headers",
        "Finds bullets with no measurable result and rewrites them",
        "Upload PDF or Word, or paste text",
        "Free, no credit card",
      ]}
      exampleTitle="What the ATS check returns"
      exampleOutput={`ATS score: 64 / 100

Parsing
✔ Contact details found
✖ Work history in a two-column table — dates may attach to the wrong job
✖ Skills listed inside an image header — invisible to parsers

Keyword match vs. job description (Data Analyst)
Found: SQL, Tableau, stakeholder reporting
Missing: Python, A/B testing, dbt

Weakest bullet
"Responsible for weekly reports"
→ "Automated 12 weekly KPI reports in Tableau, cutting prep time from 6 hours to 40 minutes"`}
      faq={[
        { q: "What is an ATS score?", a: "There is no universal ATS score. Ours estimates how cleanly your resume parses and how well it matches the job description, and explains each deduction." },
        { q: "Is it really free?", a: "Yes. Every AuraPal tool is free with no paid plan. Sign in with Google to use it." },
        { q: "Do ATS systems reject resumes automatically?", a: "Mostly no. They store and rank applications; recruiters filter by keywords and knockout questions. A resume that parses badly or misses key terms simply never surfaces in those searches." },
        { q: "Are PDFs ATS-friendly?", a: "Text-based PDFs parse well in modern systems. Scanned PDFs and image-heavy designs do not." },
      ]}
    />
  );
}
