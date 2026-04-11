import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import {
  Users, BarChart3, DollarSign, Activity, Loader2, TrendingUp, TrendingDown,
  Monitor, Globe, Smartphone, Eye, Filter, ArrowUpRight, ArrowDownRight,
  CreditCard, AlertTriangle, Percent,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from "recharts";

const ADMIN_EMAIL = "dongare.ankit29@gmail.com";

const COLORS = ["#00C4EE", "#7C6FF7", "#32D583", "#F5C842", "#FF6B6B", "#FF9F43", "#A855F7"];

type DateRange = "1" | "7" | "30" | "90";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "traffic" | "revenue" | "usage" | "funnel" | "users">("overview");
  const [dateRange, setDateRange] = useState<DateRange>("30");

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: d, error } = await supabase.functions.invoke("admin-analytics", {
        body: null,
        headers: {},
      });
      // Pass range as query param via body
      const { data: result } = await supabase.functions.invoke("admin-analytics");
      if (result) setData(result);
      setLoading(false);
    };
    fetchData();
  }, [user, dateRange]);

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

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { users, toolStats, totalGenerations, proUsers, premiumUsers, eventCounts, dailyEventData, dauData, deviceCounts, browserCounts, countryCounts, uniqueVisitors, stripeData, funnelSteps } = data;
  const estimatedMRR = (stripeData?.mrr || 0) / 100;
  const totalRevenue = (stripeData?.totalRevenue || 0) / 100;

  const kpis = [
    { label: "Total Users", value: users?.length || 0, icon: Users, color: "#00C4EE" },
    { label: "Unique Visitors", value: uniqueVisitors || 0, icon: Eye, color: "#7C6FF7" },
    { label: "Total Generations", value: totalGenerations || 0, icon: BarChart3, color: "#32D583" },
    { label: "MRR", value: `$${estimatedMRR.toFixed(2)}`, icon: DollarSign, color: "#F5C842" },
    { label: "Active Subs", value: stripeData?.activeSubscriptions || 0, icon: CreditCard, color: "#A855F7" },
    { label: "Churn Rate", value: `${stripeData?.churnRate || 0}%`, icon: TrendingDown, color: "#FF6B6B" },
    { label: "Failed Payments", value: stripeData?.failedPayments || 0, icon: AlertTriangle, color: "#FF9F43" },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "#32D583" },
  ];

  const deviceData = Object.entries(deviceCounts || {}).map(([name, value]) => ({ name, value }));
  const browserData = Object.entries(browserCounts || {}).map(([name, value]) => ({ name, value }));
  const countryData = Object.entries(countryCounts || {}).map(([name, value]: [string, any]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  const tabs = ["overview", "traffic", "revenue", "usage", "funnel", "users"] as const;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Analytics</h1>
          <p className="text-sm text-muted-foreground">Complete analytics dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["1", "7", "30", "90"] as DateRange[]).map((r) => (
            <button key={r} onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange === r ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
              {r === "1" ? "Today" : r === "7" ? "7d" : r === "30" ? "30d" : "90d"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((s) => (
          <div key={s.label} className="glass-card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
            <p className="text-xl font-display font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize whitespace-nowrap ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && <OverviewTab data={data} />}
      {tab === "traffic" && <TrafficTab dauData={dauData} deviceData={deviceData} browserData={browserData} countryData={countryData} />}
      {tab === "revenue" && <RevenueTab stripeData={stripeData} />}
      {tab === "usage" && <UsageTab toolStats={toolStats} dailyEventData={dailyEventData} eventCounts={eventCounts} />}
      {tab === "funnel" && <FunnelTab funnelSteps={funnelSteps} />}
      {tab === "users" && <UsersTab users={users} />}
    </div>
  );
}

function OverviewTab({ data }: { data: any }) {
  const { dauData, stripeData, toolStats } = data;
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ChartCard title="Daily Active Users">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dauData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke="#00C4EE" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue Trend">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stripeData?.revenueByDay || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: any) => [`$${v}`, "Revenue"]} />
            <Bar dataKey="amount" fill="#32D583" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Tools">
        <div className="space-y-2.5">
          {(toolStats || []).slice(0, 6).map((t: any, i: number) => {
            const maxCount = toolStats[0]?.count || 1;
            return (
              <div key={t.tool_name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <span className="text-sm flex-1 truncate">{t.tool_name.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold w-10 text-right">{t.count}</span>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <ChartCard title="Plan Distribution">
        <div className="flex items-center justify-center h-[250px]">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={[
                { name: "Free", value: (data.users || []).filter((u: any) => u.plan === "free").length },
                { name: "Pro", value: data.proUsers || 0 },
                { name: "Premium", value: data.premiumUsers || 0 },
              ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                {[0, 1, 2].map((i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function TrafficTab({ dauData, deviceData, browserData, countryData }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ChartCard title="Daily Active Users" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dauData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke="#00C4EE" strokeWidth={2} dot={{ fill: "#00C4EE", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Device Breakdown">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
              {deviceData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Browser Breakdown">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={browserData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
              {browserData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Countries" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={countryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="value" fill="#7C6FF7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function RevenueTab({ stripeData }: { stripeData: any }) {
  const mrr = (stripeData?.mrr || 0) / 100;
  const totalRev = (stripeData?.totalRevenue || 0) / 100;

  const revenueKpis = [
    { label: "MRR", value: `$${mrr.toFixed(2)}`, color: "#F5C842" },
    { label: "Period Revenue", value: `$${totalRev.toFixed(2)}`, color: "#32D583" },
    { label: "Active Subs", value: stripeData?.activeSubscriptions || 0, color: "#00C4EE" },
    { label: "Canceled", value: stripeData?.canceledSubscriptions || 0, color: "#FF6B6B" },
    { label: "Failed Payments", value: stripeData?.failedPayments || 0, color: "#FF9F43" },
    { label: "Churn Rate", value: `${stripeData?.churnRate || 0}%`, color: "#A855F7" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {revenueKpis.map((k) => (
          <div key={k.label} className="glass-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{k.label}</p>
            <p className="text-xl font-display font-bold" style={{ color: k.color }}>
              {typeof k.value === "number" ? k.value.toLocaleString() : k.value}
            </p>
          </div>
        ))}
      </div>

      <ChartCard title="Daily Revenue">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stripeData?.revenueByDay || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: any) => [`$${v}`, "Revenue"]} />
            <Bar dataKey="amount" fill="#32D583" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function UsageTab({ toolStats, dailyEventData, eventCounts }: any) {
  return (
    <div className="space-y-6">
      <ChartCard title="Event Counts">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(eventCounts || {}).map(([name, count]: [string, any]) => (
            <div key={name} className="p-3 rounded-lg bg-secondary/50">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{name.replace(/_/g, " ")}</p>
              <p className="text-lg font-bold">{count.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="All Tool Usage">
        <div className="space-y-2.5">
          {(toolStats || []).map((t: any) => {
            const maxCount = toolStats[0]?.count || 1;
            return (
              <div key={t.tool_name} className="flex items-center gap-3">
                <span className="text-sm flex-1 truncate">{t.tool_name.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{t.count.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}

function FunnelTab({ funnelSteps }: { funnelSteps: any[] }) {
  const maxVal = funnelSteps?.[0]?.count || 1;
  return (
    <div className="space-y-6">
      <ChartCard title="Conversion Funnel">
        <div className="space-y-3">
          {(funnelSteps || []).map((step, i) => {
            const width = maxVal > 0 ? Math.max((step.count / maxVal) * 100, 8) : 8;
            const prevCount = i > 0 ? funnelSteps[i - 1].count : step.count;
            const convRate = prevCount > 0 ? ((step.count / prevCount) * 100).toFixed(1) : "100";
            return (
              <div key={step.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{step.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{step.count.toLocaleString()}</span>
                    {i > 0 && (
                      <span className="text-xs text-muted-foreground">({convRate}%)</span>
                    )}
                  </div>
                </div>
                <div className="h-8 bg-secondary/50 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                    }}
                  >
                    <span className="text-xs font-semibold text-white truncate">{step.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <ChartCard title="Drop-off Analysis">
        <div className="space-y-2">
          {(funnelSteps || []).slice(1).map((step, i) => {
            const prev = funnelSteps[i];
            const dropoff = prev.count - step.count;
            const dropoffRate = prev.count > 0 ? ((dropoff / prev.count) * 100).toFixed(1) : "0";
            return (
              <div key={step.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <ArrowDownRight className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-sm flex-1">{prev.name} → {step.name}</span>
                <span className="text-sm font-semibold text-destructive">{dropoff.toLocaleString()} ({dropoffRate}%)</span>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}

function UsersTab({ users }: { users: any[] }) {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-3 text-muted-foreground font-medium">User</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Plan</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u: any) => (
              <tr key={u.user_id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-3 font-medium">{u.display_name || "—"}</td>
                <td className="p-3 text-muted-foreground text-xs">{u.email || "—"}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    u.plan === "premium" ? "bg-accent/10 text-accent" :
                    u.plan === "pro" ? "bg-primary/10 text-primary" :
                    "bg-secondary text-muted-foreground"
                  }`}>{u.plan}</span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <h3 className="font-display font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}
