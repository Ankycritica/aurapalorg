export type Post = {
  slug: string;
  title: string;
  teaser: string;
  date: string;       // ISO
  /** Optional <title> override when "title — AuraPal" would exceed 60 chars. */
  seoTitle?: string;
  readingMinutes: number;
  tool?: { label: string; to: string };
  /** Lightweight markdown: ##, ###, **bold**, - bullets, 1. numbered, > quote */
  body: string;
};

export const posts: Post[] = [
  {
    slug: "ats-resume-guide",
    title: "What an ATS actually does to your resume",
    teaser:
      "Applicant tracking systems are parsers, not gatekeepers with opinions. Understanding what they can and cannot read explains most silent rejections.",
    date: "2026-09-16",
    readingMinutes: 7,
    tool: { label: "Score your resume", to: "/resume-roast" },
    body: `
Most resume advice about ATS is written by people who have never seen one. The result is a folklore of rules — never use columns, never use a template, stuff in keywords — that is partly true, mostly stale, and rarely explained.

Here is what is actually happening.

## An ATS is a database, not a judge

An applicant tracking system is software a company uses to store and search applications. Greenhouse, Lever, Workday, iCIMS, Taleo. When you upload a resume, three things happen:

1. The file is **parsed** — converted from PDF or DOCX into structured fields: name, email, employment history, education, skills.
2. The parsed record is **stored** against the job requisition.
3. A recruiter **searches and filters** that database, usually by keyword and sometimes by knockout questions you answered in the form.

Note what is missing. In the overwhelming majority of setups there is no algorithm scoring you out of 100 and auto-rejecting you. The "75% ATS score" that resume tools sell you is not a number any real ATS produces.

The rejection is real. The mechanism is just more boring than the myth: **your resume parsed badly, so you never appeared in the recruiter's search results.**

## Where parsing actually fails

Parsers are pattern matchers. They look for conventional structures and give up gracefully — which is to say, silently — when they cannot find them.

**Dates in unusual formats.** \`2021–Present\` parses. \`'21 – now\` frequently does not. If the parser cannot read your dates, your years of experience come through as zero, and any filter on experience drops you.

**Job titles buried in prose.** A parser expects the title near the company and the dates. If your heading reads *"I spent three wonderful years at Acme doing product work"*, there is no title field to extract.

**Text inside images.** A resume exported as an image-based PDF — common when people export from design tools — contains no selectable text. The parser extracts nothing. This is the single most catastrophic failure, and it is invisible to you because the file looks perfect on screen.

**Headers and footers.** Some parsers ignore them entirely. Contact details placed only in a header can vanish.

**Tables and multi-column layouts.** Modern parsers handle these far better than they did five years ago, but reading order can still scramble. A two-column layout where the left column is skills and the right is experience sometimes interleaves into nonsense.

> A quick test: open your PDF, select all, copy, and paste into a plain text editor. What you see is roughly what the parser sees. If it is empty, jumbled, or missing your job titles, that is your problem — not your experience.

## Keywords: the part that is true

Recruiters search the database. If the requisition says *Kubernetes* and your resume says *container orchestration*, you will not appear in that search.

This is not an argument for keyword stuffing, which fails for a different reason: a human reads the resume once you surface, and a wall of comma-separated technologies reads as desperate.

The workable version is narrower:

- Use the **exact terminology from the job description** for the things you have genuinely done.
- Spell out acronyms once alongside the short form: *Search Engine Optimisation (SEO)*.
- Put your core tools in a dedicated **Skills** section, which parses cleanly into a structured field.
- Match the **job title language** where it is honest to do so. If you were a "Growth Engineer" applying to "Full Stack Engineer" roles, and the work was full stack, say so somewhere.

## What matters more than any of this

Once you surface in the search, a human spends a short time deciding. At that point formatting is irrelevant and content is everything.

The most common failure is bullets that describe duties rather than outcomes:

> Responsible for managing the company's social media accounts.

That sentence tells a reader nothing about whether you are any good. Compare:

> Grew the company's LinkedIn following from 2,000 to 18,000 in eleven months by shifting from product announcements to weekly engineering write-ups, which became the top source of inbound applications.

Same job. One version is a job description; the other is evidence. The structure underneath is simple: **what you achieved, measured how, by doing what.**

Most people resist this because they do not have clean metrics. You usually have more than you think — time saved, error rates, headcount supported, revenue influenced, tickets closed, cycle time. If a number genuinely does not exist, describe the scale and the change instead: *"rebuilt the onboarding flow used by every new customer, cutting setup from a week of back-and-forth to a same-day self-serve process."*

## A short checklist

- Export as a **text-based PDF**. Copy-paste test it.
- One column, conventional section headings: Experience, Education, Skills.
- Contact details **in the body**, not only the header.
- Dates as \`Mon YYYY – Mon YYYY\`.
- Mirror the job description's exact terms for things you have actually done.
- Every bullet: achievement, measure, method.
- Two pages maximum. One if you have under five years of experience.

None of this guarantees an interview. It removes the reasons you were never read.
`,
  },

  {
    slug: "linkedin-headline-mistakes",
    title: "Your LinkedIn headline is doing nothing",
    teaser:
      "Most headlines restate the job title the profile already shows. Here is what recruiters actually search for, and how to use the 220 characters you are given.",
    date: "2026-09-20",
    readingMinutes: 6,
    tool: { label: "Roast my LinkedIn", to: "/linkedin-roaster" },
    body: `
Your headline is the line under your name. It follows you into every search result, every comment you leave, every connection request. It is the most-viewed text you own on the platform, and most people leave it at whatever LinkedIn auto-filled.

## The default is wasted space

By default LinkedIn sets your headline to your current job title and company. Your profile already displays both, directly below, in the experience section. So the default spends your most valuable line repeating information the reader is about to see anyway.

You have around 220 characters. The default typically uses forty of them and communicates nothing new.

## What recruiters actually do

Recruiter search behaves like the ATS search described elsewhere on this blog: it is keyword matching over fields, and the headline is weighted heavily.

So the headline has two jobs, and they pull in slightly different directions:

1. **Be findable** — contain the terms someone would type when looking for a person like you.
2. **Be worth clicking** — say something the next hundred profiles do not.

Most advice optimises for one and ignores the other. A headline of nothing but keywords ranks well and reads like spam. A clever tagline reads well and never surfaces.

## The failure modes

**The restated title.** *"Software Engineer at Acme"* — findable, but identical to thousands of others and adds nothing.

**The vague aspiration.** *"Passionate about building great products | Lifelong learner"* — contains no searchable term and no evidence. Passion is not a differentiator; everyone claims it.

**The pipe soup.** *"Marketing Manager | Growth Hacker | Content Strategist | Coffee Lover | Dog Dad"* — the first three dilute each other, and the last two tell a hiring manager you had nothing more relevant to say.

**The open-to-work plea.** *"Seeking new opportunities in..."* — this reads as availability rather than capability. Use LinkedIn's Open To Work setting for that; it is a field, not a headline.

## A structure that works

Something like:

**[What you do] · [who you do it for or with what] · [evidence or specificity]**

Concrete examples:

> Backend engineer · Go and Postgres at scale · built the payments pipeline handling 2M daily transactions at Acme

> Product marketer for developer tools · turn technical docs into launches that sales can actually use

> Data analyst · SQL, dbt, Looker · I make dashboards executives open more than once

Each contains searchable terms. Each says something specific enough that a reader learns something they could not have guessed.

## The About section, briefly

The same discipline applies. The most common About section opens with *"I am a results-driven professional with a passion for..."* — a sentence that could belong to anyone in any field.

Open with something only you would write. A specific problem you like solving, a concrete thing you built, an opinion you hold about your craft. LinkedIn truncates after roughly three lines before the "see more" fold, so the hook has to land early.

End with what you want the reader to do — get in touch, view a portfolio, read your writing. Surprisingly few profiles say.

## The honest limit

A headline will not compensate for an absent track record, and no phrasing makes an unrelated background relevant. What it does is make sure the experience you do have gets found and read, instead of losing to someone less qualified who wrote a clearer line.

That is a small edge. It is also close to free, and it takes ten minutes.
`,
  },

  {
    slug: "salary-benchmark-negotiation",
    title: "How to find out if you're underpaid — and what to do about it",
    teaser:
      "Most salary advice assumes you already know your market rate. Here is how to establish it from real data, and how to raise it without ultimatums.",
    date: "2026-09-24",
    seoTitle: "How to Find Out If You're Underpaid — AuraPal",
    readingMinutes: 8,
    tool: { label: "Check my salary", to: "/salary-check" },
    body: `
Pay is the one number most affected by information asymmetry. Your employer knows what the role is budgeted at, what your peers earn, and what the market pays. You typically know one data point: your own salary.

Closing that gap is most of the work.

## Where real numbers come from

Treat sources by how close they are to an actual transaction.

**Job postings with disclosed ranges** are the strongest public signal. Pay transparency laws in several US states, and comparable rules elsewhere, now require employers to publish a range. That range is what the company is prepared to pay *today* for someone at your level in that location. Aggregators like Adzuna and Levels.fyi expose this at scale.

**Levels.fyi and similar self-reported databases** are good for large tech companies with structured levelling, weak for small firms and non-technical roles. Reporting skews toward people pleased with their offers.

**Glassdoor and Payscale** average across seniority and geography in ways that flatten real differences. Directionally useful, rarely precise.

**Recruiters** will often tell you the band for a live role if you ask directly. This is the least-used and most reliable source available to most people.

**AI salary estimates — including ours — are not data.** A language model has no live compensation database. It produces a plausible number from training data that may be years stale. This is why AuraPal's salary tool pulls actual advertised ranges from live job listings and tells you the sample size, rather than letting the model invent percentiles. When real data is not available for your role and location, it says so instead of guessing.

## Read the distribution, not the average

A single "average salary" figure hides what you need. Ask for percentiles:

- **P25** — the bottom quarter. Below this you are underpaid for the role almost regardless of circumstances.
- **P50 (median)** — the middle. A reasonable target for solid performance at the expected level.
- **P75** — strong. Usually requires scarce skills, a high-cost location, or a well-funded employer.
- **P90** — the top tenth. Senior specialists, competing offers, or companies paying above market deliberately.

Your position in that spread, adjusted for location and company type, is the actual answer to "am I underpaid".

## The factors that legitimately move the number

Before concluding you are being exploited, account for:

**Location.** Cost-of-labour differences are large and mostly real. A London or Bay Area band is not comparable to a regional one.

**Company model.** In an agency or consultancy your salary is a cost against billable revenue; there is structural pressure to keep it low. In a product company engineering is tied to the revenue it creates. This single factor often explains a large gap between two people doing similar work.

**Stage and funding.** Early-stage startups trade cash for equity. Whether that trade was good depends on an outcome neither of you can see yet.

**Tenure.** The uncomfortable one. Internal raises usually track a percentage of your existing salary, while external offers track the market. Stay long enough without a re-levelling and your pay drifts below what the same company would pay to hire you today. This is not malice; it is arithmetic.

## Asking, without ultimatums

Once you have a number, the conversation is more ordinary than people expect.

**Separate it from the performance review.** Review cycles are about ratings against a fixed budget. A compensation conversation works better as its own meeting, ideally a couple of months before the cycle when budgets are still being shaped.

**Lead with market data, not need.** Personal costs are real but are not a reason your role is worth more. Compare the role to the market.

> "I've been looking at what this role pays elsewhere. Postings for the same scope in this city are running around X to Y, and I'm currently at Z. I'd like to talk about closing that gap."

**Name a number.** If you do not, someone else will, and it will be lower. Ask near P75 if your evidence supports it; you will likely settle nearer P50.

**Bring evidence of scope, not effort.** Hours worked are not an argument. What you own now that you did not a year ago is.

**Have a real answer to "or else?"** — even if you never say it. The strongest position is being genuinely employable elsewhere. You do not need to threaten; you need to have interviewed recently enough to know your options.

**Accept that the first answer is often "not now."** Budgets are set in cycles. "Not now" plus a specific date and a defined bar is a real outcome. "Not now" with nothing attached, twice, is information about whether to stay.

## If the gap does not close

Sometimes the number is structural — the company does not pay that band for that role, and no conversation changes it. That is worth knowing early rather than discovering after three more years of drift.

The largest single-step pay increases most people ever get come from changing employer. That is not advice to leave. It is the reason to know your market rate whether or not you intend to use it.
`,
  },

  {
    slug: "resume-bullet-points-examples",
    title: "Resume bullet points: 15 before-and-after examples",
    teaser:
      "Most weak bullets describe a duty. Strong ones describe a result. Fifteen real rewrites across roles, and the one formula behind all of them.",
    date: "2026-10-15",
    readingMinutes: 6,
    tool: { label: "Rewrite my bullets", to: "/resume-roast" },
    body: `
A recruiter spends seconds on a first pass. In that time they are not reading your bullets so much as scanning them for one thing: evidence that you changed something.

Most bullets fail that scan because they describe a job description, not a person doing it well.

## The formula

Every rewrite below follows the same shape:

> **Action verb + what you did + measurable result + how (optional)**

If you can only fit three of the four, drop the "how". Never drop the result.

When you genuinely have no number, use scale (team size, budget, users, volume), time (how much faster), or a before/after state ("from manual to automated").

## Operations and admin

1. **Before:** Responsible for scheduling meetings.
   **After:** Coordinated calendars for a 5-person leadership team, cutting double-bookings from weekly to near zero.
2. **Before:** Handled vendor invoices.
   **After:** Processed 300+ vendor invoices a month and cleared a 6-week payment backlog in 3 weeks.
3. **Before:** Managed office supplies.
   **After:** Renegotiated two supplier contracts, reducing office supply spend 18% year over year.

## Sales and customer success

4. **Before:** Worked with clients to grow accounts.
   **After:** Expanded 14 mid-market accounts, adding $420K in annual recurring revenue.
5. **Before:** Answered customer support tickets.
   **After:** Resolved 60+ tickets a day with a 96% satisfaction score, highest on a team of nine.
6. **Before:** Did cold outreach.
   **After:** Built a 1,200-contact outbound list and booked 38 qualified demos in one quarter.

## Engineering and data

7. **Before:** Worked on the backend API.
   **After:** Rebuilt the order API in Go, cutting p95 latency from 900ms to 180ms.
8. **Before:** Wrote reports for management.
   **After:** Automated 12 weekly KPI reports in Tableau, saving the analytics team 6 hours a week.
9. **Before:** Fixed bugs.
   **After:** Closed 140 production bugs in 6 months and added regression tests that dropped repeat incidents by half.

## Marketing and content

10. **Before:** Managed social media accounts.
    **After:** Grew LinkedIn followers from 2K to 11K in 9 months with a three-posts-a-week editorial calendar.
11. **Before:** Wrote blog posts.
    **After:** Wrote 40 SEO articles that now drive 22% of organic signups.
12. **Before:** Ran email campaigns.
    **After:** Redesigned the onboarding email sequence, lifting trial-to-paid conversion from 9% to 13%.

## Students and early career

13. **Before:** Group project for marketing class.
    **After:** Led a 4-person team to build a go-to-market plan for a local café; owner adopted 3 of our 5 recommendations.
14. **Before:** Worked at a restaurant.
    **After:** Trained 6 new servers and handled 40-cover Friday shifts as the youngest shift lead.
15. **Before:** Volunteer tutor.
    **After:** Tutored 12 students in algebra weekly; 10 passed the state exam, up from 5 the year before.

## Three checks before you send

- **Read only the first four words of each bullet.** If they are "Responsible for", "Helped with" or "Worked on", rewrite.
- **Count the numbers.** Aim for a number in at least half your bullets.
- **Cut anything a person in the same job would also write.** Those lines are the job description, not you.

If you want a second opinion on which of your bullets are weakest, paste your resume into a roast and look at the bottom three first. Fixing your worst bullets helps more than polishing your best ones.
`,
  },

  {
    slug: "cover-letter-that-gets-read",
    title: "How to write a cover letter a hiring manager will actually finish",
    teaser:
      "Most cover letters restate the resume in longer sentences. A short letter that answers the job post's top two needs works better, and takes less time.",
    date: "2026-10-15",
    seoTitle: "How to Write a Cover Letter That Gets Read — AuraPal",
    readingMinutes: 5,
    tool: { label: "Write my cover letter", to: "/cover-letter" },
    body: `
A cover letter has one job: give the reader a reason to open your resume with interest instead of suspicion. It does not need to tell your life story, and it should not repeat your resume in paragraph form.

## Start from the job post, not from yourself

Before writing anything, reread the posting and underline the two or three requirements that appear first or most often. Those are what the hiring manager is worried about. Your letter should answer those worries directly.

A useful test: if you could send the same letter to another company by changing the name, it is not specific enough.

## A structure that works

**Opening (1–2 sentences).** Name the role and the single most relevant thing about you. Skip "I am writing to apply for".

> Your posting for a Product Analyst asks for someone who can turn messy event data into decisions. That has been most of my last two years.

**Proof (one short paragraph per requirement, two at most).** One concrete example each, with a result.

> At Contoso I rebuilt our activation funnel from raw event data and found 38% of new users stalled on one permissions screen. The fix lifted week-one activation from 41% to 52%.

**Close (1–2 sentences).** Suggest a next step and stop.

> I'd welcome 20 minutes to talk about what your onboarding data looks like today.

That is usually 150–250 words. Shorter is fine.

## Phrases to delete on sight

- "I am a passionate, results-driven team player" — everyone says this, so it carries no information.
- "I believe I would be a great fit" — show the fit instead.
- "Please find attached my resume" — they know.
- Anything starting with "As you can see from my resume".

## When a cover letter matters most

- You are **changing fields**, and your resume alone does not explain why.
- The role is at a **small company** where the hiring manager reads every application.
- There is a **gap or an unusual move** you want to frame before someone else does.

For large-company roles with an optional cover letter field, a short, specific letter still helps, but a strong resume matters more. Spend your time accordingly.

## Using AI without sounding like AI

AI drafts go generic when the input is generic. Give the generator the actual job description and two real achievements with numbers, then edit the result: remove any sentence you would not say out loud, and make sure every claim is one you can defend in an interview.
`,
  },

  {
    slug: "star-method-interview-answers",
    title: "STAR interview answers that don't sound rehearsed",
    teaser:
      "The STAR method keeps behavioral answers specific, but most people spend too long on the setup. How to build six stories that answer forty questions.",
    date: "2026-10-15",
    readingMinutes: 6,
    tool: { label: "Prep my interview", to: "/interview-prep" },
    body: `
Behavioral questions ("Tell me about a time you...") are designed to see how you actually behave, using past behavior as evidence. STAR — **Situation, Task, Action, Result** — is the standard structure for answering them, and it works. The common failure is proportion, not structure.

## Get the proportions right

A good two-minute answer spends roughly:

- **Situation + Task:** 20 seconds. Just enough context to follow.
- **Action:** 60–70 seconds. What *you* did, in order, with your reasoning.
- **Result:** 20–30 seconds. A number or a clear before/after, plus what you learned.

Most rehearsed-sounding answers invert this: a long story about the company and the project, a vague "we worked together to fix it", and no result.

## Say "I", not "we"

Interviewers are hiring you, not your old team. "We migrated the database" tells them nothing about your part. "I wrote the migration plan, ran the dry runs and handled the cutover at 2am" does.

Credit the team briefly, then describe your own decisions.

## Build a story bank, not a script

You do not need forty answers for forty questions. You need **six to eight strong stories** that each cover several themes:

1. A time you **delivered under pressure** or a tight deadline
2. A time you **failed or made a mistake** and what changed afterwards
3. A **conflict or disagreement** with a colleague or manager
4. A time you **led or influenced** without formal authority
5. A time you **improved a process** or found a better way
6. A time you dealt with **ambiguity** or incomplete information
7. Your **proudest result**, with numbers

For each story, write five bullet points: one for situation, one for task, two for action, one for result. Then practise telling it out loud from those bullets only. That is what stops it from sounding memorised.

## Prepare for the follow-up

Strong interviewers dig. After your answer, expect:

- "What would you do differently?"
- "What did your manager think?"
- "How did you measure that?"

Have one honest sentence ready for each. "I'd validate the entry point with five users before building it" is better than claiming the project was flawless.

## Example

**Question:** Tell me about a time you shipped something users didn't adopt.

**Situation:** Our budgeting feature had 4% adoption a month after launch.
**Task:** I owned finding out why within two sprints.
**Action:** I ran 12 user calls and pulled session recordings. The feature worked fine; people just could not find it, because the entry point was buried in Settings. I proposed moving it to the home screen and wrote the spec.
**Result:** Adoption rose to 19% in six weeks. Since then I test where an entry point goes with five users before we build anything.

That is under ninety seconds, and every sentence is about a decision.
`,
  },

  {
    slug: "resume-summary-examples",
    title: "Resume summary examples for every career stage",
    teaser:
      "A resume summary is three lines that tell a recruiter what to look for next. Twelve examples from student to career changer, and how to write yours.",
    date: "2026-10-21",
    readingMinutes: 6,
    tool: { label: "Write my summary", to: "/resume-builder" },
    body: `
The summary is the first thing a recruiter reads and the last thing most people write. It usually shows: three lines of adjectives — hard-working, detail-oriented, passionate — that could belong to anyone.

A good summary does a narrower job. It tells the reader **what you are, what you are best at, and what to look for in the rest of the page.** If it does that in three lines, it has earned its space.

## Summary or objective?

An objective says what you want. A summary says what you offer. Recruiters are hiring for their need, not yours, so in almost every case the summary wins.

The one exception is a career change, where a single line of intent helps the reader understand why your history does not match the job title. Even then, keep it inside a summary that leads with what you bring.

## The three-line structure

Every example below follows the same shape:

1. **Who you are, in the employer's language.** Your target title and level, plus years of experience if they help.
2. **Your strongest proof.** One or two results, with numbers where you have them.
3. **What you are bringing to this role.** The skills or domain the job post asks for that you can back up below.

Write it last, after your bullets are finished. The summary should be a trailer for the resume, so it is much easier to write once you know what the best scenes are.

## Students and new graduates

You do not have years of experience, so lead with what you studied, what you built, and what you are aiming for.

1. *Computer science graduate with two internships in backend development. Built a course-scheduling API in Python used by 400 students at my university. Looking for a junior backend role working with Python, PostgreSQL and cloud deployment.*
2. *Marketing student with hands-on campaign experience from a part-time role at a local gym, where I ran the Instagram account and launched a referral offer. Comfortable with Canva, Meta Ads Manager and basic Google Analytics.*
3. *Finance graduate with a CFA Level I pass and a summer analyst internship building three-statement models for mid-market deals. Strong in Excel, financial modelling and writing clear investment memos.*

Note what is missing: no "eager to learn", no "team player". Every phrase is a fact the interviewer can ask about.

## Early career (2 to 5 years)

At this stage, the summary should show you are past learning the job and starting to own outcomes.

4. *Customer success manager with four years in B2B SaaS, managing a book of 40 mid-market accounts. Cut churn on my book by a third in one year by introducing quarterly business reviews. Strong in onboarding design, renewals and Salesforce.*
5. *Frontend engineer with three years building React and TypeScript products. Led the rebuild of a checkout flow that reduced drop-off, and set up the team's component library. Looking for a product-focused team where design and engineering work closely.*
6. *Operations coordinator with three years in logistics, scheduling deliveries across two warehouses. Automated our dispatch spreadsheet into a shared tool that removed a daily hour of manual work. Experienced with inventory systems, vendor management and reporting.*

## Mid-career and senior

The reader now wants scope: how big were the teams, budgets, systems or markets you were responsible for?

7. *Product manager with eight years in fintech, most recently owning payments for a consumer app. Launched instant payouts and led a cross-functional team of twelve. Strong in pricing, compliance-heavy delivery and turning customer research into roadmaps.*
8. *Data engineering lead with ten years of experience building analytics platforms. Moved a company from nightly batch jobs to near-real-time pipelines and grew the data team from two to seven. Experienced with Spark, dbt, Airflow and cost control on cloud warehouses.*
9. *Registered nurse with nine years in emergency care, including four as charge nurse on a 30-bed unit. Trained new graduate nurses and led the rollout of a new triage protocol. Calm under pressure, strong in patient communication and clinical documentation.*

## Career changers

Here the summary has to do extra work: connect the old world to the new one so the reader does not have to.

10. *Former high school teacher moving into instructional design. Designed and delivered a full year of curriculum for 150 students a year and built the department's online course materials. Completed a certificate in learning experience design and comfortable with Articulate 360.*
11. *Retail store manager transitioning into operations management. Ran a store with 25 staff, owned the budget and rota, and improved stock accuracy through weekly cycle counts. Bringing people management, scheduling and inventory control to a warehouse or supply chain role.*
12. *Journalist moving into content marketing. Seven years writing to deadline for regional and national outlets, with experience interviewing experts and explaining complex topics simply. Now building SEO and analytics skills through freelance content projects.*

The pattern in all three: name the transferable skill in the target field's vocabulary, then point at evidence. "Classroom management" becomes "people management"; "lesson planning" becomes "curriculum design".

## Five mistakes that make a summary forgettable

- **Adjectives without evidence.** "Results-driven" is a claim. "Cut churn by a third" is evidence. Replace each adjective with the fact that made you think of it.
- **Writing in the first person throughout.** Drop "I am" and "I have". Resume summaries are written in implied first person, which saves space.
- **Going past four lines.** If it becomes a paragraph, a recruiter will skip it. Cut the weakest clause.
- **One summary for every job.** Swap the third line for each application so it mirrors the two or three skills the job post emphasises.
- **Promising what the resume does not show.** If the summary says "leadership", the reader will look for a leadership bullet below. Make sure it is there.

## A quick way to write yours

Open the job description and highlight the job title and the three skills mentioned most. Then answer three questions in one sentence each:

1. What is your current or target title, and how long have you done this kind of work?
2. What is the single result you would most want an interviewer to ask about?
3. Which of the highlighted skills can you prove from the bullets on this page?

Join the three sentences and trim. That is your summary. Read it out loud: if it sounds like it could describe a colleague just as well, make the result more specific.

Once you have a draft, put it next to your experience section and check that every claim has a bullet that backs it up. A summary that matches the page below it reads as confident. One that does not reads as padding.
`,
  },

  {
    slug: "tell-me-about-yourself-answer",
    title: "How to answer “Tell me about yourself” in an interview",
    teaser:
      "A simple present, past, future structure for the first interview question, with example answers for graduates, experienced hires and career changers.",
    date: "2026-10-28",
    readingMinutes: 7,
    tool: { label: "Prep my interview", to: "/interview-prep" },
    body: `
Almost every interview starts the same way. The interviewer looks up from your resume and says: "So, tell me about yourself."

It sounds like small talk. It is not. It sets the frame for every question that follows, and most people answer it badly — with a life story that starts at school, or a recital of the resume the interviewer is already holding.

The fix is to treat it as what it really is: **a 60 to 90 second pitch for why you are a sensible person to be talking to about this job.**

## What the interviewer is actually asking

Behind the open question are three narrower ones:

1. **Who are you, professionally?** What kind of work do you do, and at what level?
2. **What is the strongest evidence you are good at it?** One or two things worth asking about.
3. **Why are you here?** Why this role, why now, and does it make sense given your history?

An answer that covers those three, briefly, is a good answer. Everything else — hobbies, where you grew up, every job since your first — is optional at best and a distraction at worst.

## The present, past, future structure

The most reliable shape is three short parts, in this order:

- **Present:** what you do now, in one or two sentences. Title, type of company, what you own.
- **Past:** one or two experiences that explain how you got good at it. Pick the ones most relevant to this job, not the most recent ones by default.
- **Future:** why this role is the logical next step. This is where you connect your story to their job description.

Starting with the present matters. It answers the interviewer's first silent question immediately, and it stops you from drifting into a chronological history. The past is there to support the present, not to replace it.

Aim for about 150 to 200 words spoken. That is roughly a minute at a normal pace. If the interviewer wants more, they will ask, and a follow-up question is a better use of time than a monologue.

## Example answers

These are written to be spoken, so they are deliberately plain. Swap the specifics for your own; the structure is what carries over.

### New graduate

> I recently finished a degree in computer science, where I focused on backend systems. In my final year I built a room-booking API for my university's library that students still use, and during a summer internship at a logistics startup I worked on the service that calculated delivery windows — mostly Python and PostgreSQL. What I enjoyed most in both was making slow things fast and reliable. That is why this junior backend role stood out: your team owns the services behind checkout, and the job post mentions performance work, which is exactly the part I want to get better at.

Note what it does not say: no grades, no list of modules, no "I have always been passionate about technology". It names one project and one internship, and ties them to something specific in the job post.

### Experienced hire

> I am a customer success manager at a B2B software company, where I look after about forty mid-market accounts. Before that I spent three years in account management at an agency, which is where I learned to run renewals and handle difficult conversations with clients. The thing I am proudest of in my current role is introducing quarterly business reviews for my accounts — they made it much easier to spot unhappy customers early, and churn on my book dropped noticeably over the year. I am looking for a role where I can do that at a larger scale, which is why the senior position here, with ownership of the onboarding programme, appeals to me.

One sentence of present, one of past, one result, one sentence of future. The result is concrete enough to invite a follow-up, which is exactly what you want.

### Career changer

> For the last six years I have been a secondary school science teacher. A big part of that job, which people don't always see, is designing material: I rewrote our department's whole Year 10 curriculum and built the online course we used during remote teaching. That is the part of the job I have enjoyed most, so over the past year I have been moving deliberately into instructional design — I completed a certificate in learning experience design and built two short e-learning modules for a local charity. This role is a natural next step because you are building training for frontline staff, and explaining complex ideas to people who are busy and not always keen to learn is what I have been doing every day.

For a career changer, the "past" section has a harder job: it has to translate your old work into the new field's vocabulary so the interviewer doesn't have to. Name the transferable skill, then show you have already started acting on the change.

## Mistakes that weaken the answer

- **Reading out your resume.** They have it. Use the answer to choose and connect, not to list.
- **Starting at the beginning.** "I grew up in..." or "After school I..." spends your best thirty seconds on the least relevant material.
- **Being vague about what you do.** "I work in tech" or "I do operations" forces the interviewer to dig. Say your title and what you own.
- **No reason for this role.** An answer that ends with your current job leaves the interviewer to guess why you applied. Always land on the future.
- **Going on too long.** Past two minutes, you are losing them. If you are unsure, stop and let them ask.
- **Over-rehearsing.** Know your three parts and your one result. Do not memorise a script word for word; it sounds recited and falls apart if you are interrupted.

## Tailoring it to each interview

Your present section rarely changes. The past and future sections should, every time.

Before each interview, open the job description and underline the two or three things it emphasises most. Then check your answer:

1. Does the experience you chose for the past section match one of them?
2. Does the future section name something specific about this role or team, rather than a generic "growth opportunity"?
3. Is there at least one detail the interviewer is likely to follow up on, and do you have a good story ready for that follow-up?

That third point is the quiet advantage of a good answer. When you mention one concrete result, the interviewer usually asks about it next — which means the second question of the interview is one you have already prepared. A short STAR-style story behind that result is worth having ready.

## Practise it out loud

The answer only works if it sounds natural, and that comes from saying it, not writing it. Record yourself once on your phone, listen back, and cut anything you would not want to hear twice. Then practise with the follow-up questions your answer invites, so the next five minutes of the interview are as prepared as the first one.
`,
  },
];

/** The <title> for a post page, kept within 60 characters where possible. */
export const postPageTitle = (p: Pick<Post, "title" | "seoTitle">) => {
  if (p.seoTitle) return p.seoTitle;
  const full = `${p.title} — AuraPal`;
  return full.length <= 60 ? full : p.title;
};

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
