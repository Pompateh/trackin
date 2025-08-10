-- Update pod_data table to support additional design rows
-- This script adds the necessary columns for the new functionality

-- Add the additional_design_rows column to store the new design rows data
ALTER TABLE pod_data 
ADD COLUMN IF NOT EXISTS additional_design_rows JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the new column
COMMENT ON COLUMN pod_data.additional_design_rows IS 'Array of additional design rows with scale lists, images, and comments';

-- Update existing records to have an empty array for additional_design_rows
UPDATE pod_data 
SET additional_design_rows = '[]'::jsonb 
WHERE additional_design_rows IS NULL;

-- Create an index on the additional_design_rows column for better performance
CREATE INDEX IF NOT EXISTS idx_pod_data_additional_design_rows 
ON pod_data USING GIN (additional_design_rows);

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'pod_data' 
ORDER BY ordinal_position;
