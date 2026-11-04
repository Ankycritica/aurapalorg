# AuraPal — AI Career Platform

**Practical tools for resumes, interviews, and career planning.**

**Live website:** [aurapal.org](https://aurapal.org)

AuraPal brings a collection of career workflows into one web application. The repository includes pages and components for resume creation and review, LinkedIn profile feedback, interview preparation, job tracking, and an AI assistant.

## What is included

- **Resume tools:** builder, templates, resume feedback, and cover letters.
- **Career preparation:** interview practice, LinkedIn profile feedback, and salary exploration.
- **Career workspace:** job finder, job tracker, and user dashboard.
- **AI assistant:** Aura Agent and related chat components.
- **Account and product flows:** authentication, settings, pricing, and usage/credit UI.

Features and access can evolve; consult the running app for current availability.

## Tech stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Supabase · Vercel

## Run locally

Requires a supported Node.js version and npm.

```bash
npm ci
npm run dev
```

Vite will print the development URL. Build and checks:

```bash
npm run lint
npm run test
npm run build
```

## Configuration

Local development uses Supabase client configuration. Supply the following environment variables in a local `.env.local` file as appropriate to your environment:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Only use publishable browser-side values with the `VITE_` prefix. Keep private keys, API secrets, and service-role credentials out of source control and browser bundles.

## Project layout

- `src/pages/` — public pages and product workflows
- `src/components/` — reusable UI and product components
- `src/integrations/` — external integration code
- `supabase/` — Supabase configuration, migrations, and functions
- `scripts/` — build-time tooling
- `public/` — static assets

## Deployment

The app is deployed on Vercel. The `build` script runs Vite followed by a prerender script. Changes affecting application behavior should be validated with `lint`, `test`, and `build` before deployment.

---

This repository is the **career-platform** codebase. The older [AuraPal repository](https://github.com/Ankycritica/AuraPal) is a separate, earlier project.
