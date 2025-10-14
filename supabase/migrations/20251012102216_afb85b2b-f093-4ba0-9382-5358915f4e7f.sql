-- Fix RLS policy to prevent public data exposure
-- Drop the vulnerable policy that allows anonymous access
DROP POLICY IF EXISTS "Users can view own responses" ON questionnaire_responses;

-- Create a secure policy that only allows authenticated users to view their own responses
CREATE POLICY "Users can view own responses"
ON questionnaire_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Note: Anonymous users who submitted without authentication won't be able to view their responses
-- This is intentional to prevent data exposure. Future submissions should require authentication.