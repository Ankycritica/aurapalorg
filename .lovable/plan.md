# Million-Dollar Polish Pass

Apple/Framer cinematic feel, applied **additively** to the existing dark glassmorphism system. No component rebuilds. No prompt or business logic changes. Inter + Space Grotesk preserved.

---

## 1. Signature element — Aurora Mesh Background

New `<AuroraBackground />` component:
- 3 large soft radial gradients (primary / accent / violet) that drift on a 30–40s loop using `transform` + `filter: blur(120px)` (GPU-cheap).
- Fixed, behind everything, `pointer-events:none`, masked to fade at edges.
- Reduced-motion users get a static version.
- Mounted once in `AppLayout` and `Landing` so the same aurora bleeds through every page → instant brand recognition.

Plus subtle **noise/grain overlay** (8% opacity SVG) on top — kills banding, adds the "expensive" film texture Apple uses.

## 2. Design token refinements (additive)

In `index.css` / `tailwind.config.ts`:
- Add **elevation scale**: `--shadow-sm/md/lg/glow/inset-glow` using layered shadows (one tight, one wide, one colored).
- Add **type scale tokens**: `--display-xl/lg/md` with tighter letter-spacing for headlines.
- Add **radius scale**: `--radius-card`, `--radius-pill`, `--radius-input`.
- Add **easings**: `--ease-spring`, `--ease-out-expo` — used by all new motion.

No existing tokens removed.

## 3. Motion primitives (one shared file)

`src/lib/motion.ts`:
- `fadeUp`, `fadeIn`, `staggerChildren`, `springIn` framer-motion variants.
- `useReveal()` hook → `whileInView` + `viewport={{ once: true, margin: "-80px" }}` for scroll-driven reveals.
- Used wherever sections enter the viewport.

## 4. Landing upgrades (`HeroSection`, `StatsSection`, `ComparisonTable`, `FAQSection`)

- Hero: **bigger display type** (clamp), gradient text on the keyword, **animated word-by-word reveal** on the H1, parallax aurora behind it.
- Sub-headline gets a subtle typewriter cursor on the first paint.
- CTA buttons: gradient sweep + spring scale on hover, subtle shadow glow that follows cursor.
- Stats counters: **count-up animation** when scrolled into view.
- Sections separated with a thin gradient divider instead of hard borders.
- Each section reveals with `useReveal()`.

## 5. App shell polish (`AppLayout`, `AppSidebar`, `UsageBadge`)

- Sidebar items get an **animated active indicator** (a sliding pill behind the active row, framer-motion `layoutId`).
- Hover: 200ms background fade + 1px translate-x.
- Top nav: glass blur with a hairline gradient bottom border.
- `UsageBadge` progress bar gets a **shimmer sweep** when remaining ≤ 2.
- Page transitions: `AnimatePresence` wrapper around `<Routes>` for a 200ms cross-fade between pages.

## 6. Tool page polish (`ToolPage`)

- Inputs: focus ring becomes a **soft glow** (box-shadow, not ring) in the brand gradient.
- Generate button gets the cursor-following glow.
- Loading skeleton: **shimmer** keyframe instead of plain pulse.
- Result panel: subtle **scale-in + slide-up** entry, sticky action toolbar that gets a backdrop blur on scroll.
- Markdown styles: tighter prose, gradient bullets for top-level lists, lift on hover for action chips.

## 7. Dashboard polish (`Dashboard`)

- Greeting line uses display-xl with gradient on user's first name.
- Tool cards: tilt-on-hover (subtle 3D), inner border highlight on hover, icon micro-bounce.
- Empty states get an illustrated glyph + one-line copy.

## 8. Accessibility & perf guardrails

- All new motion respects `prefers-reduced-motion`.
- Aurora uses `will-change: transform` only while visible.
- No new dependencies — uses framer-motion (already installed).
- No layout shift; all entrance animations are opacity + translate only.

---

## Out of scope (locked by memory)

- No font changes. No light mode. No new brand messaging. No business-logic / prompt changes. No component rebuilds.

## Files touched (estimate)

**New:** `AuroraBackground.tsx`, `lib/motion.ts`, `lib/useReveal.ts`
**Edited:** `index.css`, `tailwind.config.ts`, `AppLayout.tsx`, `AppSidebar.tsx`, `UsageBadge.tsx`, `ToolPage.tsx`, `Dashboard.tsx`, `landing/HeroSection.tsx`, `landing/StatsSection.tsx`, `landing/ComparisonTable.tsx`, `landing/FAQSection.tsx`, `pages/Landing.tsx`

After approval I'll ship it in one pass and verify the build.
