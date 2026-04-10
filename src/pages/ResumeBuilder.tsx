import { FileText } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function ResumeBuilder() {
  return (
    <>
      <title>AI Resume Builder — AuraPal | Create ATS-Optimized Resumes</title>
      <meta name="description" content="Build professional, ATS-optimized resumes with AI. Get impact-driven bullet points in XYZ format that land interviews." />
      <ToolPage
        title="Resume Builder"
        description="AI-powered resume creation with impact-driven XYZ bullet points"
        icon={FileText}
        fields={[
          { id: "role", label: "Target Job Title", placeholder: "e.g. Senior Software Engineer" },
          { id: "experience", label: "Your Experience", placeholder: "Paste your work experience, skills, and achievements...", type: "textarea" },
          { id: "keywords", label: "Key Skills / Keywords", placeholder: "e.g. React, Node.js, AWS, Agile" },
        ]}
        systemPrompt="You are an expert resume writer and career coach. Create a professional, ATS-optimized resume. Use impact-driven XYZ format bullet points: 'Accomplished [X] as measured by [Y], by doing [Z]'. Structure with clear sections: Summary, Experience, Skills, Education. Use strong action verbs. Be specific with metrics and results."
        buildUserPrompt={(v) => `Create a professional resume for a ${v.role} role.\n\nExperience:\n${v.experience}\n\nKey Skills: ${v.keywords}`}
        seoContent={
          <div className="glass-card p-6 mt-8 space-y-4">
            <h2 className="font-display text-xl font-semibold">Why Use an AI Resume Builder?</h2>
            <p className="text-sm text-muted-foreground">Our AI resume builder helps you create ATS-optimized resumes that stand out. Using the proven XYZ format for bullet points, your accomplishments are presented with maximum impact — showing what you achieved, how it was measured, and how you did it.</p>
            <h2 className="font-display text-lg font-semibold">Features</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Impact-driven XYZ format bullet points</li>
              <li>ATS-optimized keyword placement</li>
              <li>Professional formatting and structure</li>
              <li>Tailored to your target role</li>
            </ul>
          </div>
        }
      />
    </>
  );
}
