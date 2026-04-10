import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  pro: 100,
  premium: Infinity,
};

export function useUsage() {
  const { user, profile } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const plan = profile?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 5;
  const remaining = Math.max(0, limit - usageCount);
  const isLimitReached = usageCount >= limit;

  const fetchUsage = useCallback(async () => {
    if (!user) { setUsageCount(0); setLoading(false); return; }
    const { data, error } = await supabase.rpc("get_daily_usage", { p_user_id: user.id });
    if (!error && data !== null) setUsageCount(data as number);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const trackUsage = useCallback(async (toolName: string) => {
    if (!user) return false;
    if (isLimitReached) return false;
    const { error } = await supabase.from("usage_tracking").insert({
      user_id: user.id,
      tool_name: toolName,
    });
    if (!error) {
      setUsageCount(c => c + 1);
      return true;
    }
    return false;
  }, [user, isLimitReached]);

  return { usageCount, limit, remaining, isLimitReached, trackUsage, loading, plan, refetch: fetchUsage };
}
