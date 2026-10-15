# AuraPal backlog

## Blog keywords (one per run, top first)

- [x] resume bullet points examples — /blog/resume-bullet-points-examples
- [x] how to write a cover letter — /blog/cover-letter-that-gets-read
- [x] star method interview answers — /blog/star-method-interview-answers
- [ ] resume summary examples (by career stage)
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

- [ ] Per-page OG images (static PNGs per landing page and post) so shared links get a matching preview
- [ ] "Related guides" block at the bottom of each blog post linking 2 other posts + the matching landing page
- [ ] Add an RSS feed (`/rss.xml`) generated in `scripts/prerender.mjs`
- [ ] Breadcrumb JSON-LD on blog posts and landing pages
- [ ] Landing page for "resume summary generator" (`/resume-summary-generator`) → /resume-builder
- [ ] Landing page for "LinkedIn headline generator" (`/linkedin-headline-generator`) → /linkedin-roaster
- [ ] Lighthouse pass on `/`: fix any accessibility issues (contrast, alt text, button labels)

## Needs Ankit (agent must not do these)

- [ ] **Guest try without signup** — let visitors run one Resume Roast before signing in. Biggest conversion lever (0 generations from last week's signups). Needs edge-function auth change.
- [ ] Verify the site in Google Search Console and submit `https://www.aurapal.org/sitemap.xml` (Bing is already verified via BingSiteAuth.xml)
- [ ] Enable Supabase Leaked Password Protection
- [ ] Set Supabase Auth Site URL to https://www.aurapal.org
- [ ] Rotate keys/tokens that were pasted in chat
