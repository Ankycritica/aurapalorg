import { FlameKindling } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function ResumeRoast() {
  return (
    <ToolPage
      title="Resume Roast"
      description="Get your resume roasted with actionable improvements"
      icon={FlameKindling}
      toolSlug="resume-roast"
      fields={[
        { id: "resume", label: "Paste Your Resume", placeholder: "Paste the full text of your resume here...", type: "textarea" },
        { id: "role", label: "Target Role (optional)", placeholder: "e.g. Product Manager at Google" },
      ]}
      systemPrompt="You are a resume roast expert — brutally honest but constructive. Roast the resume with humor and wit, then provide actionable fixes. Structure: 1) First Impression Score (/10), 2) The Good (brief), 3) The Roast (be savage but fair — point out vague bullets, buzzword abuse, formatting issues, missing metrics), 4) Section-by-Section Fix (rewrite weak bullets using XYZ format), 5) Final Verdict with top 3 priority fixes. Be entertaining but ultimately helpful."
      buildUserPrompt={(v) => `Roast this resume${v.role ? ` (targeting: ${v.role})` : ""}:\n\n${v.resume}`}
    />
  );
}
