import { Rocket } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function StartupValidator() {
  return (
    <>
      <title>Startup Idea Validator — AuraPal | Free AI Idea Score</title>
      <meta name="description" content="Get your startup idea brutally validated by AI. Score, market analysis, red flags, and a 90-day go-to-market plan. Free." />
      <ToolPage
        title="Startup Idea Validator 🚀"
        description="Get a brutal AI score on your idea — before you quit your job."
        icon={Rocket}
        toolSlug="startup-validator"
        accentColor="#A78BFA"
        generateLabel="Validate My Idea 🚀"
        fields={[
          { id: "idea", label: "Your Idea (1-2 sentences)", placeholder: "e.g. An AI tool that auto-generates LinkedIn posts from your daily Slack messages.", type: "textarea" },
          { id: "audience", label: "Target Audience", placeholder: "e.g. B2B SaaS founders, early-stage marketers" },
          { id: "problem", label: "Problem It Solves", placeholder: "e.g. Founders never have time to post on LinkedIn but know they should.", type: "textarea" },
          { id: "monetization", label: "How Will You Make Money?", placeholder: "e.g. $19/mo subscription", required: false },
        ]}
        systemPrompt={`You are a YC-grade startup advisor + product strategist who has reviewed thousands of pitches. You are honest, sharp, and don't waste words. Your job is to validate or kill ideas — fast.

Return a Markdown report with this EXACT structure:

## 🎯 Idea Score: X / 100
A bold one-line verdict ("Worth building." / "Pivot before you waste a year." / "Strong concept, weak execution path."). Make it quotable.

Break the score down:
- Problem severity: __ / 25
- Market size: __ / 25
- Differentiation: __ / 25
- Monetization clarity: __ / 25

## 🟢 What's Actually Good
3-4 bullet points calling out the real strengths. Be specific.

## 🚩 What Will Kill This
3-5 brutal, specific risks. Name competitors, name the failure modes, name the founder traps. Don't hedge.

## 👥 Real Customer Profile
Define the EXACT first 100 customers in one paragraph: who they are, where they hang out, what they currently use, and what they'd pay for relief.

## 💰 Realistic Pricing & Revenue Math
- Suggested pricing: [number] / month
- Path to first $10K MRR: [concrete steps]
- Year 1 realistic ARR: [range]

## 🛠️ MVP in 14 Days
List the absolute minimum scope to test demand. No fluff, no nice-to-haves. Each line should be a thing a founder ships.

## 📈 90-Day Go-to-Market Plan
- Week 1-2: [action]
- Week 3-6: [action]
- Week 7-12: [action]
End with the metric to watch.

## 🔥 The Honest Take
One paragraph, no sugar coating. Should they actually build this? Yes / No / Pivot — and why.

Tone: punchy, specific, sometimes cheeky. Be the friend who tells them the truth before VCs do.`}
        buildUserPrompt={(v) => `Startup idea: ${v.idea}\nTarget audience: ${v.audience}\nProblem: ${v.problem}\nMonetization plan: ${v.monetization || "not specified yet"}`}
        seoContent={
          <div className="glass-card p-6 mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold">Startup Idea Validator — Brutally Honest AI Feedback</h2>
            <p className="text-sm text-muted-foreground">Before you quit your job or burn savings, get your startup idea validated by an AI trained on YC-grade frameworks. Get a score out of 100, market sizing, the real risks, an MVP scope you can build in 14 days, and a 90-day go-to-market plan. Free.</p>
          </div>
        }
      />
    </>
  );
}
