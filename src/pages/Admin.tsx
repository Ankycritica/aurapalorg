import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Users, BarChart3, DollarSign, Activity, Loader2, TrendingUp } from "lucide-react";

const ADMIN_EMAIL = "aurapalorg@gmail.com";

interface UserRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  plan: string;
  created_at: string;
}

interface ToolStat {
  tool_name: string;
  count: number;
}

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [toolStats, setToolStats] = useState<ToolStat[]>([]);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "tools">("overview");

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch via edge function for admin-only data
      const { data, error } = await supabase.functions.invoke("admin-analytics");
      if (!error && data) {
        setUsers(data.users || []);
        setToolStats(data.toolStats || []);
        setTotalGenerations(data.totalGenerations || 0);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  const proUsers = users.filter(u => u.plan === "pro").length;
  const premiumUsers = users.filter(u => u.plan === "premium").length;
  const estimatedMRR = proUsers * 19 + premiumUsers * 49;

  const statCards = [
    { label: "Total Users", value: users.length, icon: Users, color: "#00C4EE" },
    { label: "Total Generations", value: totalGenerations, icon: BarChart3, color: "#7C6FF7" },
    { label: "Estimated MRR", value: `$${estimatedMRR}`, icon: DollarSign, color: "#32D583" },
    { label: "Paid Users", value: proUsers + premiumUsers, icon: TrendingUp, color: "#F5C842" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Analytics and user management</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-2xl font-display font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit">
            {(["overview", "users", "tools"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Plan distribution */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Plan Distribution</h3>
                <div className="space-y-3">
                  {[
                    { plan: "Free", count: users.filter(u => u.plan === "free").length, color: "#64748b" },
                    { plan: "Pro", count: proUsers, color: "#00C4EE" },
                    { plan: "Premium", count: premiumUsers, color: "#7C6FF7" },
                  ].map((p) => (
                    <div key={p.plan} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-foreground flex-1">{p.plan}</span>
                      <span className="text-sm font-semibold">{p.count}</span>
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${users.length ? (p.count / users.length) * 100 : 0}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top tools */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Most Used Tools</h3>
                <div className="space-y-3">
                  {toolStats.slice(0, 6).map((t, i) => (
                    <div key={t.tool_name} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-sm text-foreground flex-1 truncate">{t.tool_name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <span className="text-sm font-semibold text-primary">{t.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="glass-card overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Plan</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} className="border-b border-border/30 last:border-0">
                        <td className="p-4 text-foreground font-medium">{u.display_name || "—"}</td>
                        <td className="p-4 text-muted-foreground">{u.email || "—"}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.plan === "premium" ? "bg-accent/10 text-accent" :
                            u.plan === "pro" ? "bg-primary/10 text-primary" :
                            "bg-secondary text-muted-foreground"
                          }`}>{u.plan}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "tools" && (
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">All Tool Usage</h3>
              <div className="space-y-3">
                {toolStats.map((t) => {
                  const maxCount = toolStats[0]?.count || 1;
                  return (
                    <div key={t.tool_name} className="flex items-center gap-4">
                      <span className="text-sm text-foreground w-48 truncate">{t.tool_name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-16 text-right">{t.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
