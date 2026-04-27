import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Free users get 5 LIFETIME credits (then must start trial)
// Trial / Pro get 100 / day. Premium = unlimited.
const FREE_LIFETIME_LIMIT = 5;
const DAILY_LIMITS: Record<string, number> = {
  trialing: 100,
  pro: 100,
  premium: Infinity,
};

export function useUsage() {
  const { user, profile } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";

  const limit = isFree ? FREE_LIFETIME_LIMIT : (DAILY_LIMITS[plan] ?? 100);
  const remaining = Math.max(0, limit - usageCount);
  const isLimitReached = usageCount >= limit;

  const fetchUsage = useCallback(async () => {
    if (!user) { setUsageCount(0); setLoading(false); return; }
    const rpc = isFree ? "get_lifetime_usage" : "get_daily_usage";
    const { data, error } = await supabase.rpc(rpc, { p_user_id: user.id });
    if (!error && data !== null) setUsageCount(data as number);
    setLoading(false);
  }, [user, isFree]);

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

  return {
    usageCount,
    limit,
    remaining,
    isLimitReached,
    trackUsage,
    loading,
    plan,
    isFree,
    refetch: fetchUsage,
  };
}
