-- Nettoyer les anciennes valeurs de rhythm
UPDATE questionnaire_responses SET rhythm = NULL WHERE rhythm IS NOT NULL;

-- Ajouter les nouveaux champs au questionnaire
ALTER TABLE questionnaire_responses
  ADD COLUMN IF NOT EXISTS schedule_prefs text[],
  ADD COLUMN IF NOT EXISTS help_with text[],
  ADD COLUMN IF NOT EXISTS hotel_preferences text[];

-- Ajouter des contraintes de validation
ALTER TABLE questionnaire_responses
  ADD CONSTRAINT rhythm_check CHECK (rhythm IN ('relaxed', 'balanced', 'intense') OR rhythm IS NULL);

COMMENT ON COLUMN questionnaire_responses.rhythm IS 'Rythme de voyage souhaité: relaxed, balanced, ou intense (obligatoire)';
COMMENT ON COLUMN questionnaire_responses.schedule_prefs IS 'Préférences horaires: early_bird, night_owl, needs_siesta, needs_breaks, off_season, high_season (max 3)';
COMMENT ON COLUMN questionnaire_responses.help_with IS 'Domaines d''aide souhaités: flights, lodging, activities';
COMMENT ON COLUMN questionnaire_responses.hotel_preferences IS 'Préférences hôtelières: all_inclusive, half_board, breakfast_only, none';