/**
 * Generate one 1200x630 Open Graph image per prerendered public page, so a
 * shared link previews with that page's own headline instead of the generic
 * homepage card.
 *
 * Not part of `npm run build` (Vercel has no browser). Run it locally after a
 * build whenever a page or post is added, commit the PNGs, then build again:
 *
 *   npm run build
 *   PLAYWRIGHT_MODULE=/path/to/node_modules/playwright \
 *     node scripts/generate-og-images.mjs [--chromium /opt/pw-browsers/chromium] [--force]
 *   npm run build
 *
 * Source of truth is dist/: each page's canonical URL and fallback <h1>, which
 * prerender.mjs writes from the same route list it uses for the sitemap.
 * Output: public/og/<name>.png, where <name> = ogName(path) below. Existing
 * files are kept unless --force is passed. The homepage card is also copied to
 * public/og-image.png, the site-wide default.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "public", "og");

/** Keep in sync with ogName() in prerender.mjs. */
export const ogName = (path) => (path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-"));

const args = process.argv.slice(2);
const force = args.includes("--force");
const chromiumIdx = args.indexOf("--chromium");
const executablePath = chromiumIdx >= 0 ? args[chromiumIdx + 1] : undefined;

const decode = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pages() {
  const found = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { if (f !== "assets") walk(p); continue; }
      if (f !== "index.html") continue;
      const html = readFileSync(p, "utf8");
      const canon = html.match(/<link rel="canonical" href="https:\/\/www\.aurapal\.org([^"]*)"/);
      const h1 = html.match(/<div id="root"><main[^>]*><h1[^>]*>([\s\S]*?)<\/h1>/);
      if (canon && h1) found.push({ path: canon[1] || "/", title: decode(h1[1]) });
    }
  };
  walk(DIST);
  return found.sort((a, b) => a.path.localeCompare(b.path));
}

function kicker(path) {
  if (path === "/") return "Free AI career tools";
  if (path.startsWith("/blog/")) return "Career guide";
  if (["/about", "/features", "/blog"].includes(path)) return "AuraPal";
  return "Free tool";
}

const logo = `data:image/png;base64,${readFileSync(join(ROOT, "public", "logo.png")).toString("base64")}`;

function card({ path, title }) {
  const size = title.length > 60 ? 60 : title.length > 40 ? 70 : 84;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#050505;color:#fff;
  font-family:"Inter Display","Inter",system-ui,sans-serif;position:relative}
.grid{position:absolute;inset:0;opacity:.05;
  background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);
  background-size:60px 60px}
.wrap{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:14px;font-size:26px;font-weight:600}
.brand img{width:44px;height:44px;border-radius:10px}
.kicker{margin-top:auto;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:22px}
h1{font-size:${size}px;line-height:1.06;letter-spacing:-.03em;font-weight:700;max-width:1040px}
.foot{margin-top:44px;padding-top:24px;border-top:1px solid rgba(255,255,255,.14);display:flex;justify-content:space-between;
  font-size:22px;color:rgba(255,255,255,.62)}
</style></head><body><div class="grid"></div><div class="wrap">
<div class="brand"><img src="${logo}" alt=""><span>AuraPal</span></div>
<p class="kicker">${esc(kicker(path))}</p>
<h1>${esc(title)}</h1>
<div class="foot"><span>www.aurapal.org</span><span>Free · No credit card</span></div>
</div></body></html>`;
}

if (!existsSync(DIST)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

const mod = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(join(process.env.PLAYWRIGHT_MODULE, "index.mjs")).href)
  : await import("playwright").catch(() => {
      console.error("Playwright not found. Install it outside the repo and set PLAYWRIGHT_MODULE to its path.");
      process.exit(1);
    });
const { chromium } = mod.default ?? mod;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let made = 0;
for (const p of pages()) {
  const file = join(OUT, `${ogName(p.path)}.png`);
  if (existsSync(file) && !force) continue;
  await page.setContent(card(p), { waitUntil: "load" });
  await page.screenshot({ path: file, type: "png" });
  made++;
  console.log("og", p.path, "->", `public/og/${ogName(p.path)}.png`);
}
await browser.close();

const home = join(OUT, "home.png");
if (existsSync(home)) copyFileSync(home, join(ROOT, "public", "og-image.png"));
console.log(`generated ${made} image(s)`);
