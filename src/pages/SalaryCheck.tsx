import { DollarSign } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { aiFetch } from "@/lib/aiFetch";

/**
 * Pull real advertised-salary percentiles before generating. Without this the
 * model invents P25/P50/P75/P90 from training data — numbers that read as
 * authoritative but are guesses, on the one tool where people may act on them.
 */
async function fetchMarketData(v: Record<string, string>): Promise<string> {
  const resp = await aiFetch("salary-data", { role: v.role, location: v.location });
  if (!resp.ok) return "";
  const d = await resp.json();
  if (!d?.available) {
    return "MARKET DATA: unavailable for this role/location. Say so plainly in the report — state that the ranges below are estimates from general market knowledge, not live data, and that the user should verify before negotiating.";
  }
  const fmt = (n: number) => `${d.currency} ${Math.round(n).toLocaleString()}`;
  return [
    "MARKET DATA (real, from live job listings — use THESE figures, do not invent your own):",
    `Source: ${d.source} (${d.country}), ${d.sampleSize.toLocaleString()} postings`,
    `P25: ${fmt(d.p25)}`,
    `P50 (median): ${fmt(d.p50)}`,
    `P75: ${fmt(d.p75)}`,
    `P90: ${fmt(d.p90)}`,
    "Cite the source and sample size in the Market Benchmark section.",
  ].join("\n");
}

export default function SalaryCheck() {
  return (
    <>
      <title>Am I Underpaid? — AuraPal | Free AI Salary Check</title>
      <meta name="description" content="Find out if you're underpaid. AI-powered salary benchmarking based on your role, location, and experience. Free, instant, share-worthy." />
      <ToolPage
        title="Am I Underpaid? 💸"
        description="AI-powered salary benchmark in 15 seconds. Spoiler: probably yes."
        icon={DollarSign}
        toolSlug="salary-check"
        accentColor="#22D3A0"
        generateLabel="Check My Salary 💰"
        fields={[
          { id: "role", label: "Your Role", placeholder: "e.g. Senior Frontend Engineer" },
          { id: "experience", label: "Years of Experience", placeholder: "e.g. 5 years" },
          { id: "location", label: "Location", placeholder: "e.g. London, UK / Remote (US)" },
          { id: "currentSalary", label: "Your Current Salary (with currency)", placeholder: "e.g. £55,000 / $90,000" },
          { id: "company", label: "Company Type", placeholder: "e.g. Series B startup, FAANG, agency", required: false },
        ]}
        systemPrompt={`You are a brutally honest compensation analyst. You speak plainly and don't sugarcoat.

DATA RULE — this overrides everything below. The user prompt may include a MARKET DATA block with real percentiles from live job listings. When present, use those exact figures in the Market Benchmark section and cite the source and sample size. Never substitute your own. When the block says data is unavailable, give your best estimate but state clearly at the top of the report that the figures are estimates from general market knowledge rather than live data.

Return a Markdown report with this EXACT structure:

## 💸 The Verdict
One bold sentence: are they underpaid, fairly paid, or overpaid? Use the user's own currency. Make it quotable and share-worthy.

## 📊 Market Benchmark
- Bottom 25% (P25): [number]
- Median (P50): [number]
- Top 25% (P75): [number]
- Top 10% (P90): [number]

Immediately below the list, add one italic line naming the data source and sample size (or stating these are estimates if no live data was supplied).

## 🎯 Where You Sit
A short, punchy paragraph explaining their percentile and what that means in plain English. Include a single emotional line they could screenshot ("You're earning $X less than the market median for your role.").

## 🚩 Red Flags / 🟢 Green Flags
Bullet list of 3-5 things from their inputs that justify or undercut their current pay (location cost-of-living, company stage, experience level, role scarcity, etc.).

## 💼 What To Ask For
- Realistic ask in next negotiation: [number with currency]
- Stretch ask: [number with currency]
- Walk-away offer to consider new roles: [number]

## 🗣️ Negotiation Script
Give them a 2-3 sentence script they can copy-paste in their next 1:1 with their manager or recruiter. Make it confident, specific, and grounded in market data.

## 🚀 Next Steps
3-4 concrete actions to close the gap in the next 90 days.

Tone: confident, data-driven, slightly cheeky. No hedging on judgement — but never overstate the certainty of the numbers themselves. Be straight about where they came from.`}
        enrichPrompt={fetchMarketData}
        buildUserPrompt={(v) => `Role: ${v.role}\nExperience: ${v.experience}\nLocation: ${v.location}\nCurrent salary: ${v.currentSalary}\nCompany type: ${v.company || "not specified"}`}
        seoContent={
          <div className="glass-card p-6 mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold">Am I Underpaid? — AI Salary Benchmark</h2>
            <p className="text-sm text-muted-foreground">Stop guessing what you should earn. AuraPal's AI compares your salary against current market data for your role, location, and experience level — and tells you exactly how much to ask for in your next negotiation. Free, instant, and brutally honest.</p>
          </div>
        }
      />
    </>
  );
}
