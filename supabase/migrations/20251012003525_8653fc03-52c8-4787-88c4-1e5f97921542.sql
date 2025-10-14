-- Add departure_location column to questionnaire_responses table
ALTER TABLE public.questionnaire_responses 
ADD COLUMN departure_location text;