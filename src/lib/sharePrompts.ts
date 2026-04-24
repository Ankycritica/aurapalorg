import { parseSalaryData } from "@/components/SalaryBar";

const SITE = "https://aurapal.org";

function clean(text: string): string {
  return text
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^>\s*/gm, "")
    .trim();
}

function formatCurrency(amount: number, symbol: string): string {
  if (amount >= 1000) return `${symbol}${Math.round(amount / 1000)}K`;
  return `${symbol}${Math.round(amount)}`;
}

function extractScore(result: string): number | null {
  const m = result.match(/(\d{1,3})\s*\/\s*100/);
  return m ? parseInt(m[1], 10) : null;
}

export interface SharePromptInput {
  toolSlug: string;
  toolTitle: string;
  result: string;
  inputs: Record<string, string>;
  refLink: string;
}

// ────────────────────────── LinkedIn ──────────────────────────

export function buildLinkedInPost({ toolSlug, toolTitle, result, inputs, refLink }: SharePromptInput): string {
  if (toolSlug === "salary-check") {
    const sd = parseSalaryData(result, inputs);
    if (sd) {
      const role = inputs.role || "my role";
      const loc = inputs.location ? ` in ${inputs.location}` : "";
      const exp = inputs.experience ? ` with ${inputs.experience} of experience` : "";
      const diffStr = formatCurrency(Math.abs(sd.diffFromMedian), sd.symbol);
      const verb = sd.diffFromMedian < 0 ? "BELOW" : "ABOVE";
      const emoji = sd.diffFromMedian < 0 ? "💸" : "🏆";

      return `Just found out I'm earning ${diffStr} ${verb} the market median for ${role}${loc}${exp}. ${emoji}

AuraPal's free AI salary check told me in 15 seconds what my company has been hiding for years.

Market data for my role:
• P25: ${formatCurrency(sd.p25, sd.symbol)}
• Median: ${formatCurrency(sd.p50, sd.symbol)}
• P75: ${formatCurrency(sd.p75, sd.symbol)}
• P90: ${formatCurrency(sd.p90, sd.symbol)}

If you haven't checked your market rate recently, you're probably leaving money on the table too.

Free check → ${refLink}

#salary #careergrowth #compensation #underpaid`;
    }
  }

  if (toolSlug === "linkedin-roaster" || toolSlug === "resume-roast") {
    const score = extractScore(result);
    const what = toolSlug === "linkedin-roaster" ? "my LinkedIn profile" : "my resume";
    if (score !== null) {
      return `I let an AI roast ${what}.

It scored me ${score}/100. 🔥

The feedback was brutal — and exactly what I needed to hear. Recruiters were silently scrolling past for reasons I couldn't see.

If you're job-hunting and getting ghosted, run yours through this. Free, takes 30 seconds:

→ ${refLink}

#careeradvice #jobsearch #linkedin`;
    }
  }

  if (toolSlug === "startup-validator") {
    const score = extractScore(result);
    if (score !== null) {
      return `I asked AI to score my startup idea before I quit my job.

Score: ${score}/100. 🚀

The breakdown of market size, competition, and execution risk was sharper than most VC pitch reviews I've read.

If you've got an idea you're scared to share, validate it first. Free, instant, brutally honest:

→ ${refLink}

#startup #founders #entrepreneurship`;
    }
  }

  // Generic fallback
  const stripped = clean(result);
  const lines = stripped.split("\n").filter(l => l.trim().length > 0);
  const hook = `I just used AuraPal's ${toolTitle} and the result blew my mind 🤯`;
  const body = lines.slice(0, 12).join("\n");
  return `${hook}

${body}

---

If you're working on your career, this is a goldmine.
Try it free → ${refLink}

#CareerGrowth #AI #AuraPal`;
}

// ────────────────────────── Twitter / X ──────────────────────────

export function buildTwitterThread({ toolSlug, toolTitle, result, inputs, refLink }: SharePromptInput): string[] {
  if (toolSlug === "salary-check") {
    const sd = parseSalaryData(result, inputs);
    if (sd) {
      const role = inputs.role || "my role";
      const loc = inputs.location ? ` in ${inputs.location}` : "";
      const diffStr = formatCurrency(Math.abs(sd.diffFromMedian), sd.symbol);
      const verb = sd.diffFromMedian < 0 ? "BELOW" : "ABOVE";

      return [
        `Just used AI to check if I'm underpaid.

The result: I'm earning ${diffStr} ${verb} the market median for ${role}. 💸

Thread 🧵`,
        `Market data for ${role}${loc}:

📊 P25: ${formatCurrency(sd.p25, sd.symbol)}
📊 Median: ${formatCurrency(sd.p50, sd.symbol)}
📊 P75: ${formatCurrency(sd.p75, sd.symbol)}
📊 P90: ${formatCurrency(sd.p90, sd.symbol)}+

I'm at ${formatCurrency(sd.user, sd.symbol)} — ${sd.percentile}.`,
        `Checked it with @AuraPal — free AI salary benchmark in 15 seconds.

Brutal. Honest. Free.

→ ${refLink}`,
      ];
    }
  }

  if (toolSlug === "linkedin-roaster" || toolSlug === "resume-roast") {
    const score = extractScore(result);
    const what = toolSlug === "linkedin-roaster" ? "LinkedIn profile" : "resume";
    if (score !== null) {
      return [
        `I let an AI roast my ${what}.

It scored me ${score}/100. 🔥

This is why recruiters have been ghosting me. Thread 🧵`,
        `The AI flagged things I never noticed:

— Weak hooks
— Vague impact
— Buzzword overload

Reading it felt like getting career advice from a brutally honest mentor.`,
        `Run yours through the same tool — free, takes 30 seconds:

→ ${refLink}

#jobsearch #careeradvice`,
      ];
    }
  }

  if (toolSlug === "startup-validator") {
    const score = extractScore(result);
    if (score !== null) {
      return [
        `I asked AI to score my startup idea before quitting my job.

Score: ${score}/100. 🚀

Thread 🧵`,
        `It broke down:

— Market size
— Competition
— Differentiation
— Execution risk

…cleaner than half the VC reviews I've seen.`,
        `Validate yours before you build:

→ ${refLink}

#startup #founders`,
      ];
    }
  }

  // Generic fallback — chunk into ~240 char tweets
  const stripped = clean(result);
  const sentences = stripped.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const tweets: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).length > 240) {
      if (buf) tweets.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  if (buf) tweets.push(buf.trim());

  const hook = `Used AuraPal's ${toolTitle} today. The output is too good not to share 🧵👇`;
  const outro = `Try the same tool free → ${refLink}`;
  return [hook, ...tweets.slice(0, 6), outro];
}

export const SHARE_SITE_URL = SITE;
