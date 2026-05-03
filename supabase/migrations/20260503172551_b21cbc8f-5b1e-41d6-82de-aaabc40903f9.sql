
-- Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_credits_earned INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_credits_earned INTEGER NOT NULL DEFAULT 0;

-- Backfill referral_code for existing users
UPDATE public.profiles
SET referral_code = UPPER(SUBSTRING(REPLACE(user_id::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  referrer_ip TEXT,
  referred_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they made"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- No INSERT/UPDATE/DELETE policies: only service role (edge function) writes.

-- Update handle_new_user to also assign a referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8))
  );
  RETURN NEW;
END;
$function$;

-- Dynamic free limit function
CREATE OR REPLACE FUNCTION public.get_free_limit(p_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 5
    + LEAST(COALESCE(referral_credits_earned, 0), 100)
    + LEAST(COALESCE(share_credits_earned, 0), 50)
  FROM public.profiles WHERE user_id = p_user_id;
$$;

-- Today's share count via analytics_events
CREATE OR REPLACE FUNCTION public.get_today_share_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER FROM public.analytics_events
  WHERE user_id = p_user_id
    AND event_name = 'share_reward'
    AND created_at >= CURRENT_DATE;
$$;
