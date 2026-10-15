import { SeoLandingLayout } from "./SeoLandingLayout";

export default function LinkedInProfileReview() {
  return (
    <SeoLandingLayout
      metaTitle="Free LinkedIn Profile Review — AI Score Out of 100 | AuraPal"
      metaDescription="Get a free AI LinkedIn profile review. Your headline, About section and experience scored out of 100 with specific rewrites recruiters respond to."
      keywords="linkedin profile review, free linkedin profile review, linkedin profile checker, linkedin headline generator, linkedin about section examples, linkedin profile optimization ai"
      badge="Free LinkedIn Profile Review"
      h1="Free LinkedIn profile review, scored out of 100"
      subhead="Paste your headline, About section and recent roles. AuraPal scores what a recruiter sees in the first five seconds and rewrites the parts that are costing you searches."
      ctaTo="/linkedin-roaster"
      ctaLabel="Review my profile free"
      benefits={[
        "Headline rewritten for recruiter search, not slogans",
        "About section restructured: who you help, proof, what you want next",
        "Experience entries checked for results vs. duties",
        "Keyword gaps for the roles you're targeting",
        "Honest score out of 100 with reasons",
        "Free, no credit card",
      ]}
      exampleTitle="What a LinkedIn review looks like"
      exampleOutput={`Score: 52 / 100 — "Busy, but says nothing"

Headline (current)
"Passionate professional | Lifelong learner | Open to opportunities"
Problem: zero searchable terms. Recruiters search titles and skills.

Headline (rewrite)
"Senior Data Analyst · SQL, dbt, Tableau · Turning product data into growth decisions"

About section
Your first line is "I am a results-driven professional". Lead with a result instead:
"I helped a 40-person SaaS team lift activation 11 points by finding where new users got stuck."`}
      faq={[
        { q: "Is the LinkedIn review free?", a: "Yes. Every AuraPal tool is free with no paid plan. Sign in with Google to use it." },
        { q: "Do I need to connect my LinkedIn account?", a: "No. You paste the text. AuraPal never logs into or posts to your LinkedIn." },
        { q: "What makes a good LinkedIn headline?", a: "Your target title, two or three skills recruiters search for, and one line of proof. Avoid adjectives like 'passionate' that nobody searches." },
        { q: "How long should the About section be?", a: "Three short paragraphs: what you do and for whom, two or three quantified results, and what you are looking for next." },
      ]}
    />
  );
}
