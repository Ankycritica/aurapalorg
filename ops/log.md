# AuraPal agent log

## 2026-10-15 — baseline (set up by Claude with Ankit)

Metrics: 32 users · 6 signups last 7d · 0 generations last 7d (last one 2026-09-19) · ~17 page views last 7d.

Shipped:
- Removed stale pricing, fake 4.8★ rating and duplicate static content from every page (d497c60)
- 4 landing pages: /ats-resume-checker, /free-cover-letter-generator, /linkedin-profile-review, /ai-interview-questions
- 3 posts: resume bullet examples, cover letters, STAR answers
- Canonicals moved to www, sitemap generated at build with lastmod, footer "Free tools" links
- Removed fabricated testimonial and decorative star rows
- marketing/2026-10-15.md

Needs Ankit: guest try-without-signup, Google Search Console, leaked password protection.

## 2026-10-21 — weekly run

Metrics (7d to Oct 21): 33 users (+1) · 1 signup (was 6) · 0 generations (unchanged; last 2026-09-19) · 0 users generating · 4 page views (was ~17).

Health: prod deployment READY on main HEAD; /, /ats-resume-checker checked live (one H1, no stale pricing, no errors); no edge-function errors in 24h. Advisors: leaked password protection still off; 6 SECURITY DEFINER RPCs executable by signed-in users (WARN). WebFetch to aurapal.org was not permitted in this run; used the Vercel fetch tool instead.

Shipped:
- SEO fix: all titles ≤ 60 / descriptions ≤ 160 (cover letter + interview landing pages, homepage prerender, index.html fallback, two long post titles via new `seoTitle`); /privacy and /terms now set their own title + canonical (acd8dc3)
- Post: /blog/resume-summary-examples (01c0338)
- Improvement: per-page OG images for all 19 public pages + honest default og-image.png (eee55d3)
- marketing/2026-10-21.md

Notes: smoke test ignores `/_vercel/insights/script.js` 404 (only exists on Vercel) and sandbox network errors to Google fonts/auth. Use playwright ≥ 1.56 with /opt/pw-browsers/chromium (1.48 fails on old headless). `pkill -f "vite preview"` kills the calling shell; use `pkill -f "[v]ite preview"`.

Needs Ankit: guest try-without-signup (biggest lever — usage flat for a month), Search Console, leaked password protection, review SECURITY DEFINER RPCs.

## 2026-10-21 (later) — guest roast, requested by Ankit

- New edge function `guest-roast` (verify_jwt off, own limits): fixed server-side roast prompt (clients cannot send prompts), resume 200–15,000 chars, 2 per IP hash per 24h, 200 per day overall, attempts logged as `guest_roast` in analytics_events, resume text never stored. Existing functions, schema and auth untouched.
- /resume-roast moved out of ProtectedRoute: visitors get one roast (localStorage flag plus server limit), then a "Sign in free to keep going" card; a second try goes to /auth?next=/resume-roast. Aura chat, Regen and Share stay signed-in only.
- CTAs: homepage hero "Roast my resume — no sign-up"; /ats-resume-checker and /ai-resume-roast point to /resume-roast.
- Sidebar logo was an H1 on every app page; now a <p>.
- Tested locally with the function stubbed (Deno) and the UI flow mocked (Playwright). The live function could not be called from the agent sandbox (network), so the first real guest roast is the live check: query `select * from analytics_events where event_name='guest_roast'` and the function logs.
- Metric to watch: guest_roast count vs signups.

## 2026-10-21 (later) — sign-in page replaced, requested by Ankit

- The full-screen /auth page is gone. Sign-in is a dialog over the current page (Google first, email behind "Use email instead"); every link to /auth opens it in place. /auth shows the homepage with the dialog open. Signed-in-only pages now pass ?next so sign-in returns people to the page they wanted.
- The GitHub push for c41b4a5 did not trigger a Vercel build; deployed it manually via the Vercel API (dpl_cUTq2iWTbnZACKUttKa5HMMrgBu8). If pushes stop deploying again, check the Vercel ↔ GitHub connection.

## 2026-10-26 — check requested by Ankit

Metrics (7d): 35 users · 2 signups (prev 7d: 4) · 0 generations (last 2026-09-19) · 0 guest roasts since launch on Oct 21 · 17 page views (prev 15). No Vercel runtime errors in 7d; no edge-function errors.

Fixed:
- /resume-roast (public since Oct 21) was not prerendered, so it served the homepage title and canonical. Added it to the prerender list with its own title, description and OG card; the page also sets them client-side via useSeo.

Checked: the 6 SECURITY DEFINER RPC warnings are safe (all check auth.uid()). guest-roast is ACTIVE but has had no traffic yet.

Schedule: full run Wednesday plus a Saturday health run (see AGENT.md "Two kinds of run").

Needs Ankit: post the marketing drafts (traffic is the bottleneck), Google Search Console, leaked password protection.

## 2026-10-26 (later) — resume upload broken, reported by Ankit

- Uploading a PDF or .docx never filled the resume box on /resume-roast and /resume-builder, but the file card still said "Text extracted". Cause: pdfjs-dist 6.3 with a 4.4.168 worker from cdnjs (version mismatch), and the bundled mammoth hitting an @xmldom DOMParser error.
- Fix (9721989): shared `src/lib/extractResumeText.ts` with a bundled pdf.js worker and mammoth's browser build; failures clear the file and show a specific message (scanned PDF, .doc, too large).
- Smoke test should now include uploading a text PDF and a .docx to /resume-roast and asserting the textarea fills.

## 2026-10-28 — weekly run

Metrics (7d to Oct 28): 36 users (+3 vs 33 on Oct 21) · 3 signups (prev full run: 1) · 0 generations (unchanged; last 2026-09-19) · 0 users generating · 23 page views (was 4 on Oct 21, 17 on Oct 26) · 0 guest_roast events (0 all-time since launch Oct 21).

Health: prod deployment READY on main HEAD (bd5bde7 before this run); /, /blog, /resume-roast, /free-cover-letter-generator fetched live via the Vercel fetch tool (WebFetch permission timed out): one H1, own title + canonical, no stale pricing, no errors. No Vercel runtime errors in 7d; no edge-function log entries in 24h. Advisors unchanged: leaked password protection off; 6 SECURITY DEFINER RPC WARNs (verified safe Oct 26). All public routes are prerendered (privacy/terms set theirs client-side). Smoke test: 23 routes one H1 and no console errors; PDF and .docx upload on /resume-roast fill the textarea.

Shipped:
- Post: /blog/tell-me-about-yourself-answer + OG card (1edec22)
- Improvement: AuthContext no longer polls check-subscription every 60s; it runs once per signed-in user per page load (754257e). Not testable signed-in from the sandbox; worth a glance at check-subscription invocation counts next week.
- marketing/2026-10-28.md (769556c), deploy dpl_2tyqTvNSx8wh2QysRjM6vWK5SewA READY.

Noticed: the /blog page sets its client-side title to "AuraPal Blog — Career Guides & Job Search Tactics" while the prerender says "…Resume and Salary Research"; harmless, aligned later. Settings.tsx still invokes check-subscription after a `?checkout=success` return (billing is gone; dead path).

Needs Ankit: guest roast has had zero uses in a week — it needs traffic, so posting the drafts (with the /resume-roast link in comments where allowed) matters more than any page change; Google Search Console; leaked password protection.
