-- Add is_summary column to steps table
ALTER TABLE steps 
ADD COLUMN is_summary BOOLEAN DEFAULT false;

-- Make main_image non-nullable with a default placeholder
-- First update existing NULL values
UPDATE steps 
SET main_image = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80'
WHERE main_image IS NULL OR main_image = '';

-- Then alter the column to be non-nullable
ALTER TABLE steps 
ALTER COLUMN main_image SET NOT NULL,
ALTER COLUMN main_image SET DEFAULT 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80';