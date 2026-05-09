
-- 1. Profiles: prevent users from elevating their own plan / credits / stripe ids
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role / postgres / supabase_admin to change anything
  IF current_setting('role', true) IN ('service_role', 'supabase_admin', 'postgres') THEN
    RETURN NEW;
  END IF;

  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.trial_start IS DISTINCT FROM OLD.trial_start
     OR NEW.trial_end IS DISTINCT FROM OLD.trial_end
     OR NEW.grace_until IS DISTINCT FROM OLD.grace_until
     OR NEW.lifetime_credits_used IS DISTINCT FROM OLD.lifetime_credits_used
     OR NEW.referral_credits_earned IS DISTINCT FROM OLD.referral_credits_earned
     OR NEW.share_credits_earned IS DISTINCT FROM OLD.share_credits_earned
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.email IS DISTINCT FROM OLD.email
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2. Hide stripe ids from client
REVOKE SELECT (stripe_customer_id, stripe_subscription_id) ON public.profiles FROM authenticated, anon;

-- 3. usage_tracking: only service role inserts
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
REVOKE INSERT ON public.usage_tracking FROM authenticated, anon;

-- 4. referrals: drop IP columns
ALTER TABLE public.referrals DROP COLUMN IF EXISTS referrer_ip;
ALTER TABLE public.referrals DROP COLUMN IF EXISTS referred_ip;

-- 5. analytics_events: remove from realtime + tighten insert policy
ALTER PUBLICATION supabase_realtime DROP TABLE public.analytics_events;

DROP POLICY IF EXISTS "Anyone can insert events" ON public.analytics_events;
CREATE POLICY "Insert own analytics events"
ON public.analytics_events
FOR INSERT TO public
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 6. Lock down SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.get_lifetime_usage(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_daily_usage(uuid)   FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_free_limit(uuid)    FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_today_share_count(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_plan(uuid)     FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()       FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM anon, authenticated, public;

GRANT EXECUTE ON FUNCTION public.get_lifetime_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_usage(uuid)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_free_limit(uuid)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_today_share_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid)     TO authenticated;
