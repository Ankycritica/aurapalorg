import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Status = "saved" | "applied" | "interview" | "offer" | "rejected";

const cols: { id: Status; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "hsl(var(--primary))" },
  { id: "interview", label: "Interviewing", color: "#a78bfa" },
  { id: "offer", label: "Offers", color: "#22c55e" },
  { id: "rejected", label: "Rejected", color: "#ef4444" },
];

export function PipelineWidget() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<Status, number> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_jobs").select("status").eq("user_id", user.id).then(({ data }) => {
      const c: Record<Status, number> = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
      (data ?? []).forEach((r: { status: Status }) => { if (r.status in c) c[r.status]++; });
      setCounts(c);
    });
  }, [user]);

  if (!counts) return null;

  const total = counts.applied + counts.interview + counts.offer + counts.rejected;
  const responded = counts.interview + counts.offer;
  const rate = total ? Math.round((responded / total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold tracking-tight">Your pipeline</h2>
        </div>
        <Link to="/jobs/tracker" className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:gap-1.5 transition-all">
          Open tracker <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {total === 0 && counts.saved === 0 ? (
        <div className="text-sm text-muted-foreground">
          No jobs tracked yet.{" "}
          <Link to="/jobs" className="text-primary underline underline-offset-4">Find jobs</Link> or{" "}
          <Link to="/jobs/tracker" className="text-primary underline underline-offset-4">add one manually</Link>.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {cols.map((c) => (
            <div key={c.id} className="rounded-lg border border-border/40 bg-secondary/30 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="font-display text-2xl font-bold mt-1" style={{ color: c.color }}>{counts[c.id]}</p>
            </div>
          ))}
          <div className="rounded-lg border border-border/40 bg-secondary/30 px-3 py-3 col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Response rate</p>
            <p className="font-display text-2xl font-bold mt-1">{rate}%</p>
          </div>
        </div>
      )}
    </section>
  );
}
