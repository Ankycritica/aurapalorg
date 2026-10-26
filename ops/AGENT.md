# AuraPal weekly improvement agent — playbook

You are the weekly agent that keeps aurapal.org healthy and growing. Owner: Ankit Dongare.
Read this whole file, then `ops/log.md` (what earlier runs did) and `ops/backlog.md` (what to do next).

## Facts

- Repo: github.com/Ankycritica/aurapalorg, branch `main`. Pushing to `main` auto-deploys to Vercel production.
- Site: https://www.aurapal.org (apex redirects to www). Vite + React SPA, `npm run build` = vite build + `scripts/prerender.mjs` (per-route HTML + sitemap).
- Vercel: team `team_5raAeLOq9uWUmGTQnsThi5uN`, project `aurapalorg`.
- Supabase: project ref `urwltccnnlbyibvtqrmr`. Read-only queries only.
- Product: 10 free AI career tools on Google Gemini. Everything is free, cap 250 generations/day, Google sign-in. No paid tier.
- Commits MUST use `-c user.name="Ankit Dongare" -c user.email="dongare.ankit29@gmail.com"` — Vercel Hobby blocks deploys from other authors. Keep the Co-Authored-By trailer.

## Hard rules

1. **Never fabricate.** No user counts, ratings, reviews, testimonials, success stories or outcome promises. If a number isn't measured, don't write it.
2. **Frontend and content only.** Do NOT change: Supabase schema/migrations/RLS/functions, edge functions, auth flow (`Auth.tsx`, `AuthCallback.tsx`, `supabase/client.ts`), env vars, DNS, billing. Put proposals for those in the backlog under "Needs Ankit".
3. **Never delete** existing blog posts or pages. Edit, don't remove.
4. **Ship only green builds.** `npm run build` passes, `npx tsc --noEmit -p tsconfig.app.json` is clean, and the smoke test shows exactly one H1 per page and no console errors. If anything fails, don't push; log why.
5. **Small, reviewable changes.** Per run: at most one new blog post, one improvement, plus any bug fixes. One commit each.
6. **Never post to social media or send email.** Write marketing drafts to `marketing/`; Ankit posts them himself.
7. Public-facing pages are crawled by Google: keep titles ≤ 60 chars, descriptions ≤ 160, one H1, canonical on `https://www.aurapal.org`.

## Two kinds of run

- **Wednesday — full run:** every step below.
- **Saturday — health run:** steps 1, 2, 6 (only if something was fixed), 7 and 8. No new post, no improvement, no marketing file. Also check: any `guest_roast` events this week (`select count(*) from analytics_events where event_name='guest_roast' and created_at > now()-interval '7 days'`), and that every public route in `scripts/prerender.mjs` serves its own `<title>` and canonical (use the Vercel `web_fetch_vercel_url` tool if WebFetch is blocked). Report in 3–5 lines; if all is fine, say so in one line.

## Each run (full)

1. **Health check** (report every result):
   - Latest Vercel production deployment is READY and matches `main` HEAD.
   - WebFetch `https://www.aurapal.org/`, `/blog`, and two landing pages: one H1, no stale pricing ("$19", "$49", "promo", "Oct 1"), no error text.
   - Supabase: `get_advisors` (security), `query_logs` for function errors in the last 24h.
   - Metrics (read-only SQL): total users, signups last 7d, `generations` last 7d, distinct users generating last 7d, `analytics_events` page_views last 7d, `guest_roast` events last 7d.
   - Vercel `get_runtime_errors` for the last 7d.
   - Any public page not in `scripts/prerender.mjs` serves the homepage's title and canonical. When a page is made public (moved out of ProtectedRoute), add it to the prerender route list in the same change.
2. **Fix** any regression from step 1 (within the hard rules).
3. **SEO:** write one new blog post for the top unchecked keyword in `ops/backlog.md` — 700–1,200 words, genuinely useful on its own, matching the style of the existing posts in `src/content/posts.ts` (append to the array; keep the `slug/title/teaser/date` field order, because the prerender regex depends on it; no backticks or `${` in the body). Link it to the matching tool. Tick the keyword off. Then give it a social card: after `npm run build`, run `PLAYWRIGHT_MODULE=<scratchpad>/node_modules/playwright node scripts/generate-og-images.mjs --chromium /opt/pw-browsers/chromium` (only new pages get an image; `--force` regenerates all), check the PNG, commit it, and build again. Do the same for any new landing page.
4. **Improve:** do the top unchecked item in "Next improvements" in the backlog, if it is within the rules. Otherwise skip.
5. **Marketing:** write `marketing/YYYY-MM-DD.md` with 3–4 ready-to-post drafts (Reddit, LinkedIn, X) built around this week's new post or page. Value first, link last, no invented results.
6. **Ship:** build, smoke test, commit, push, then confirm the new deployment is READY and the new page is live via WebFetch.
7. **Log:** append a dated entry to `ops/log.md` (metrics, what shipped, anything that needs Ankit), update `ops/backlog.md`, commit and push those too.
8. **Report** in 5–8 short lines: metrics vs last week, what shipped (with URLs), what needs Ankit.

## Smoke test

```bash
npm ci && npm run build
(setsid npx vite preview --port 4179 --host 127.0.0.1 >/dev/null 2>&1 &); sleep 4
# Playwright (>= 1.56; 1.48 fails on this chromium): launch chromium with executablePath "/opt/pw-browsers/chromium" (do not run playwright install),
# visit each public route, assert document.querySelectorAll("h1").length === 1, collect pageerror events.
# Ignore the /_vercel/insights/script.js 404 (exists only on Vercel) and sandbox network errors to Google hosts.
pkill -f "[v]ite preview"   # brackets stop pkill matching its own shell
```
Install playwright into the scratchpad, not the repo.
