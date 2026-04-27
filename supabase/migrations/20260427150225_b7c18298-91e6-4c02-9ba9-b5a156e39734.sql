
-- Extend app_plan enum to include 'trialing'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'trialing' AND enumtypid = 'public.app_plan'::regtype) THEN
    ALTER TYPE public.app_plan ADD VALUE 'trialing';
  END IF;
END $$;

-- Add trial-related columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS lifetime_credits_used INTEGER NOT NULL DEFAULT 0;

-- Lifetime usage RPC (counts every generation a user has ever made)
CREATE OR REPLACE FUNCTION public.get_lifetime_usage(p_user_id uuid)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER FROM public.usage_tracking WHERE user_id = p_user_id;
$$;
