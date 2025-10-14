-- Rendre la table steps beaucoup plus flexible
-- Tous les champs descriptifs deviennent optionnels

ALTER TABLE public.steps 
  ALTER COLUMN subtitle DROP NOT NULL,
  ALTER COLUMN main_image DROP NOT NULL,
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL,
  ALTER COLUMN why DROP NOT NULL,
  ALTER COLUMN tips DROP NOT NULL,
  ALTER COLUMN transfer DROP NOT NULL,
  ALTER COLUMN suggestion DROP NOT NULL,
  ALTER COLUMN weather_icon DROP NOT NULL,
  ALTER COLUMN weather_temp DROP NOT NULL;

-- Ajouter des valeurs par défaut vides pour faciliter l'insertion
ALTER TABLE public.steps 
  ALTER COLUMN subtitle SET DEFAULT '',
  ALTER COLUMN main_image SET DEFAULT '',
  ALTER COLUMN why SET DEFAULT '',
  ALTER COLUMN tips SET DEFAULT '',
  ALTER COLUMN transfer SET DEFAULT '',
  ALTER COLUMN suggestion SET DEFAULT '',
  ALTER COLUMN weather_icon SET DEFAULT '',
  ALTER COLUMN weather_temp SET DEFAULT '';

-- Rendre aussi plus de champs optionnels dans trips
ALTER TABLE public.trips
  ALTER COLUMN main_image DROP NOT NULL;

ALTER TABLE public.trips
  ALTER COLUMN main_image SET DEFAULT '';

-- Créer un index pour améliorer les performances de recherche par code
CREATE INDEX IF NOT EXISTS idx_trips_code_lower ON public.trips (LOWER(code));

COMMENT ON TABLE public.trips IS 'Table des voyages - tous les champs sauf id, code, destination et total_days sont optionnels';
COMMENT ON TABLE public.steps IS 'Table des étapes d''un voyage - seuls trip_id, step_number, day_number et title sont obligatoires. Tous les autres champs sont optionnels pour permettre une grande flexibilité.';