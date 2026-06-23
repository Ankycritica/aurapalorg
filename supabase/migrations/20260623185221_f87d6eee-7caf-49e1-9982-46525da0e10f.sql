ALTER TABLE public.analytics_events DROP COLUMN IF EXISTS ip;

-- Restrictive policies to explicitly deny client INSERT/DELETE on job_alert_sent.
-- Service role bypasses RLS, so backend inserts/deletes still work.
CREATE POLICY "job_alert_sent_no_client_insert"
  ON public.job_alert_sent AS RESTRICTIVE FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "job_alert_sent_no_client_delete"
  ON public.job_alert_sent AS RESTRICTIVE FOR DELETE
  TO anon, authenticated
  USING (false);