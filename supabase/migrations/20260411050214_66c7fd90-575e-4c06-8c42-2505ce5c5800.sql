
-- Create analytics events table
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip text,
  country text,
  device text,
  browser text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert events
CREATE POLICY "Anyone can insert events"
ON public.analytics_events
FOR INSERT
TO public
WITH CHECK (true);

-- Only authenticated users can view their own events
CREATE POLICY "Users can view own events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create index for fast querying
CREATE INDEX idx_analytics_events_name_created ON public.analytics_events (event_name, created_at DESC);
CREATE INDEX idx_analytics_events_user ON public.analytics_events (user_id);

-- Enable realtime for analytics_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
