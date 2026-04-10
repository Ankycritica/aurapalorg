import { Check, X } from "lucide-react";

const rows = [
  { feature: "All 8 AI tools", free: true, pro: true, premium: true },
  { feature: "Daily AI generations", free: "5/day", pro: "100/day", premium: "Unlimited" },
  { feature: "Copy to clipboard", free: true, pro: true, premium: true },
  { feature: "Export to PDF", free: false, pro: true, premium: true },
  { feature: "Advanced formatting", free: false, pro: true, premium: true },
  { feature: "Priority AI processing", free: false, pro: true, premium: true },
  { feature: "Priority support", free: false, pro: false, premium: true },
];

function Cell({ val }: { val: boolean | string }) {
  if (typeof val === "string") return <span className="text-sm text-foreground font-medium">{val}</span>;
  return val ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
}

export function ComparisonTable() {
  return (
    <section className="py-16 px-4 bg-secondary/10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Compare Plans</h2>
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Feature</th>
                  <th className="p-4 text-center text-foreground font-semibold">Free</th>
                  <th className="p-4 text-center text-primary font-semibold">Pro</th>
                  <th className="p-4 text-center text-accent font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="p-4 text-foreground">{row.feature}</td>
                    <td className="p-4 text-center"><Cell val={row.free} /></td>
                    <td className="p-4 text-center bg-primary/[0.03]"><Cell val={row.pro} /></td>
                    <td className="p-4 text-center"><Cell val={row.premium} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
