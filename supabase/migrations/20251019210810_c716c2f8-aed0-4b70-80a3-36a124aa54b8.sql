-- Rename budget column to budget_per_person for clarity
ALTER TABLE questionnaire_responses 
RENAME COLUMN budget TO budget_per_person;