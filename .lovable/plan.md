## Job Finder — Full Vision (v1)

A new top-level tool at `/jobs` that turns AuraPal into a closed-loop career engine: **search → match → tailor → apply → track**. Free to search, credits only for AI work and HR email reveals.

---

### 1. Job Search Engine (free, no credits)

**Sources** — aggregated server-side via a single edge function `job-search`:
- **Adzuna** (global, requires free `app_id` + `app_key`, ~30 countries)
- **Arbeitnow** (free, no key, EU + remote)
- **Remotive** (free, no key, remote-first)
- **Jooble** (free key, 70+ countries)

The function fan-outs in parallel, normalizes results into a common shape, dedupes by `(title, company, location)`, and returns a paginated list. Each result includes the canonical `apply_url` that routes to the company's career page or board listing.

**Filters:** keyword, location (or "Remote"), seniority, employment type, posted-within (24h/7d/30d), salary range when provided.

**UI:** Split layout — left: filters + result list with infinite scroll; right: selected job detail panel with full description, company, salary, posted date, and a prominent **"Apply on company site"** button (opens `apply_url` in new tab).

### 2. Match Score (free, reuses existing engine)

For any job opened, a **"Score my fit"** button calls the existing roast/scoring logic against the user's saved resume (from Resume Builder). Returns a 0–100 score + 3 strengths + 3 gaps. Costs 1 credit (same as a roast).

### 3. Tailor to Job (paid, 1 credit each)

Two one-click actions in the job detail panel:
- **"Tailor my resume"** → opens Resume Builder pre-filled with rewritten bullets aligned to the JD
- **"Generate cover letter"** → opens Cover Letter tool pre-filled with company + JD context

Both reuse existing tools — no new AI prompts needed, just pass JD text as additional context.

### 4. Application Tracker (free)

Kanban board at `/jobs/tracker` with columns: **Saved · Applied · Interview · Offer · Rejected**. Drag cards between columns. Each card stores: job title, company, location, apply_url, JD snippet, date saved, notes, next-action date. Saving a job from search auto-creates a card in **Saved**.

### 5. HR Email Reveal (paid, 3 credits)

In the job detail panel: **"Find recruiter email"** button. Server flow:
1. Try **Hunter.io domain-search API** for the company domain → return verified emails of people with HR/Recruiter/Talent titles.
2. Fallback: pattern-guess (`firstname.lastname@domain`) + Hunter.io email-verifier.
3. Cache result per `(user, company)` so re-reveal is free for 30 days.

Charges 3 credits only on a successful reveal. Returns up to 3 contacts with name, title, verified email, confidence score.

### 6. Email Alerts (free)

In search UI: **"Save this search → email me daily"**. Stores `{user, query, filters, frequency}` in a new `job_alerts` table. A pg_cron job runs daily, re-runs each saved search via `job-search`, diffs against last sent, and sends a digest of *new* matches via the Lovable email infrastructure. Includes one-click unsubscribe.

---

## Technical section

### New routes
- `/jobs` — search + detail panel
- `/jobs/tracker` — kanban board
- `/jobs/alerts` — manage saved searches

### New edge functions
| Function | Purpose | Auth | Credits |
|---|---|---|---|
| `job-search` | Fan-out to 4 aggregators, normalize, dedupe, paginate | getClaims() | 0 |
| `job-match-score` | Run resume vs JD, return score + gaps | getClaims() | 1 (via existing usage_tracking) |
| `job-hr-email` | Hunter.io lookup + cache | getClaims() | 3 (atomic deduction) |
| `job-alerts-dispatch` | Cron-driven daily digest | service role | 0 |

### New tables (migration)
```text
saved_jobs (id, user_id, source, external_id, title, company, location,
            apply_url, jd_text, salary_min, salary_max, status, notes,
            next_action_at, created_at, updated_at)
   status ENUM: saved | applied | interview | offer | rejected

job_alerts (id, user_id, name, query, filters jsonb, frequency, last_sent_at,
            active, created_at)

job_alert_sent (id, alert_id, external_id, sent_at)   -- dedupe sent jobs

hr_email_cache (id, user_id, company_domain, payload jsonb, created_at)
```
RLS: per-user on all four tables (`auth.uid() = user_id` on saved_jobs, job_alerts, hr_email_cache; via alert join on job_alert_sent).

### Credit model integration
- Match score, tailor, cover letter → already counted by `usage_tracking` via existing `ai-tool` function. No changes needed.
- HR email reveal → new `usage_tracking` insert with `tool_name = 'hr-email'`, deducting 3 by inserting 3 rows in a single transaction (matches existing pattern). Free users hit their lifetime limit faster, which is the intended paywall trigger.

### Secrets needed
- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` (free signup at developer.adzuna.com)
- `JOOBLE_API_KEY` (free at jooble.org/api/about)
- `HUNTER_API_KEY` (Hunter.io — paid, ~$0.10/lookup; falls back gracefully if missing)

Arbeitnow + Remotive need no keys.

### Email alerts infra
Requires Lovable Email domain to be set up. If not configured when user enables alerts, surface the email-domain setup dialog before creating the alert. New edge function `job-alerts-dispatch` runs hourly via pg_cron, processes due alerts, calls `job-search` per alert, diffs against `job_alert_sent`, and enqueues a digest email per user.

### Sidebar / dashboard
- Add **"Find Jobs"** entry to `AppSidebar` with Briefcase icon (`lucide-react`).
- Add a **"Job Finder"** card to `Dashboard` tool grid.
- Aura Agent gets a new suggested action: "Find me jobs matching my resume" → deep-links to `/jobs?q=<inferred>`.

### SEO surface
- Static page `/jobs` with strong H1 + meta.
- Programmatic landing pages later (e.g. `/jobs/remote-react-developer`) — out of scope for v1, but DB schema supports it.

### Out of scope for v1
- LinkedIn/Indeed scraping (ToS + reliability risk)
- Auto-apply / form-fill (legal + technical can-of-worms)
- Programmatic SEO landing pages (post-launch once we see traction)

### Constraints respected
- No changes to existing tool prompts, Aura Agent, Stripe, or auth flows.
- Reuses `useUsage`, `aiFetch`, `usage_tracking`, existing dark-glass design tokens, and the unified results panel pattern.
- All edge functions use `getClaims()` per project policy.

### Rollout order
1. Migration + secrets
2. `job-search` function + `/jobs` UI (search + detail + apply link)
3. Saved jobs + tracker kanban
4. Match score + tailor buttons (wires into existing tools)
5. HR email reveal (gated until `HUNTER_API_KEY` provided)
6. Email alerts (gated until email domain configured)
