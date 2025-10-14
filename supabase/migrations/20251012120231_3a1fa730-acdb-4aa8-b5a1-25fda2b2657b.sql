-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create cities table (simplified without unaccent in generated column)
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  search_text TEXT GENERATED ALWAYS AS (LOWER(name || ', ' || country)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cities_search ON public.cities USING gin(search_text gin_trgm_ops);
CREATE INDEX idx_cities_name ON public.cities(LOWER(name));

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read
CREATE POLICY "Anyone can read cities"
  ON public.cities
  FOR SELECT
  USING (true);