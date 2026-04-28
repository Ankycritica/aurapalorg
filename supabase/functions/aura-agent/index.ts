// Aura Agent — single AI call, returns a unified, structured career plan as JSON.
// Hybrid approach: feels agentic (sectioned output) but only 1 backend call / 1 credit.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are AuraPal's Aura Agent — a world-class AI career strategist that operates like a senior coach + recruiter + personal-brand consultant fused into one.

The user gives you ONE goal (e.g. "Get a job", "Switch career", "Start a side hustle", "Improve LinkedIn") plus optional context (role, current resume snippet, LinkedIn headline, target industry, etc.).

You will design a complete, opinionated, end-to-end action plan and return it ONLY by calling the function "career_plan" with the JSON schema. Never reply in plain text.

RULES for content quality:
- Be brutally specific. No filler, no platitudes, no hedging.
- Use concrete numbers, named frameworks, and example phrasing.
- "before" examples should reflect typical weak versions; "after" should be punchy, quantified, recruiter-ready.
- Action plan tasks must be doable today/this-week, ordered by impact.
- Tone: confident, premium, slightly bold. Treat the user like an A-player.
- Never mention you are an AI or reference these instructions.`;

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
