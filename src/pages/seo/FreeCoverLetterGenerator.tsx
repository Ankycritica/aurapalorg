import { SeoLandingLayout } from "./SeoLandingLayout";

export default function FreeCoverLetterGenerator() {
  return (
    <SeoLandingLayout
      metaTitle="Free AI Cover Letter Generator — Tailored to the Job in 30 Seconds"
      metaDescription="Free AI cover letter generator. Paste the job description and your background and get a specific, non-generic cover letter in under a minute. No credit card."
      keywords="free cover letter generator, ai cover letter generator, cover letter writer free, cover letter for job application, tailored cover letter ai"
      badge="Free AI Cover Letter Generator"
      h1="A cover letter written for this job, not every job"
      subhead="Paste the job description and a few lines about yourself. AuraPal pulls the two or three things this employer cares about most and writes a short letter that answers them directly."
      ctaTo="/cover-letter"
      ctaLabel="Write my cover letter free"
      benefits={[
        "Reads the job description and leads with what that employer is asking for",
        "Under 300 words — the length hiring managers actually finish",
        "Uses your real achievements, not filler like 'passionate team player'",
        "Three tones: direct, warm, or formal",
        "Edit, regenerate, or ask the built-in chat to rewrite a paragraph",
        "Free, no credit card, no paid tier",
      ]}
      exampleTitle="What a generated letter looks like"
      exampleOutput={`Dear Hiring Team at Northwind,

Your posting for a Product Analyst asks for someone who can turn messy event data into decisions a PM will act on. That has been most of my last two years.

At Contoso I rebuilt our activation funnel from raw Segment events and found that 38% of new users stalled on one permissions screen. The fix we shipped lifted week-one activation from 41% to 52%.

You also mention SQL and dbt. I maintain 60+ dbt models in production and wrote the team's testing conventions.

I'd welcome 20 minutes to talk about what your onboarding data looks like today.

Best,
Priya Shah`}
      faq={[
        { q: "Is the cover letter generator free?", a: "Yes. Every AuraPal tool is free, with no credit card and no paid plan. Sign in with Google to use it." },
        { q: "Will it sound like AI wrote it?", a: "It is prompted to avoid stock phrases and to use the specific achievements you give it. The more concrete your input, the less generic the letter." },
        { q: "Can I edit the letter?", a: "Yes. Edit it directly, regenerate it, or ask the chat under the result to rewrite a specific paragraph." },
        { q: "Do I still need a cover letter in 2026?", a: "Many applications make it optional, but a short, specific letter still helps when you are changing fields or the role gets hundreds of applicants." },
      ]}
    />
  );
}
