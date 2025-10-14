-- Create table for questionnaire responses
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  
  -- Cadre du voyage
  travel_group TEXT,
  number_of_travelers INTEGER,
  has_destination TEXT,
  destination TEXT,
  climate_preference TEXT,
  travel_affinities JSONB,
  travel_ambiance TEXT,
  
  -- Dates
  dates_type TEXT,
  departure_date DATE,
  return_date DATE,
  flexibility TEXT,
  duration TEXT,
  exact_nights INTEGER,
  
  -- Budget
  budget TEXT,
  budget_type TEXT,
  budget_amount NUMERIC,
  budget_currency TEXT,
  
  -- Style & rythme
  styles JSONB,
  rhythm TEXT,
  
  -- Transport & mobilité
  flight_preference TEXT,
  luggage JSONB,
  mobility JSONB,
  
  -- Hébergement
  accommodation_type JSONB,
  comfort TEXT,
  neighborhood TEXT,
  amenities JSONB,
  
  -- Contraintes
  constraints JSONB,
  additional_info TEXT,
  open_comments TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (even unauthenticated users can submit)
CREATE POLICY "Anyone can submit questionnaire"
ON public.questionnaire_responses
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own responses
CREATE POLICY "Users can view own responses"
ON public.questionnaire_responses
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Policy: Users can update their own responses
CREATE POLICY "Users can update own responses"
ON public.questionnaire_responses
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_questionnaire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_questionnaire_responses_updated_at
BEFORE UPDATE ON public.questionnaire_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_questionnaire_updated_at();

-- Create index on email for faster lookups
CREATE INDEX idx_questionnaire_responses_email ON public.questionnaire_responses(email);

-- Create index on user_id for faster lookups
CREATE INDEX idx_questionnaire_responses_user_id ON public.questionnaire_responses(user_id);

-- Create index on created_at for sorting
CREATE INDEX idx_questionnaire_responses_created_at ON public.questionnaire_responses(created_at DESC);