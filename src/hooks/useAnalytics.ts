import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type EventName =
  | "page_view"
  | "start_chat"
  | "match_found"
  | "video_call_started"
  | "subscription_created"
  | "subscription_canceled"
  | "resume_uploaded"
  | "resume_generated"
  | "tool_used"
  | "coupon_shown"
  | "coupon_used"
  | "conversion_with_coupon"
  | "agent_run"
  | "agent_share";

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Other";
}

export function useAnalytics() {
  const { user } = useAuth();

  const track = useCallback(
    async (eventName: EventName, metadata?: Record<string, unknown>) => {
      try {
        await supabase.from("analytics_events" as any).insert({
          event_name: eventName,
          user_id: user?.id || null,
          metadata: metadata || {},
          device: getDeviceType(),
          browser: getBrowser(),
        } as any);
      } catch {
        // Silent fail - analytics should never break the app
      }
    },
    [user]
  );

  return { track };
}
