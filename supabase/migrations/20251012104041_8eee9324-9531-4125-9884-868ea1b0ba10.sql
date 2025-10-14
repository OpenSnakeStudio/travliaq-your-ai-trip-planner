-- Update claim_questionnaire_response function to add email validation
CREATE OR REPLACE FUNCTION public.claim_questionnaire_response(response_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  response_email text;
  user_email text;
BEGIN
  -- Get the authenticated user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get the response email
  SELECT email INTO response_email 
  FROM questionnaire_responses 
  WHERE id = response_id;
  
  IF response_email IS NULL THEN
    RAISE EXCEPTION 'Response not found';
  END IF;
  
  -- Verify email match and allow claiming only if:
  -- 1. Response has no user yet
  -- 2. Was created within 1 hour
  -- 3. Email matches the authenticated user
  UPDATE questionnaire_responses
  SET user_id = auth.uid()
  WHERE id = response_id
    AND user_id IS NULL
    AND created_at > now() - interval '1 hour'
    AND email = user_email;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot claim this response. Email mismatch or response expired.';
  END IF;
END;
$function$;