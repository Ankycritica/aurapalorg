import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompletionItem {
  label: string;
  done: boolean;
}

export function ProfileCompleteness() {
  const { user, profile } = useAuth();
  const [hasGeneration, setHasGeneration] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("generations").select("id").eq("user_id", user.id).limit(1)
      .then(({ data }) => { if (data && data.length > 0) setHasGeneration(true); });
  }, [user]);

  const items: CompletionItem[] = [
    { label: "Account created", done: !!user },
    { label: "Display name set", done: !!profile?.display_name },
    { label: "Email verified", done: !!user?.email_confirmed_at },
    { label: "First generation", done: hasGeneration },
    { label: "Upgraded plan", done: profile?.plan !== "free" },
  ];

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = Math.round((completed / total) * 100);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-sm mb-4">Profile Completeness</h3>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" className="stroke-secondary" />
            <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" className="stroke-primary"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.6s ease" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold font-display">{pct}%</span>
          </div>
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                item.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {item.done && <span className="text-[10px]">✓</span>}
              </div>
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
