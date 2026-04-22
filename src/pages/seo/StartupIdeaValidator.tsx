import { SeoLandingLayout } from "./SeoLandingLayout";

export default function StartupIdeaValidator() {
  return (
    <SeoLandingLayout
      metaTitle="Free Startup Idea Validator — Score Your Idea 0–100 in 30s | AuraPal"
      metaDescription="Validate your startup idea in 30 seconds. AI scores market size, competition, monetization & defensibility — then gives you a 14-day MVP plan. Free forever."
      keywords="startup idea validator, validate startup idea, MVP plan, startup scoring, idea feedback"
      badge="Free Startup Idea Validator"
      h1="Validate your startup idea in 30 seconds — score, MVP plan, GTM"
      subhead="Stop building things nobody wants. Our AI scores your idea 0–100 across market, competition, monetization, and moat — then hands you a 14-day MVP scope and a 90-day GTM plan."
      ctaTo="/startup-validator"
      ctaLabel="Validate my idea free"
      benefits={[
        "0–100 score across 6 founder-grade dimensions",
        "Honest red flags (the ones your friends won't tell you)",
        "14-day MVP scope: ship the smallest testable thing",
        "90-day go-to-market plan with channels & milestones",
        "Competitor map + your wedge to win",
        "Pricing model recommendation with rationale",
      ]}
      exampleTitle="What an idea validation looks like"
      exampleOutput={`Idea: "Slack for dentists — practice management chat tool"

Score: 62 / 100 — "Real problem, crowded space. Win on niche depth."

📊 The breakdown
• Market size:        7 / 10  — ~200K dental practices in the US, $2K+/yr willingness to pay
• Pain intensity:     8 / 10  — Practices use email + paper for staff coord. Painful.
• Competition:        4 / 10  — Weave, Dentrix already dominate. Hard to displace.
• Monetization:       7 / 10  — SaaS works here. $99–$299/practice/mo viable.
• Defensibility:      5 / 10  — Workflow + integrations create switching costs over time.
• Founder fit:        ?       — Add your background to refine.

🚩 Red flags
1. Competing with Weave is a war you'll lose head-on. Pick a wedge.
2. Dentists are slow buyers. Plan for 3–6 mo sales cycles.

🎯 14-day MVP scope
Day 1–3:   Interview 10 dentists. Don't build.
Day 4–7:   Wireframe 3 core flows: shift swap, intra-team chat, lab order updates.
Day 8–12:  Build a no-code prototype (Glide / Softr) for one practice.
Day 13–14: Ship to 1 paying pilot at $199/mo. One. Not ten.

🚀 90-day GTM
Month 1:  10 pilot calls, 2 paying pilots
Month 2:  3 paying customers, build referral motion
Month 3:  10 paying customers, $2K MRR, hire first SDR or stay solo

Want the full 12-page validation report with founder questions to answer? Generate yours.`}
      testimonial={{
        quote: "Got a 38/100 on my idea. Saved me from quitting my job to build it. Tried again with a sharper version — scored 81. Now we're at $7K MRR.",
        name: "Priya M.",
        role: "Founder",
      }}
      faq={[
        { q: "Is the validator really free?", a: "Yes. Free plan: 5 validations per day. No credit card." },
        { q: "How accurate is the score?", a: "It's a directional founder-grade rubric — not a guarantee. But it surfaces the same red flags experienced VCs and product mentors look for. Treat it as a smart second opinion." },
        { q: "Will it suggest pivots?", a: "Yes. Each report includes wedge suggestions and a sharper version of your idea if the original scores low." },
        { q: "Can I validate multiple ideas?", a: "Absolutely — most founders run 3–5 versions before committing. That's the point." },
      ]}
    />
  );
}
