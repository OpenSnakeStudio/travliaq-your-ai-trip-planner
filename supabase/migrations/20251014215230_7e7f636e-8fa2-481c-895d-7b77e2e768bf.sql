-- Add missing columns to trips table for detailed trip information
ALTER TABLE trips
ADD COLUMN travelers integer,
ADD COLUMN price_flights text,
ADD COLUMN price_hotels text,
ADD COLUMN price_transport text,
ADD COLUMN price_activities text;

-- Add comments for documentation
COMMENT ON COLUMN trips.travelers IS 'Number of travelers for this trip';
COMMENT ON COLUMN trips.price_flights IS 'Detailed price for flights (e.g., "320 €")';
COMMENT ON COLUMN trips.price_hotels IS 'Detailed price for hotels (e.g., "650 €")';
COMMENT ON COLUMN trips.price_transport IS 'Detailed price for transport (e.g., "80 €")';
COMMENT ON COLUMN trips.price_activities IS 'Detailed price for activities (e.g., "200 €")';