-- Pipeline stage enum
DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('saved', 'applied', 'interview', 'offer', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- saved_jobs
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source TEXT,
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT,
  company_domain TEXT,
  location TEXT,
  apply_url TEXT,
  jd_text TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT,
  status public.job_status NOT NULL DEFAULT 'saved',
  notes TEXT,
  next_action_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.saved_jobs(user_id, status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_jobs_user_external ON public.saved_jobs(user_id, source, external_id) WHERE external_id IS NOT NULL;

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_jobs_select_own" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_jobs_insert_own" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_jobs_update_own" ON public.saved_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_jobs_delete_own" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_saved_jobs_updated
BEFORE UPDATE ON public.saved_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- job_alerts
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency TEXT NOT NULL DEFAULT 'daily',
  active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON public.job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON public.job_alerts(active) WHERE active = true;

ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "job_alerts_select_own" ON public.job_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "job_alerts_insert_own" ON public.job_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "job_alerts_update_own" ON public.job_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "job_alerts_delete_own" ON public.job_alerts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_job_alerts_updated
BEFORE UPDATE ON public.job_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- job_alert_sent (dedupe what we've emailed)
CREATE TABLE IF NOT EXISTS public.job_alert_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.job_alerts(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_alert_sent ON public.job_alert_sent(alert_id, external_id);

ALTER TABLE public.job_alert_sent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "job_alert_sent_select_own" ON public.job_alert_sent
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_alerts a WHERE a.id = job_alert_sent.alert_id AND a.user_id = auth.uid())
);

-- hr_email_cache
CREATE TABLE IF NOT EXISTS public.hr_email_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_domain TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hr_cache_user_domain ON public.hr_email_cache(user_id, company_domain, created_at DESC);

ALTER TABLE public.hr_email_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hr_email_cache_select_own" ON public.hr_email_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "hr_email_cache_insert_own" ON public.hr_email_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hr_email_cache_delete_own" ON public.hr_email_cache FOR DELETE USING (auth.uid() = user_id);