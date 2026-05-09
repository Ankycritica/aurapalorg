## Cinematic Landing Overhaul — Noir & Gold

Modernize **only the landing page** (`/`) with a cinematic video hero, oversized editorial typography, and scroll-driven storytelling. Zero changes to dashboard, tools, auth, AI prompts, or pricing logic.

### Visual direction

- **Palette (landing-scoped only, not global tokens):** Noir black `#0d0d0d` → `#1a1a1a` base, Gold `#c9a84c` primary accent, Champagne `#f0d78c` highlight, off-white `#f5f0e0` for body text. Existing app-wide Midnight Indigo theme stays untouched everywhere else.
- **Typography:** Keep Inter for body. Add **Fraunces** (variable serif, Google Fonts) for the hero display — oversized, tight tracking, optical-size enabled. Used only on landing.
- **Mood:** Apple keynote × luxury fashion editorial. Heavy negative space, slow reveals, single gold accent line, cinematic letterboxing on hero.

### What gets built

**1. Hero video background**
- Generate a seamless 10s loop via `videogen--generate_video`: slow-drifting black silk with refracted gold light streaks, subtle particle dust, shallow depth of field, 1920×1080, no text.
- Saved to `src/assets/hero-loop.mp4`. Autoplay muted loop, `playsInline`, `preload="metadata"`, `<video>` with `poster` (first-frame still via imagegen) so initial paint isn't blank.
- Layered above: vignette gradient + 60% noir overlay + animated gold-grain SVG noise for filmic texture.
- Reduced-motion fallback: static poster image only.
- Mobile: serve poster image instead of video (bandwidth + battery).

**2. Hero typography & copy treatment**
- Massive Fraunces display headline (clamp 56–144px) split into 3 lines with per-word stagger reveal (framer-motion, blur-to-sharp + y-translate, 80ms stagger).
- Thin gold hairline divider (1px, animates width 0→120px on mount).
- Eyebrow kicker in tracked uppercase Inter, gold.
- Subhead in champagne off-white, max-width 52ch.
- Two CTAs: primary gold pill ("Start free →"), ghost ("See how it works") — both with magnetic hover.

**3. Scroll-driven sections (replace existing flat layout)**
- **Sticky reveal** — pinned section where each tool name fades in/out as you scroll (uses existing tool list, no new content).
- **Bento "Capabilities"** — 3×2 grid, asymmetric tile sizes, gold border on hover, parallax inner content.
- **Comparison table & FAQ** — kept, restyled to noir+gold.
- **Closing cinematic** — full-bleed dark frame with single oversized gold word ("Begin.") + CTA.

**4. Micro-interactions**
- Magnetic buttons (cursor-follow translate within 8px radius)
- Cursor-tracked gold glow on hero
- Section entrance: IntersectionObserver + framer-motion fade-up, staggered
- Smooth scroll via Lenis (lightweight, ~3KB gzipped)

### Files

**Created**
- `src/assets/hero-loop.mp4` — videogen output (10s, 1080p, 16:9)
- `src/assets/hero-poster.jpg` — imagegen still for poster/mobile fallback
- `src/components/landing/CinematicHero.tsx` — replaces `HeroSection` usage on landing
- `src/components/landing/StickyToolReveal.tsx`
- `src/components/landing/BentoCapabilities.tsx`
- `src/components/landing/ClosingFrame.tsx`
- `src/components/landing/MagneticButton.tsx`
- `src/lib/useLenis.ts` — smooth scroll hook (landing-only mount)
- `src/styles/landing.css` — Fraunces font-face import, noir tokens scoped under `.landing-noir` class so it can't leak

**Modified**
- `src/pages/Landing.tsx` — wraps content in `<div className="landing-noir">`, swaps section order, mounts Lenis, keeps existing SEO/meta intact
- `index.html` — preload Fraunces + hero-poster

**Untouched**
- All routes other than `/`
- `index.css` global tokens, `tailwind.config.ts` color tokens
- Dashboard, sidebar, all tool pages, AI prompts, edge functions, auth, Stripe, memory rules

### Performance budget

- Hero video ≤ 2.5 MB (H.264, CRF 28, 24fps, no audio track)
- Poster JPG ≤ 120 KB
- Lenis adds ~3 KB gzipped
- Lighthouse target: LCP < 2.5s on 4G (poster paints instantly, video swaps in)

### Out of scope

- Dashboard / app shell visuals
- Tool page redesign
- New copy or messaging changes (reuse current strings)
- Any backend, schema, or AI changes
