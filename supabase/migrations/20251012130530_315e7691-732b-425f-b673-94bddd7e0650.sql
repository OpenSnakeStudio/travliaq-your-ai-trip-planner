-- Add new columns for approximate departure date tracking
ALTER TABLE questionnaire_responses 
ADD COLUMN has_approximate_departure_date text,
ADD COLUMN approximate_departure_date date;