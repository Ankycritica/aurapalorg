# AuraPal backlog

## Blog keywords (one per run, top first)

- [x] resume bullet points examples — /blog/resume-bullet-points-examples
- [x] how to write a cover letter — /blog/cover-letter-that-gets-read
- [x] star method interview answers — /blog/star-method-interview-answers
- [x] resume summary examples (by career stage) — /blog/resume-summary-examples
- [ ] how to answer "tell me about yourself"
- [ ] salary negotiation email template
- [ ] career change resume (no direct experience)
- [ ] what to put in LinkedIn About section (examples)
- [ ] how long should a resume be in 2026
- [ ] how to explain a gap in your resume
- [ ] questions to ask at the end of an interview
- [ ] how to follow up after an interview (email templates)
- [ ] skills to put on a resume (by role)
- [ ] how to validate a startup idea before building
- [ ] entry level resume with no experience

## Next improvements (frontend/content, top first)

- [x] Per-page OG images — `scripts/generate-og-images.mjs` → `public/og/` (2026-10-21)
- [ ] Stop polling `check-subscription`: one signed-in session called it 129 times in a day (Oct 21). Billing is gone; call it at most once per session, or not at all (frontend only)
- [ ] "Related guides" block at the bottom of each blog post linking 2 other posts + the matching landing page
- [ ] Add an RSS feed (`/rss.xml`) generated in `scripts/prerender.mjs`
- [ ] Breadcrumb JSON-LD on blog posts and landing pages
- [ ] Landing page for "resume summary generator" (`/resume-summary-generator`) → /resume-builder
- [ ] Landing page for "LinkedIn headline generator" (`/linkedin-headline-generator`) → /linkedin-roaster
- [ ] Lighthouse pass on `/`: fix any accessibility issues (contrast, alt text, button labels)

## Needs Ankit (agent must not do these)

- [ ] **Usage is flat:** 0 generations since 2026-09-19 and only 1 signup and 4 tracked page views in the week to Oct 21. Content alone won't move this soon; the guest-try item below and posting the marketing drafts are the levers.

- [x] **Guest try without signup** — shipped 2026-10-21 at Ankit's request: /resume-roast is public, one roast per visitor via the `guest-roast` edge function (per-IP 2/24h, global 200/24h, counted as `guest_roast` in analytics_events). Next: watch guest_roast → signup conversion; consider the same for the LinkedIn roaster.
- [ ] Verify the site in Google Search Console and submit `https://www.aurapal.org/sitemap.xml` (Bing is already verified via BingSiteAuth.xml)
- [ ] Enable Supabase Leaked Password Protection (still flagged by advisors on 2026-10-21)
- [x] Review 6 SECURITY DEFINER functions — verified 2026-10-26: all six check `auth.uid()` against `p_user_id`, so a signed-in user cannot read another user's data. The advisor WARN is expected; no change needed.
- [ ] Set Supabase Auth Site URL to https://www.aurapal.org
- [ ] Rotate keys/tokens that were pasted in chat
