-- Allow everyone to read airport reference data (public lookup data)
CREATE POLICY "Anyone can read airports"
ON public.airports
FOR SELECT
TO public
USING (true);