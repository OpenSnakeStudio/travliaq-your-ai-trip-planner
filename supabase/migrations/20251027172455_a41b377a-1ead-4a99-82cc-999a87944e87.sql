-- Idempotency table for SQS enqueues
CREATE TABLE IF NOT EXISTS public.answer_enqueues (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (service role will bypass)
ALTER TABLE public.answer_enqueues ENABLE ROW LEVEL SECURITY;