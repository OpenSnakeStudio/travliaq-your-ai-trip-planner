-- Ajout d'un champ pour les statistiques dynamiques du summary
ALTER TABLE steps ADD COLUMN summary_stats JSONB DEFAULT NULL;

COMMENT ON COLUMN steps.summary_stats IS 'Statistiques personnalisées pour l''étape summary (format: array de {type, value, icon?, label?, color?})';