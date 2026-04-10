import { MessageCircle } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function InterviewPrep() {
  return (
    <ToolPage
      title="Interview Prep"
      description="Get AI-generated interview questions with ideal answer frameworks."
      icon={MessageCircle}
      toolSlug="interview-prep"
      fields={[
        { id: "role", label: "Target Role", placeholder: "e.g. Senior Frontend Engineer" },
        { id: "company", label: "Company (optional)", placeholder: "e.g. Meta" },
        { id: "type", label: "Interview Type", placeholder: "e.g. Behavioral, Technical, System Design, or HR Screening" },
        { id: "background", label: "Your Background", placeholder: "Brief summary of your experience and skills...", type: "textarea" },
      ]}
      systemPrompt="You are a senior hiring manager. Generate 5 highly likely interview questions for this role and interview type. For each question, provide: the question itself, why interviewers ask it, and a framework for the ideal answer (use STAR for behavioral). Format clearly with numbered questions and sub-sections."
      buildUserPrompt={(v) =>
        `Generate interview prep for a ${v.role} role${v.company ? ` at ${v.company}` : ""}.\nInterview Type: ${v.type}\n\nMy Background:\n${v.background}`
      }
    />
  );
}
