-- Create a secure RPC function for claiming questionnaire responses
CREATE OR REPLACE FUNCTION public.claim_questionnaire_response(response_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow claiming if response has no user yet and was created recently
  UPDATE questionnaire_responses
  SET user_id = auth.uid()
  WHERE id = response_id
    AND user_id IS NULL
    AND created_at > now() - interval '1 hour';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_questionnaire_response(uuid) TO authenticated;