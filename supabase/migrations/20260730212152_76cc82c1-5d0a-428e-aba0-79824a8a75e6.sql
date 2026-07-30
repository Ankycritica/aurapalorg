
-- ===== Ad creatives (house + network fallback inventory) =====
CREATE TABLE public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'house',
  format TEXT NOT NULL DEFAULT 'native',
  headline TEXT NOT NULL,
  body TEXT,
  cta_label TEXT,
  image_url TEXT,
  click_url TEXT NOT NULL,
  advertiser TEXT,
  cpm_cents INTEGER NOT NULL DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 1,
  target_tools TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ad_creatives TO anon, authenticated;
GRANT ALL ON public.ad_creatives TO service_role;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ad creatives"
  ON public.ad_creatives FOR SELECT
  USING (active = true);

CREATE TRIGGER update_ad_creatives_updated_at
  BEFORE UPDATE ON public.ad_creatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Ad impressions =====
CREATE TABLE public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  creative_id UUID REFERENCES public.ad_creatives(id) ON DELETE SET NULL,
  slot_id TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'house',
  format TEXT NOT NULL DEFAULT 'native',
  tool_name TEXT,
  revenue_cents NUMERIC(12,4) NOT NULL DEFAULT 0,
  user_share_cents NUMERIC(12,4) NOT NULL DEFAULT 0,
  clicked BOOLEAN NOT NULL DEFAULT false,
  duration_ms INTEGER,
  country TEXT,
  device TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ad_impressions TO authenticated;
GRANT ALL ON public.ad_impressions TO service_role;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own impressions"
  ON public.ad_impressions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "ad_impressions_no_client_insert"
  ON public.ad_impressions AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "ad_impressions_no_client_update"
  ON public.ad_impressions AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false);

CREATE POLICY "ad_impressions_no_client_delete"
  ON public.ad_impressions AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

CREATE INDEX idx_ad_impressions_user_created ON public.ad_impressions (user_id, created_at DESC);

-- ===== Ad earnings ledger =====
CREATE TABLE public.ad_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount_cents NUMERIC(12,4) NOT NULL DEFAULT 0,
  entry_type TEXT NOT NULL DEFAULT 'impression_share',
  description TEXT,
  reference_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ad_earnings TO authenticated;
GRANT ALL ON public.ad_earnings TO service_role;
ALTER TABLE public.ad_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings"
  ON public.ad_earnings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "ad_earnings_no_client_insert"
  ON public.ad_earnings AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "ad_earnings_no_client_update"
  ON public.ad_earnings AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false);

CREATE POLICY "ad_earnings_no_client_delete"
  ON public.ad_earnings AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

CREATE INDEX idx_ad_earnings_user_created ON public.ad_earnings (user_id, created_at DESC);

-- ===== Profile columns =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ads_opt_out BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ad_earnings_total_cents NUMERIC(12,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ad_payout_balance_cents NUMERIC(12,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;

-- Protect the new money fields from client-side tampering (ads_opt_out stays user-editable)
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
     OR NEW.ad_earnings_total_cents IS DISTINCT FROM OLD.ad_earnings_total_cents
     OR NEW.ad_payout_balance_cents IS DISTINCT FROM OLD.ad_payout_balance_cents
     OR NEW.stripe_connect_account_id IS DISTINCT FROM OLD.stripe_connect_account_id
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;

  RETURN NEW;
END;
$function$;

-- ===== Read helpers =====
CREATE OR REPLACE FUNCTION public.get_ad_earnings_summary(p_user_id uuid)
RETURNS TABLE (total_cents numeric, pending_cents numeric, impressions bigint, clicks bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    COALESCE((SELECT SUM(amount_cents) FROM public.ad_earnings WHERE user_id = p_user_id), 0),
    COALESCE((SELECT SUM(amount_cents) FROM public.ad_earnings WHERE user_id = p_user_id AND status = 'pending'), 0),
    (SELECT COUNT(*) FROM public.ad_impressions WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM public.ad_impressions WHERE user_id = p_user_id AND clicked = true);
$$;

REVOKE EXECUTE ON FUNCTION public.get_ad_earnings_summary(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_ad_earnings_summary(uuid) TO authenticated, service_role;

-- ===== Seed house ads =====
INSERT INTO public.ad_creatives (name, network, format, headline, body, cta_label, click_url, advertiser, cpm_cents, weight, target_tools)
VALUES
  ('House — Premium upgrade', 'house', 'native', 'Skip the wait. Go Premium.', 'Unlimited AI generations, priority processing, zero ads — and you still earn from ads if you keep them on.', 'See plans', '/pricing', 'AuraPal', 0, 3, '{}'),
  ('House — Referral program', 'house', 'sponsored_card', 'Invite a friend, get 10 credits', 'Share your AuraPal link. They get 5 credits, you get 10. Up to 100 credits free.', 'Get my link', '/dashboard', 'AuraPal', 0, 2, '{}'),
  ('House — Job Finder', 'house', 'banner', 'Live jobs from 8 global boards', 'Search real, active roles in your city and auto-tailor your resume in one click.', 'Find jobs', '/jobs', 'AuraPal', 0, 2, '{}'),
  ('House — Resume templates', 'house', 'native', '40+ ATS-ready resume templates', 'Recruiter-approved layouts that parse cleanly in every applicant tracking system.', 'Browse templates', '/templates', 'AuraPal', 0, 1, '{resume-builder,resume-roast,cover-letter}');
