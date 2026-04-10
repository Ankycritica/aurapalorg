import { Briefcase } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function BusinessPlan() {
  return (
    <ToolPage
      title="Business Plan Generator"
      description="Turn any idea into a structured, investor-ready business plan"
      icon={Briefcase}
      fields={[
        { id: "idea", label: "Business Idea", placeholder: "Describe your business idea in detail...", type: "textarea" },
        { id: "market", label: "Target Market", placeholder: "e.g. Small businesses, remote workers, students" },
        { id: "budget", label: "Starting Budget", placeholder: "e.g. $5,000" },
      ]}
      systemPrompt="You are a business strategy consultant. Create a comprehensive business plan with: Executive Summary, Problem & Solution, Target Market Analysis, Business Model & Revenue Streams, Marketing Strategy, Competitive Analysis, Financial Projections, Milestones & Timeline. Be specific, actionable, and data-informed."
      buildUserPrompt={(v) => `Create a business plan for: ${v.idea}\nTarget Market: ${v.market || "General"}\nStarting Budget: ${v.budget || "Not specified"}`}
    />
  );
}
