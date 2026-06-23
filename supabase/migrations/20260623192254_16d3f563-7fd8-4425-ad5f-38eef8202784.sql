ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS promo_pro_until TIMESTAMPTZ;

ALTER TABLE public.profiles DISABLE TRIGGER USER;

UPDATE public.profiles
SET plan = 'pro',
    promo_pro_until = TIMESTAMPTZ '2026-10-01 00:00:00+00'
WHERE plan = 'free'
  AND (promo_pro_until IS NULL OR promo_pro_until < TIMESTAMPTZ '2026-10-01 00:00:00+00');

ALTER TABLE public.profiles ENABLE TRIGGER USER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_promo_end TIMESTAMPTZ := TIMESTAMPTZ '2026-10-01 00:00:00+00';
  v_plan TEXT := 'free';
  v_promo TIMESTAMPTZ := NULL;
BEGIN
  IF now() < v_promo_end THEN
    v_plan := 'pro';
    v_promo := v_promo_end;
  END IF;

  INSERT INTO public.profiles (user_id, email, display_name, referral_code, plan, promo_pro_until)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8)),
    v_plan,
    v_promo
  );
  RETURN NEW;
END;
$function$;