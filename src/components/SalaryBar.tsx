import { motion } from "framer-motion";

interface SalaryBarProps {
  result: string;
  inputs: Record<string, string>;
}

// Parse a number from a salary-like string ("$138K", "138,000", "£162k", "215K+")
function parseAmount(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.kKmM]/g, "");
  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();
  const isK = lower.includes("k");
  const isM = lower.includes("m");
  const num = parseFloat(lower.replace(/[km]/g, ""));
  if (isNaN(num)) return null;
  if (isM) return num * 1_000_000;
  if (isK) return num * 1_000;
  // Plain number — if < 1000 assume it was in K shorthand
  return num < 1000 ? num * 1_000 : num;
}

function detectCurrency(text: string): string {
  if (/£/.test(text)) return "£";
  if (/€/.test(text)) return "€";
  if (/₹/.test(text)) return "₹";
  if (/\$/.test(text) || /USD/i.test(text)) return "$";
  return "$";
}

function formatCurrency(amount: number, symbol: string): string {
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `${symbol}${Math.round(amount / 1000)}K`;
  return `${symbol}${Math.round(amount)}`;
}

export interface SalaryParseResult {
  p25: number; p50: number; p75: number; p90: number;
  user: number;
  symbol: string;
  diffFromMedian: number;
  status: "underpaid" | "fair" | "overpaid";
  percentile: string;
}

export function parseSalaryData(result: string, inputs: Record<string, string>): SalaryParseResult | null {
  // Extract P25/P50/P75/P90 lines like "- Bottom 25% (P25): $138K"
  const grab = (label: RegExp): number | null => {
    const m = result.match(label);
    return m ? parseAmount(m[1]) : null;
  };
  const p25 = grab(/P25[^\n]*?[:\-]\s*([^\n]+)/i);
  const p50 = grab(/P50[^\n]*?[:\-]\s*([^\n]+)/i) ?? grab(/Median[^\n]*?[:\-]\s*([^\n]+)/i);
  const p75 = grab(/P75[^\n]*?[:\-]\s*([^\n]+)/i);
  const p90 = grab(/P90[^\n]*?[:\-]\s*([^\n]+)/i);
  const user = parseAmount(inputs.currentSalary);

  if (!p25 || !p50 || !p75 || !p90 || !user) return null;

  const symbol = detectCurrency(`${inputs.currentSalary || ""} ${result.slice(0, 400)}`);
  const diffFromMedian = user - p50;

  let percentile = "";
  if (user < p25) percentile = "below P25";
  else if (user < p50) percentile = "between P25 and P50";
  else if (user < p75) percentile = "between P50 and P75";
  else if (user < p90) percentile = "between P75 and P90";
  else percentile = "above P90";

  const status: SalaryParseResult["status"] =
    user < p50 * 0.92 ? "underpaid" : user > p75 ? "overpaid" : "fair";

  return { p25, p50, p75, p90, user, symbol, diffFromMedian, status, percentile };
}

export function SalaryBar({ result, inputs }: SalaryBarProps) {
  const data = parseSalaryData(result, inputs);
  if (!data) return null;

  // Position: scale from p25 to p90+15% so user marker has room
  const min = Math.min(data.p25, data.user) * 0.95;
  const max = Math.max(data.p90, data.user) * 1.05;
  const range = max - min;
  const pct = (n: number) => Math.max(0, Math.min(100, ((n - min) / range) * 100));

  const userPct = pct(data.user);
  const markers = [
    { label: "P25", value: data.p25 },
    { label: "P50", value: data.p50 },
    { label: "P75", value: data.p75 },
    { label: "P90", value: data.p90 },
  ];

  const statusColor =
    data.status === "underpaid" ? "text-rose-400" : data.status === "fair" ? "text-amber-400" : "text-emerald-400";
  const statusBg =
    data.status === "underpaid" ? "bg-rose-500" : data.status === "fair" ? "bg-amber-500" : "bg-emerald-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="glass-card p-5 sm:p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Market Range</p>
        <p className="text-[11px] text-muted-foreground">{inputs.role || "Your role"} · {inputs.location || "your market"}</p>
      </div>
      <p className={`font-display font-bold text-lg ${statusColor}`}>
        {data.diffFromMedian < 0 ? "-" : "+"}{formatCurrency(Math.abs(data.diffFromMedian), data.symbol)} vs median
      </p>

      {/* Markers */}
      <div className="relative mt-6 mb-2 h-10">
        {markers.map((m) => (
          <div key={m.label} className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: `${pct(m.value)}%` }}>
            <span className="text-[10px] font-semibold text-muted-foreground">{m.label}</span>
            <span className="text-xs font-bold text-foreground tabular-nums">{formatCurrency(m.value, data.symbol)}</span>
          </div>
        ))}
      </div>

      {/* Bar */}
      <div className="relative h-3 rounded-full bg-secondary/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/70 via-amber-400/70 to-yellow-300/80" />
        {/* Tick marks */}
        {markers.map((m) => (
          <div key={m.label} className="absolute top-0 bottom-0 w-px bg-background/40" style={{ left: `${pct(m.value)}%` }} />
        ))}
      </div>

      {/* User marker */}
      <div className="relative h-12 mt-1">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${userPct}%` }}
        >
          <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent ${data.status === "underpaid" ? "border-b-rose-500" : data.status === "fair" ? "border-b-amber-500" : "border-b-emerald-500"}`} />
          <div className={`mt-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-white ${statusBg} shadow-lg whitespace-nowrap`}>
            You · {formatCurrency(data.user, data.symbol)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">{data.percentile}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
