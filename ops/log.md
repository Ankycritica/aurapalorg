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
