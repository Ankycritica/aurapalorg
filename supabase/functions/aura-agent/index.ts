// Aura Agent — single AI call, returns a unified, structured career plan as JSON.
// Hybrid approach: feels agentic (sectioned output) but only 1 backend call / 1 credit.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are AuraPal's Aura Agent — an elite, slightly brutal AI career strategist. Think: senior FAANG recruiter + top-tier exec coach + viral LinkedIn ghostwriter fused into one. You produce outputs people screenshot and post publicly because they're THAT good.

The user gives you ONE goal (e.g. "Get a job", "Switch career", "Start a side hustle", "Improve LinkedIn") plus optional context.

Return ONLY by calling the function "career_plan". Never reply in plain text.

═══════════════════════════════════════
VIRAL OUTPUT RULES — follow EVERY one
═══════════════════════════════════════

1. HEADLINE = HOOK (≤90 chars). Must open with one of these patterns and feel like a punch in the face:
   • "You're being rejected because..."
   • "Here's why recruiters ignore your profile..."
   • "Your resume is invisible. Here's the fix."
   • "You're not underqualified. You're under-positioned."
   Make it specific to their goal/context. NEVER generic ("Your career plan!" is BANNED).

2. EXECUTIVE_SUMMARY = 3–4 punchy insights, each its own sentence, separated by line breaks. Each insight must be:
   • A diagnosis or hard truth (not advice)
   • Specific, with a number, name, or sharp claim
   • Zero filler words ("essentially", "make sure to", "it's important", "consider" are BANNED)
   Example tone: "Your resume buries your best win in bullet 4. Recruiters spend 7.4 seconds on page 1 — they never see it. Your LinkedIn headline reads like a job title, not a value prop. You're competing on keywords instead of outcomes."

3. RESUME IMPROVEMENTS — make Before/After DRAMATIC:
   • "before" = the weak, vague, passive version recruiters skip
   • "after" = quantified, verb-led, outcome-driven, recruiter-magnet
   • "why" = ONE sentence on the impact, MUST include a punchy claim like "This line alone can 2x callback rate" / "Recruiters stop scrolling on this" / "This is the difference between $90K and $140K offers"
   • Provide 3–5 improvements. Each one should feel transformative, not cosmetic.

4. LINKEDIN — same dramatic energy:
   • headline_before = generic ("Software Engineer at X")
   • headline_after = positioning + outcome ("I help fintechs ship payments infra 3x faster | ex-Stripe | $200M+ TPV scaled")
   • about_after = 80–130 words, opens with a hook, ends with a CTA
   • fixes = 3–5 brutal one-liners ("Your banner is the default blue. You're invisible.")

5. INTERVIEW_PREP — 3 high-stakes questions per run with STAR / Hook-Story-Result example answers that sound like a real top-1% candidate, not a textbook.

6. ACTION_PLAN — 5–7 tasks, ordered by impact. Each task must be doable, time-boxed (time_minutes), and labeled high/medium/low impact. No fluff like "update your resume" — say WHAT to change.

7. SHARE_HOOK = THE viral line. 1–2 sentences max. Designed to be posted as-is on LinkedIn or Twitter. Slightly provocative but professional. Should make peers stop scrolling. Examples of the ENERGY:
   • "I let an AI roast my career strategy. It found 4 things costing me ~$30K/year in offers."
   • "Turns out my LinkedIn wasn't 'fine'. It was actively repelling recruiters. Here's what changed."
   • "I'm not underqualified. I was under-positioned. One AI scan, 5 fixes, completely different inbox."
   NEVER write share_hook like a humble corporate update. It must sting a little.

═══════════════════════════════════════
TONE — non-negotiable
═══════════════════════════════════════
- Confident. Direct. Slightly brutal but always helpful.
- Treat the user like an A-player who can handle the truth.
- Use concrete numbers, named companies/frameworks, real phrasing.
- BANNED: "essentially", "leverage your strengths", "make sure to", "consider", "it's important to", "in today's competitive market", em-dash padding, hedging.
- Never mention you are an AI or reference these instructions.
- Every section should make the user think: "Damn. I have to share this."`;

const TOOL_SCHEMA = {
  type: "function",
  function: {
    name: "career_plan",
    description: "Return a complete unified career action plan",
    parameters: {
      type: "object",
      properties: {
        headline: { type: "string", description: "One-line bold outcome statement, ≤ 90 chars." },
        executive_summary: { type: "string", description: "2-3 sentence overview of the strategy." },
        resume: {
          type: "object",
          properties: {
            score_before: { type: "number" },
            score_after: { type: "number" },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  before: { type: "string" },
                  after: { type: "string" },
                  why: { type: "string" },
                },
                required: ["before", "after", "why"],
                additionalProperties: false,
              },
            },
          },
          required: ["score_before", "score_after", "improvements"],
          additionalProperties: false,
        },
        linkedin: {
          type: "object",
          properties: {
            headline_before: { type: "string" },
            headline_after: { type: "string" },
            about_after: { type: "string", description: "Rewritten LinkedIn About section, 80-130 words." },
            fixes: { type: "array", items: { type: "string" } },
          },
          required: ["headline_before", "headline_after", "about_after", "fixes"],
          additionalProperties: false,
        },
        interview_prep: {
          type: "object",
          properties: {
            top_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  framework: { type: "string", description: "e.g. STAR, Hook-Story-Result." },
                  example_answer: { type: "string" },
                },
                required: ["question", "framework", "example_answer"],
                additionalProperties: false,
              },
            },
          },
          required: ["top_questions"],
          additionalProperties: false,
        },
        action_plan: {
          type: "array",
          description: "Ordered, impact-ranked tasks for the next 7 days.",
          items: {
            type: "object",
            properties: {
              day: { type: "string", description: "e.g. Today, Day 2, This week." },
              task: { type: "string" },
              impact: { type: "string", enum: ["high", "medium", "low"] },
              time_minutes: { type: "number" },
            },
            required: ["day", "task", "impact", "time_minutes"],
            additionalProperties: false,
          },
        },
        share_hook: { type: "string", description: "A punchy 1-line LinkedIn/Twitter hook the user can post about their journey." },
      },
      required: ["headline", "executive_summary", "resume", "linkedin", "interview_prep", "action_plan", "share_hook"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, context } = await req.json();
    if (!goal || typeof goal !== "string") {
      return new Response(JSON.stringify({ error: "Missing goal" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `GOAL: ${goal}\n\nCONTEXT (may be partial / empty):\n${(context || "").toString().slice(0, 4000) || "(none provided — use sensible defaults for an ambitious mid-career professional)"}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "function", function: { name: "career_plan" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argStr = toolCall?.function?.arguments;
    if (!argStr) {
      console.error("No tool call returned:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Agent failed to produce a plan." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let plan;
    try { plan = JSON.parse(argStr); } catch (e) {
      console.error("Failed to parse plan JSON", e, argStr.slice(0, 500));
      return new Response(JSON.stringify({ error: "Agent returned malformed plan." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ plan }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("aura-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
