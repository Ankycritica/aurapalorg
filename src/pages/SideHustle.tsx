import { Lightbulb } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function SideHustle() {
  return (
    <>
      <title>Side Hustle Ideas Generator — AuraPal | Find Your Next Income Stream</title>
      <meta name="description" content="Discover personalized side hustle ideas based on your skills, interests, and available time. AI-powered recommendations." />
      <ToolPage
        title="Side Hustle Generator"
        description="Discover personalized side income opportunities based on your skills"
        icon={Lightbulb}
        toolSlug="side-hustle"
        fields={[
          { id: "skills", label: "Your Skills & Interests", placeholder: "e.g. Writing, design, coding, marketing, teaching...", type: "textarea" },
          { id: "time", label: "Time Available Per Week", placeholder: "e.g. 10-15 hours", required: false },
          { id: "goal", label: "Income Goal", placeholder: "e.g. $1,000/month", required: false },
        ]}
        systemPrompt="You are a side hustle and entrepreneurship expert. Generate 5-7 personalized side hustle ideas. For each, include: Name, Description, Earning Potential (realistic range), Time Investment, Startup Cost, Difficulty Level, First 3 Steps to Start. Prioritize ideas that match the user's skills. Be realistic about earnings. Include both quick-start and longer-term options."
        buildUserPrompt={(v) => `Suggest side hustle ideas for someone with these skills: ${v.skills}\nAvailable time: ${v.time || "10 hours/week"}\nIncome goal: ${v.goal || "Not specified"}`}
        seoContent={
          <div className="glass-card p-6 mt-8 space-y-4">
            <h2 className="font-display text-xl font-semibold">Find Your Perfect Side Hustle</h2>
            <p className="text-sm text-muted-foreground">Our AI analyzes your unique skills and interests to suggest realistic side income opportunities. Get personalized recommendations with earning potential, time investment, and step-by-step instructions to get started.</p>
          </div>
        }
      />
    </>
  );
}
