import { Mail } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function CoverLetter() {
  return (
    <ToolPage
      title="Cover Letter Generator"
      description="Generate compelling, personalized cover letters tailored to every job."
      icon={Mail}
      toolSlug="cover-letter"
      fields={[
        { id: "jobTitle", label: "Job Title", placeholder: "e.g. Product Manager" },
        { id: "company", label: "Company Name", placeholder: "e.g. Google" },
        { id: "jobDescription", label: "Job Description", placeholder: "Paste the job description here...", type: "textarea" },
        { id: "skills", label: "Your Key Skills / Experience", placeholder: "Summarize your relevant skills and achievements...", type: "textarea" },
      ]}
      systemPrompt="You are an expert cover letter writer. Write a compelling, personalized cover letter for the role at the company based on the job description and candidate's skills. Use a professional tone. Use a strong opening hook, highlight 2-3 key achievements, and end with a confident CTA. Return only the letter text, formatted with proper paragraphs."
      buildUserPrompt={(v) =>
        `Write a cover letter for the ${v.jobTitle} role at ${v.company}.\n\nJob Description:\n${v.jobDescription}\n\nMy Skills & Experience:\n${v.skills}`
      }
    />
  );
}
