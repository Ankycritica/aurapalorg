import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is AuraPal really free to use?", a: "Yes! The free plan gives you 5 AI generations per day across all 8 tools. No credit card required." },
  { q: "What AI models power AuraPal?", a: "We use state-of-the-art language models to deliver professional-quality content for resumes, cover letters, interview prep, and more." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. You can cancel your Pro or Premium subscription at any time from your account settings. No questions asked." },
  { q: "Is my data safe?", a: "Your data is encrypted at rest and in transit. We never share your personal information with third parties." },
  { q: "What formats can I export to?", a: "Pro and Premium users can export resumes and cover letters to PDF. All users can copy content to clipboard." },
  { q: "How is AuraPal different from ChatGPT?", a: "AuraPal is purpose-built for career growth. Our tools use specialized prompts, templates, and frameworks designed by career coaches — not generic AI." },
];

export function FAQSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-muted-foreground text-center mb-10">Everything you need to know about AuraPal.</p>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-6 border border-border/50 rounded-xl">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
