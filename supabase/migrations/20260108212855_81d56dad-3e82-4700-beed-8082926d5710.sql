-- Migration: Add user_id to trip_summaries and update RLS to use UUID instead of email
-- This improves security and performance

-- Step 1: Add user_id column (nullable initially for backfill)
ALTER TABLE public.trip_summaries 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: Backfill user_id from auth.users by matching email
-- Note: This requires the emails to match exactly
UPDATE public.trip_summaries ts
SET user_id = au.id
FROM auth.users au
WHERE ts.user_email = au.email
AND ts.user_id IS NULL;

-- Step 3: Create index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_trip_summaries_user_id 
ON public.trip_summaries(user_id);

-- Step 4: Drop the old email-based policy
DROP POLICY IF EXISTS "Users can view own trip summaries" ON public.trip_summaries;

-- Step 5: Create new policy using user_id (with fallback to email for orphaned records)
CREATE POLICY "Users can view own trip summaries"
ON public.trip_summaries
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR (user_id IS NULL AND (auth.jwt() ->> 'email') = user_email)
  OR has_role(auth.uid(), 'admin')
);