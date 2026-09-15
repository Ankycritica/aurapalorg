/**
 * Prerender static HTML for every public route.
 *
 * The app is a client-rendered SPA, so useSeo() only sets <title>, meta and
 * JSON-LD after JavaScript executes. Google will usually render eventually, but
 * social crawlers (LinkedIn, X, Slack, WhatsApp, Facebook) never run JS — they
 * read the raw HTML. Without this every shared link unfurled with the homepage's
 * title and description, whatever page was actually shared.
 *
 * This copies dist/index.html per route and rewrites the head with that route's
 * real metadata, plus a <noscript> block containing the page's core copy so
 * there is indexable text even with JS disabled. React still hydrates over it.
 *
 * Runs automatically after `vite build`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const SITE = "https://aurapal.org";

const org = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AuraPal",
  url: SITE,
  logo: `${SITE}/logo.png`,
  description: "Free AI career tools: resume builder, resume roast, LinkedIn roaster, salary benchmarking, interview prep and job search.",
};

const softwareApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AuraPal",
  url: SITE,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "AI Resume Builder", "Resume Roast", "LinkedIn Roaster", "Cover Letter Generator",
    "Interview Prep", "Salary Benchmarking", "Startup Validator", "Job Finder",
    "SEO Article Generator", "Business Plan Generator",
  ],
};

const faq = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({
    "@type": "Question", name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

/** Public routes only. Anything behind auth must never be listed. */
const routes = [
  {
    path: "/",
    title: "AuraPal — Free AI Career Tools | Resume Builder, Roast & Salary Check",
    description:
      "Ten free AI career tools in one place: resume builder with ATS scoring, resume roast, LinkedIn roaster, cover letters, interview prep, salary benchmarking and job search. No credit card.",
    keywords: "free ai resume builder, resume roast, ai resume checker, linkedin headline generator, salary benchmark tool, ai cover letter generator, interview prep ai, ats resume checker free",
    h1: "Your AI career engine.",
    copy: "AuraPal gives you ten free AI career tools: an ATS-aware resume builder, resume and LinkedIn roasts scored out of 100, a cover letter generator, interview preparation, salary benchmarking against live job listings, a startup idea validator, a job finder across eight boards, an SEO article writer and a business plan generator. Everything is free, with no credit card and no paid tier.",
    jsonLd: [org, softwareApp, faq([
      ["Is AuraPal free?", "Yes. Every tool is free with no credit card and no paid plan."],
      ["What AI powers AuraPal?", "Google Gemini, wrapped in purpose-built prompts and scoring rubrics for each tool."],
      ["Does AuraPal check my resume against ATS?", "Yes. The resume builder and resume roast score formatting, keyword coverage and quantified achievements."],
      ["Where do the salary numbers come from?", "Live advertised salary ranges from job listings, with the sample size shown. When real data is unavailable for a role the tool says so rather than guessing."],
    ])],
  },
  {
    path: "/ai-resume-roast",
    title: "AI Resume Roast — Get Your Resume Scored Out of 100 | Free",
    description:
      "Paste your resume and get a brutally honest AI critique scored out of 100 across formatting, bullet impact, ATS keywords and quantified achievements. Free, no sign-up cost.",
    keywords: "ai resume roast, resume roast free, roast my resume, ai resume critique, resume score checker, free resume review ai",
    h1: "AI Resume Roast",
    copy: "Paste your resume and get an honest critique scored out of 100. AuraPal's resume roast grades formatting and readability, the impact of your bullet points, ATS keyword coverage, and whether your achievements are quantified — then rewrites the weak sections. Free, instant, no credit card.",
    jsonLd: [org],
  },
  {
    path: "/ai-resume-roast-free",
    title: "Free AI Resume Checker — Instant Score and Rewrite",
    description:
      "Free AI resume checker. Get an instant score, see exactly which bullet points are weak, and get them rewritten in achievement-first format. No card, no trial.",
    keywords: "free ai resume checker, free resume scanner, ats resume checker free, resume grader free, ai resume feedback",
    h1: "Free AI Resume Checker",
    copy: "Check your resume free with AI. Get an instant score, a breakdown of what is weak and why, and rewritten bullet points in achievement-first format. Works with pasted text or an uploaded PDF or Word file.",
    jsonLd: [org],
  },
  {
    path: "/salary-checker-free",
    title: "Am I Underpaid? Free AI Salary Checker with Real Market Data",
    description:
      "Find out if you're underpaid. Compare your salary against live advertised ranges for your role and location — P25 to P90, with sample size — plus a negotiation script.",
    keywords: "am i underpaid, free salary checker, salary benchmark tool, market rate salary calculator, salary comparison by role and location, how much should i be paid",
    h1: "Am I Underpaid?",
    copy: "Compare your salary against the real market. AuraPal pulls live advertised salary ranges for your role and location and shows you the 25th, 50th, 75th and 90th percentiles with the sample size, where you sit in that spread, and a negotiation script to close the gap. Free.",
    jsonLd: [org],
  },
  {
    path: "/startup-idea-validator",
    title: "Free AI Startup Idea Validator — Score Your Idea 0–100",
    description:
      "Validate your startup idea with AI before you quit your job. Get a score out of 100, red flags, market analysis and a go-to-market plan. Free.",
    keywords: "startup idea validator, validate startup idea ai, startup idea score, business idea validation tool free, is my startup idea good",
    h1: "Startup Idea Validator",
    copy: "Describe your startup idea and get it scored out of 100 across market size, differentiation, feasibility and timing — with the red flags spelled out and a practical go-to-market plan. Free, and honest enough to tell you when an idea is weak.",
    jsonLd: [org],
  },
  {
    path: "/about",
    title: "About AuraPal — Free AI Career Tools",
    description: "AuraPal is a free set of AI career tools built to help people write better resumes, benchmark their pay and prepare for interviews.",
    keywords: "about aurapal, ai career tools, free career platform",
    h1: "About AuraPal",
    copy: "AuraPal is a free AI career engine built by one person. Ten tools, no paid tier, no credit card. It exists because most career advice stops at 'quantify your impact' without saying which bullet or how.",
    jsonLd: [org],
  },
  {
    path: "/features",
    title: "All Ten AI Career Tools — AuraPal Features",
    description: "Resume builder, resume roast, LinkedIn roaster, cover letters, interview prep, salary check, startup validator, job finder, SEO writer, business plans. All free.",
    keywords: "ai career tools list, resume builder features, linkedin optimizer, ai interview preparation, ai job search tools",
    h1: "Ten AI Career Tools",
    copy: "Every AuraPal tool in one place: AI resume builder with ATS scoring and three templates, resume roast, LinkedIn roaster, cover letter generator, interview preparation, salary benchmarking, startup idea validator, job finder across eight job boards, SEO article generator and business plan generator.",
    jsonLd: [org, softwareApp],
  },
  {
    path: "/blog",
    title: "AuraPal Blog — Career Guides, Resume and Salary Research",
    description: "Practical guides on how applicant tracking systems really work, what makes a LinkedIn headline effective, and how to benchmark and negotiate your salary.",
    keywords: "ats resume guide, linkedin headline tips, salary negotiation guide, career advice blog",
    h1: "Career guides that say something.",
    copy: "Long-form guides on applicant tracking systems, LinkedIn headlines and salary benchmarking — written to be useful on their own rather than to sell you a product.",
    jsonLd: [org],
  },
];

