import { SeoLandingLayout } from "./SeoLandingLayout";

export default function AiResumeRoast() {
  return (
    <SeoLandingLayout
      metaTitle="Free AI Resume Roast — Brutally Honest Resume Feedback in 15s | AuraPal"
      metaDescription="Get your resume roasted by AI. Brutal, actionable feedback on formatting, bullet points, ATS keywords, and impact. Free forever. No signup wall."
      keywords="AI resume roast, resume feedback, resume review, ATS resume check, free resume critique"
      badge="Free AI Resume Roast"
      h1="Get your resume roasted by AI — brutally honest, actually useful"
      subhead="Stop sending the same dead resume into the void. Our AI Resume Roaster scores you 0–100, names what's broken, and tells you exactly how to fix it. Used by 10,000+ job seekers."
      ctaTo="/resume-roast"
      ctaLabel="Roast my resume free"
      benefits={[
        "0–100 brutal score with breakdown across 5 categories",
        "Specific line-by-line callouts (not generic fluff)",
        "ATS keyword analysis — see what recruiters' bots ignore",
        "Rewrite suggestions in the XYZ impact format",
        "Works for any role, industry, or experience level",
        "No signup wall — just paste and go",
      ]}
      exampleTitle="What an AI Resume Roast looks like"
      exampleOutput={`Score: 41 / 100 — "Could land a phone screen at a small company. Won't survive a Google ATS."

🔥 The brutal verdict
Your resume is a list of job duties, not achievements. There are zero numbers. Three of your bullets start with "Responsible for" — recruiter speak for "I did the bare minimum."

❌ What's killing you
1. Bullet 4, Acme Corp: "Helped manage social media accounts."
   → Helped how? Managed how many? What changed because you were there?
2. Skills section is a keyword soup with no context. "Leadership, Strategy, Communication" tells me nothing.
3. Your summary is 4 lines of buzzwords. Cut it or rewrite it.

✅ Rewrite this bullet:
Before: "Helped manage social media accounts."
After:  "Grew Instagram following from 2K to 18K in 9 months by launching a weekly carousel series, driving a 4.2× increase in inbound leads."

Want the full 9-page roast with rewrites for every bullet? Generate yours.`}
      testimonial={{
        quote: "Scored a 34. Fixed everything it said. Got 4 interviews the next week. Worth more than the $200 resume coach I hired before.",
        name: "Sarah K.",
        role: "Marketing Manager",
      }}
      faq={[
        { q: "Is the AI Resume Roast really free?", a: "Yes. Free forever plan gives you 5 roasts per day. No credit card." },
        { q: "Will it actually help me get interviews?", a: "It identifies the specific issues recruiters and ATS systems flag. Fix those, and your callback rate goes up. Most users report 2–5× more interviews within 2 weeks." },
        { q: "How is this different from a generic resume review?", a: "We use a strict scoring rubric across formatting, impact, ATS, clarity, and relevance — and we rewrite your weakest bullets in the XYZ achievement format. No generic 'add more keywords' advice." },
        { q: "Is my resume data private?", a: "Yes. We never share your data. You can delete any roast from your history with one click." },
      ]}
    />
  );
}
