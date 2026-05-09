import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Trash2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Status = "saved" | "applied" | "interview" | "offer" | "rejected";
const STATUSES: { id: Status; label: string; tone: string }[] = [
  { id: "saved", label: "Saved", tone: "from-slate-500/20 to-slate-500/5 border-slate-500/30" },
  { id: "applied", label: "Applied", tone: "from-primary/20 to-primary/5 border-primary/30" },
  { id: "interview", label: "Interview", tone: "from-violet-500/20 to-violet-500/5 border-violet-500/30" },
  { id: "offer", label: "Offer", tone: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30" },
  { id: "rejected", label: "Rejected", tone: "from-red-500/20 to-red-500/5 border-red-500/30" },
];

type Row = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  apply_url: string | null;
  status: Status;
  notes: string | null;
  created_at: string;
};

export default function JobTracker() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_jobs")
      .select("id, title, company, location, apply_url, status, notes, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setRows((data as Row[]) ?? []); setLoading(false); });
  }, [user]);

  async function move(row: Row, status: Status) {
    if (row.status === status) return;
    setRows((rs) => rs.map((r) => r.id === row.id ? { ...r, status } : r));
    const { error } = await supabase.from("saved_jobs").update({ status }).eq("id", row.id);
    if (error) toast.error(error.message);
  }

  async function remove(row: Row) {
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    const { error } = await supabase.from("saved_jobs").delete().eq("id", row.id);
    if (error) toast.error(error.message);
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
  }
  function onDrop(e: React.DragEvent, status: Status) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const r = rows.find((x) => x.id === id);
    if (r) move(r, status);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link to="/jobs" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-primary mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to search
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Application tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Drag cards across columns. Stay on top of every application.</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-xl p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground mb-4">No saved jobs yet.</p>
          <Link to="/jobs" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm">
            Find jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {STATUSES.map((col) => {
            const items = rows.filter((r) => r.status === col.id);
            return (
              <div key={col.id}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col.id)}
                className={`rounded-xl border bg-gradient-to-b ${col.tone} p-3 min-h-[200px]`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[10px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((r) => (
                    <motion.div key={r.id} layout draggable onDragStart={(e: any) => onDragStart(e, r.id)}
                      className="rounded-lg bg-card/80 backdrop-blur p-3 border border-border/50 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors">
                      <h4 className="text-xs font-semibold leading-snug">{r.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.company} · {r.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        {r.apply_url ? (
                          <a href={r.apply_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary inline-flex items-center gap-1 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        ) : <span />}
                        <button onClick={() => remove(r)} className="text-muted-foreground/60 hover:text-red-400">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
