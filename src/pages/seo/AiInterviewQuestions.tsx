import { SeoLandingLayout } from "./SeoLandingLayout";

export default function AiInterviewQuestions() {
  return (
    <SeoLandingLayout
      metaTitle="AI Interview Questions Generator — Free Practice with Answer Frameworks"
      metaDescription="Generate the interview questions you're likely to get for a specific role and company, with STAR answer frameworks built from your own experience. Free."
      keywords="ai interview questions generator, interview prep ai free, mock interview questions, behavioral interview questions, star method answers, interview practice tool"
      badge="Free AI Interview Prep"
      h1="Practice the interview questions you'll actually get"
      subhead="Give AuraPal the role, the company and the job description. It predicts the behavioral, technical and role-specific questions, then helps you build STAR answers from your real experience."
      ctaTo="/interview-prep"
      ctaLabel="Prep my interview free"
      benefits={[
        "Questions tailored to the role, seniority and job description",
        "Behavioral, technical and 'why us' questions in one set",
        "STAR answer frameworks using your own examples",
        "Follow-up questions interviewers ask when an answer is vague",
        "Ask the chat to pressure-test any answer",
        "Free, no credit card",
      ]}
      exampleTitle="What an interview prep set looks like"
      exampleOutput={`Role: Product Manager · Fintech · Mid-level

Likely behavioral question
"Tell me about a time you shipped something users didn't adopt."

STAR framework (from your notes)
S — Budgeting feature at Contoso, 4% adoption after launch
T — Find out why within two sprints
A — 12 user calls; found the entry point was buried in Settings
R — Moved it to the home screen; adoption rose to 19% in 6 weeks

Likely follow-up
"What would you do differently before launch?"
Have a one-sentence answer ready: validate the entry point with five users first.`}
      faq={[
        { q: "Is the interview prep tool free?", a: "Yes. Every AuraPal tool is free with no paid plan. Sign in with Google to use it." },
        { q: "What is the STAR method?", a: "Situation, Task, Action, Result — a structure for behavioral answers that keeps them specific and short. Spend most of your time on Action and Result." },
        { q: "Can it prepare me for technical interviews?", a: "It generates role-specific technical questions and outlines strong answers. For live coding practice, pair it with a dedicated coding platform." },
        { q: "How many questions should I prepare?", a: "Six to eight solid stories cover most behavioral interviews, because one good story can answer several questions." },
      ]}
    />
  );
}
