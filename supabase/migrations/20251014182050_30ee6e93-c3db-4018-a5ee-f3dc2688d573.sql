-- Add step_type column to steps table (optional field)
ALTER TABLE steps ADD COLUMN step_type TEXT;

COMMENT ON COLUMN steps.step_type IS 'Type of the step: activity, restaurant, transport, accommodation, etc. (optional)';

-- Add multilingual support columns to trips table
ALTER TABLE trips ADD COLUMN destination_en TEXT;
ALTER TABLE trips ADD COLUMN travel_style_en TEXT;

COMMENT ON COLUMN trips.destination_en IS 'English translation of destination';
COMMENT ON COLUMN trips.travel_style_en IS 'English translation of travel style';

-- Add multilingual support columns to steps table
ALTER TABLE steps ADD COLUMN title_en TEXT;
ALTER TABLE steps ADD COLUMN subtitle_en TEXT;
ALTER TABLE steps ADD COLUMN why_en TEXT;
ALTER TABLE steps ADD COLUMN tips_en TEXT;
ALTER TABLE steps ADD COLUMN transfer_en TEXT;
ALTER TABLE steps ADD COLUMN suggestion_en TEXT;
ALTER TABLE steps ADD COLUMN weather_description_en TEXT;

COMMENT ON COLUMN steps.title_en IS 'English translation of title';
COMMENT ON COLUMN steps.subtitle_en IS 'English translation of subtitle';
COMMENT ON COLUMN steps.why_en IS 'English translation of why section';
COMMENT ON COLUMN steps.tips_en IS 'English translation of tips';
COMMENT ON COLUMN steps.transfer_en IS 'English translation of transfer info';
COMMENT ON COLUMN steps.suggestion_en IS 'English translation of suggestion';
COMMENT ON COLUMN steps.weather_description_en IS 'English translation of weather description';