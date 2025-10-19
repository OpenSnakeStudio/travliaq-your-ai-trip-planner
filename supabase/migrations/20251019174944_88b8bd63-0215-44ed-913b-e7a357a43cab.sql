-- Add language column to questionnaire_responses table
ALTER TABLE questionnaire_responses
ADD COLUMN language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en'));

-- Add comment to explain the column
COMMENT ON COLUMN questionnaire_responses.language IS 'Language used to answer the questionnaire (fr or en)';