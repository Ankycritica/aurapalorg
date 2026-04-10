import { MessageSquareWarning } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function LinkedInRoaster() {
  return (
    <ToolPage
      title="LinkedIn Roaster"
      description="Get brutally honest (but helpful) feedback on your LinkedIn profile"
      icon={MessageSquareWarning}
      fields={[
        { id: "headline", label: "Your LinkedIn Headline", placeholder: "e.g. Marketing Manager | Growth Hacker | Coffee Lover" },
        { id: "about", label: "Your About Section", placeholder: "Paste your LinkedIn About section here...", type: "textarea" },
        { id: "experience", label: "Experience Summary", placeholder: "Brief overview of your listed experience...", type: "textarea" },
      ]}
      systemPrompt="You are a LinkedIn profile roast expert — think comedy roast meets career advice. Be funny, brutally honest, and savage BUT always constructive. Structure: 1) Overall First Impression (roast it), 2) Headline Roast, 3) About Section Roast, 4) Experience Roast, 5) The Fixes (actionable improvements for each section), 6) Rewritten versions of headline and about. Use humor and wit. Rate the profile out of 10."
      buildUserPrompt={(v) => `Roast this LinkedIn profile:\n\nHeadline: ${v.headline}\n\nAbout: ${v.about}\n\nExperience: ${v.experience}`}
    />
  );
}
