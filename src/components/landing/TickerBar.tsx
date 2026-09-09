const names = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Stripe", "Airbnb",
  "Anthropic", "OpenAI", "NVIDIA", "Goldman Sachs", "JPMorgan", "Adobe", "Cisco", "Intel",
];

export function TickerBar() {
  const loop = [...names, ...names];
  return (
    <section className="border-y hairline py-6">
      <p className="section-number text-center mb-4">Where AuraPal users are targeting</p>
      <div className="ticker-mask overflow-hidden">
        <div className="ticker-track">
          {loop.map((n, i) => (
            <span key={i} className="mono text-sm px-6 whitespace-nowrap" style={{ color: "var(--lm-fg-3)" }}>
              {n} <span className="px-2">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
