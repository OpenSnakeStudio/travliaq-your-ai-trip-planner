-- Create trips table
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  destination text NOT NULL,
  main_image text NOT NULL,
  flight_from text,
  flight_to text,
  flight_duration text,
  flight_type text,
  hotel_name text,
  hotel_rating numeric(2,1),
  total_price text,
  total_days integer NOT NULL DEFAULT 7,
  total_budget text,
  average_weather text,
  travel_style text,
  start_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create steps table (étapes)
CREATE TABLE public.steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  day_number integer NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  main_image text NOT NULL,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  why text NOT NULL,
  tips text NOT NULL,
  transfer text NOT NULL,
  suggestion text NOT NULL,
  weather_icon text NOT NULL,
  weather_temp text NOT NULL,
  weather_description text,
  price numeric(10,2),
  duration text,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trip_id, step_number)
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can read trips and steps (public access)
CREATE POLICY "Anyone can read trips"
  ON public.trips
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read steps"
  ON public.steps
  FOR SELECT
  USING (true);

-- Only authenticated admins can manage trips
CREATE POLICY "Admins can insert trips"
  ON public.trips
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update trips"
  ON public.trips
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete trips"
  ON public.trips
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can manage steps
CREATE POLICY "Admins can insert steps"
  ON public.steps
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update steps"
  ON public.steps
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete steps"
  ON public.steps
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_trips_code ON public.trips(code);
CREATE INDEX idx_steps_trip_id ON public.steps(trip_id);
CREATE INDEX idx_steps_step_number ON public.steps(trip_id, step_number);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_trip_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trip_updated_at();

CREATE TRIGGER update_steps_updated_at
  BEFORE UPDATE ON public.steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trip_updated_at();