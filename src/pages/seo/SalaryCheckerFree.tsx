import { SeoLandingLayout } from "./SeoLandingLayout";

export default function SalaryCheckerFree() {
  return (
    <SeoLandingLayout
      metaTitle="Free Salary Checker — Am I Underpaid? AI Market Benchmark in 15s | AuraPal"
      metaDescription="Find out if you're underpaid in 15 seconds. Free AI salary checker compares your pay to market rates by role, location & experience. Get a negotiation script."
      keywords="free salary checker, am I underpaid, salary comparison, pay benchmark, salary negotiation tool"
      badge="Am I Underpaid? — Free Salary Checker"
      h1="Find out if you're underpaid in 15 seconds (free, no signup wall)"
      subhead="Stop wondering. Our AI compares your salary to market data for your role, location, and experience — then gives you a word-for-word negotiation script. Used by 10,000+ professionals."
      ctaTo="/salary-check"
      ctaLabel="Check my salary free"
      benefits={[
        "Market percentile: see exactly where your pay falls (10th–90th)",
        "Verdict: underpaid, fair, or above-market — no fluff",
        "Side-by-side comparison vs role/location averages",
        "Word-for-word negotiation script you can send today",
        "Counter-offer talking points based on your leverage",
        "Works for any role, industry, or country",
      ]}
      exampleTitle="What the salary check looks like"
      exampleOutput={`Verdict: 🚨 Underpaid by ~22%

Your salary: $78,000 (Senior Software Engineer · Austin, TX · 6 yrs)
Market 50th percentile: $98,000
Market 75th percentile: $112,000
You sit at: 28th percentile

📊 What this means
You're earning less than 7 out of 10 engineers with your title and tenure in your city. The biggest driver is below-market base pay — your benefits and bonus are roughly typical.

💬 Negotiation script (send this Monday)
"Hi [Manager],
I've been reviewing market compensation data for Senior Engineers in Austin with 6+ years of experience, and my current base of $78K is 22% below the 50th percentile of $98K. Over the past year I've shipped [X], led [Y], and impacted [Z metric]. I'd like to discuss adjusting my base to $96K, which is still slightly below market median. Could we set up 30 minutes this week?"

🎯 What to bring
1. Three quantified wins from the last 12 months.
2. A printed market band (use this report as your source).
3. A clear ask — not a range.

Want the full report with counter-offer scripts for each pushback? Generate yours.`}
      testimonial={{
        quote: "Used the negotiation script word-for-word. Got a $14K raise in two weeks. AuraPal paid for itself 700×.",
        name: "Marcus P.",
        role: "Senior Engineer",
      }}
      faq={[
        { q: "Is the salary checker really free?", a: "Yes. Free plan gives you 5 checks per day. No credit card, no signup wall." },
        { q: "Where does the salary data come from?", a: "We blend public compensation datasets with role/location/experience normalization. It's directional but reliable for negotiation prep." },
        { q: "Will my employer find out I checked?", a: "No. We never share or sell your data. Reports are private to your account." },
        { q: "Does it work outside the US?", a: "Yes. We support major markets globally — just enter your city or country." },
      ]}
    />
  );
}
