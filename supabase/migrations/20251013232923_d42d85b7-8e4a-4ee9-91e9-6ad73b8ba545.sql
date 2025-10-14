-- 1) Placeholder image constant
DO $$ BEGIN END $$; -- no-op block just to keep migration atomic

-- 2) Sanitize existing trips main_image
UPDATE trips
SET main_image = COALESCE(NULLIF(main_image, ''), 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')
WHERE main_image IS NULL OR main_image = '';

-- 3) Ensure trips.main_image NOT NULL with sensible default
ALTER TABLE trips
  ALTER COLUMN main_image SET DEFAULT 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80';
ALTER TABLE trips
  ALTER COLUMN main_image SET NOT NULL;

-- 4) BEFORE INSERT/UPDATE trigger to sanitize trips.main_image
CREATE OR REPLACE FUNCTION public.sanitize_trip_main_image()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.main_image := COALESCE(NULLIF(NEW.main_image, ''), 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sanitize_trip_main_image ON trips;
CREATE TRIGGER trg_sanitize_trip_main_image
BEFORE INSERT OR UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_trip_main_image();

-- 5) BEFORE INSERT/UPDATE trigger to sanitize steps.main_image with coherent reuse
CREATE OR REPLACE FUNCTION public.sanitize_step_main_image()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_image text;
  trip_image text;
BEGIN
  IF NEW.main_image IS NULL OR NEW.main_image = '' THEN
    -- Try previous step image for the same trip
    SELECT s.main_image INTO prev_image
    FROM steps s
    WHERE s.trip_id = NEW.trip_id
      AND s.step_number < COALESCE(NEW.step_number, 2147483647)
    ORDER BY s.step_number DESC
    LIMIT 1;

    -- Get trip main image
    SELECT t.main_image INTO trip_image FROM trips t WHERE t.id = NEW.trip_id;

    NEW.main_image := COALESCE(prev_image, trip_image, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sanitize_step_main_image ON steps;
CREATE TRIGGER trg_sanitize_step_main_image
BEFORE INSERT OR UPDATE ON steps
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_step_main_image();

-- 6) Enforce at most one summary step per trip
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'unique_summary_step_per_trip'
  ) THEN
    CREATE UNIQUE INDEX unique_summary_step_per_trip ON steps(trip_id) WHERE is_summary = true;
  END IF;
END $$;

-- 7) Update insert_trip_from_json to coalesce images properly
CREATE OR REPLACE FUNCTION public.insert_trip_from_json(trip_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_trip_id uuid;
  step_item jsonb;
  trip_main text;
BEGIN
  -- Insert main trip
  INSERT INTO trips (
    code,
    destination,
    total_days,
    main_image,
    flight_from,
    flight_to,
    flight_duration,
    flight_type,
    hotel_name,
    hotel_rating,
    total_price,
    total_budget,
    average_weather,
    travel_style,
    start_date
  ) VALUES (
    trip_data->>'code',
    trip_data->>'destination',
    (trip_data->>'total_days')::integer,
    COALESCE(NULLIF(trip_data->>'main_image', ''), 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80'),
    NULLIF(trip_data->>'flight_from', ''),
    NULLIF(trip_data->>'flight_to', ''),
    NULLIF(trip_data->>'flight_duration', ''),
    NULLIF(trip_data->>'flight_type', ''),
    NULLIF(trip_data->>'hotel_name', ''),
    NULLIF(trip_data->>'hotel_rating', '')::numeric,
    NULLIF(trip_data->>'total_price', ''),
    NULLIF(trip_data->>'total_budget', ''),
    NULLIF(trip_data->>'average_weather', ''),
    NULLIF(trip_data->>'travel_style', ''),
    NULLIF(trip_data->>'start_date', '')::date
  ) RETURNING id, main_image INTO new_trip_id, trip_main;

  -- Insert steps
  FOR step_item IN SELECT * FROM jsonb_array_elements(trip_data->'steps')
  LOOP
    INSERT INTO steps (
      trip_id,
      step_number,
      day_number,
      title,
      subtitle,
      main_image,
      is_summary,
      latitude,
      longitude,
      why,
      tips,
      transfer,
      suggestion,
      weather_icon,
      weather_temp,
      weather_description,
      price,
      duration,
      images
    ) VALUES (
      new_trip_id,
      (step_item->>'step_number')::integer,
      (step_item->>'day_number')::integer,
      step_item->>'title',
      NULLIF(step_item->>'subtitle', ''),
      COALESCE(NULLIF(step_item->>'main_image', ''), trip_main, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80'),
      COALESCE((step_item->>'is_summary')::boolean, false),
      NULLIF(step_item->>'latitude', '')::numeric,
      NULLIF(step_item->>'longitude', '')::numeric,
      NULLIF(step_item->>'why', ''),
      NULLIF(step_item->>'tips', ''),
      NULLIF(step_item->>'transfer', ''),
      NULLIF(step_item->>'suggestion', ''),
      NULLIF(step_item->>'weather_icon', ''),
      NULLIF(step_item->>'weather_temp', ''),
      NULLIF(step_item->>'weather_description', ''),
      NULLIF(step_item->>'price', '')::numeric,
      NULLIF(step_item->>'duration', ''),
      COALESCE(step_item->'images', '[]'::jsonb)
    );
  END LOOP;

  RETURN new_trip_id;
END;
$function$;