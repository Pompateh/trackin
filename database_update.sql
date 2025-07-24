-- Add font family columns to grid_items table
-- Run this in your Supabase SQL Editor

-- Add font family columns for each text element
ALTER TABLE grid_items 
ADD COLUMN IF NOT EXISTS title_font_family TEXT DEFAULT 'gothic a1',
ADD COLUMN IF NOT EXISTS subtitle_font_family TEXT DEFAULT 'gothic a1',
ADD COLUMN IF NOT EXISTS body_font_family TEXT DEFAULT 'gothic a1';

-- Add image positioning and scaling columns
ALTER TABLE grid_items 
ADD COLUMN IF NOT EXISTS image_position_x REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_position_y REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_scale REAL DEFAULT 1;

-- Update existing records to have default font values
UPDATE grid_items 
SET 
  title_font_family = 'gothic a1',
  subtitle_font_family = 'gothic a1',
  body_font_family = 'gothic a1'
WHERE title_font_family IS NULL 
   OR subtitle_font_family IS NULL 
   OR body_font_family IS NULL; 