// Blog posts are prerendered from the same source the app renders.
const postsSrc = readFileSync(join(__dirname, "..", "src", "content", "posts.ts"), "utf8");
for (const m of postsSrc.matchAll(/slug:\s*"([^"]+)",\s*\n\s*title:\s*\n?\s*"([^"]+)",\s*\n\s*teaser:\s*\n?\s*"([^"]+)"/g)) {
  const [, slug, title, teaser] = m;
  routes.push({
    path: `/blog/${slug}`,
    title: `${title} — AuraPal`,
    description: teaser,
    keywords: "career advice, resume tips, job search guide",
    h1: title,
    copy: teaser,
    jsonLd: [org, {
      "@context": "https://schema.org", "@type": "BlogPosting",
      headline: title, description: teaser,
      publisher: { "@type": "Organization", name: "AuraPal", url: SITE },
      mainEntityOfPage: `${SITE}/blog/${slug}`,
    }],
  });
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const template = readFileSync(join(DIST, "index.html"), "utf8");
let written = 0;

for (const r of routes) {
  const url = `${SITE}${r.path}`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(r.description)}"/>`);
  html = html.replace(/<meta name="keywords"[^>]*>/, `<meta name="keywords" content="${esc(r.keywords)}"/>`);
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(r.title)}"/>`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(r.description)}"/>`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}"/>`);
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(r.title)}"/>`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(r.description)}"/>`);
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}"/>`);

  // Replace the static index.html JSON-LD with this route's graph.
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    r.jsonLd.map((d) => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join(""));

  // Indexable copy for crawlers that do not execute JavaScript. React replaces
  // #root on hydration, so a human never sees this.
  const fallback = `<div id="root"><main style="max-width:44rem;margin:0 auto;padding:3rem 1.25rem;font-family:system-ui,sans-serif;background:#050505;color:#fff;min-height:100vh"><h1 style="font-size:2rem;line-height:1.15;margin:0 0 1rem">${esc(r.h1)}</h1><p style="line-height:1.7;color:rgba(255,255,255,.65)">${esc(r.copy)}</p><p style="margin-top:2rem"><a href="/auth" style="color:#fff">Open AuraPal — free, no credit card</a></p></main></div>`;
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, fallback);

  const outDir = r.path === "/" ? DIST : join(DIST, r.path);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  written++;
}

console.log(`prerendered ${written} routes`);
