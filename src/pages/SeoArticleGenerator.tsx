import { PenLine } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export default function SeoArticleGenerator() {
  return (
    <>
      <title>SEO Article Generator — AuraPal | AI Blog Post Writer</title>
      <meta name="description" content="Generate keyword-optimized blog posts with proper headings, meta descriptions, and SEO structure using AI." />
      <ToolPage
        title="SEO Article Generator"
        description="Generate keyword-optimized blog posts with proper SEO structure"
        icon={PenLine}
        toolSlug="seo-article"
        fields={[
          { id: "keyword", label: "Target Keyword", placeholder: "e.g. best project management tools 2025" },
          { id: "tone", label: "Tone / Style", placeholder: "e.g. Professional, conversational, authoritative" },
          { id: "length", label: "Desired Length", placeholder: "e.g. 1500 words" },
        ]}
        systemPrompt="You are an expert SEO content writer. Create a comprehensive, keyword-optimized blog article. Include: SEO Title (under 60 chars), Meta Description (under 160 chars), proper H1/H2/H3 heading hierarchy, introduction with hook, well-structured body sections, conclusion with CTA. Naturally incorporate the target keyword. Write engaging, valuable content that ranks."
        buildUserPrompt={(v) => `Write an SEO-optimized article targeting the keyword: "${v.keyword}"\nTone: ${v.tone || "Professional"}\nTarget length: ${v.length || "1500 words"}`}
        seoContent={
          <div className="glass-card p-6 mt-8 space-y-4">
            <h2 className="font-display text-xl font-semibold">AI-Powered SEO Content</h2>
            <p className="text-sm text-muted-foreground">Create blog posts that rank with our AI SEO article generator. Each article includes optimized title tags, meta descriptions, proper heading hierarchy, and natural keyword integration — everything you need for higher search visibility.</p>
          </div>
        }
      />
    </>
  );
}
