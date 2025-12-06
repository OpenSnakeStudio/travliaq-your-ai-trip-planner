-- ============================================================================
-- Ajout de la colonne trip_code à trip_summaries
-- ============================================================================

ALTER TABLE public.trip_summaries
ADD COLUMN IF NOT EXISTS trip_code TEXT;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_trip_summaries_trip_code
ON public.trip_summaries(trip_code);

-- Commentaire
COMMENT ON COLUMN trip_summaries.trip_code IS
'Code du trip généré (ex: OSLO-2025-101D4A)';
