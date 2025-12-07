-- Enable RLS on trip_summaries table
ALTER TABLE public.trip_summaries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own trip summaries (by email match)
CREATE POLICY "Users can view own trip summaries"
ON public.trip_summaries
FOR SELECT
USING (
  auth.jwt() ->> 'email' = user_email
  OR public.has_role(auth.uid(), 'admin')
);

-- Policy: Only admins can insert trip summaries
CREATE POLICY "Admins can insert trip summaries"
ON public.trip_summaries
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can update trip summaries
CREATE POLICY "Admins can update trip summaries"
ON public.trip_summaries
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete trip summaries
CREATE POLICY "Admins can delete trip summaries"
ON public.trip_summaries
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));