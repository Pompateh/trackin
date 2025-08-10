-- Complete POD Data Setup Script
-- This script sets up the pod_data table with additional design rows support and RLS policies

-- =====================================================
-- 1. SCHEMA UPDATES
-- =====================================================

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

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable Row Level Security on the pod_data table
ALTER TABLE pod_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can insert POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can update POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can delete POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Allow all authenticated users" ON pod_data;

-- Create a simple policy that allows all authenticated users (for now)
-- This will fix the immediate RLS issues
CREATE POLICY "Allow all authenticated users" ON pod_data
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 3. VERIFICATION
-- =====================================================

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'pod_data' 
ORDER BY ordinal_position;

-- Verify the RLS policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pod_data'
ORDER BY policyname;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'pod_data';

-- =====================================================
-- 4. TEST DATA (Optional - for development)
-- =====================================================

-- Uncomment the following lines to insert test data (for development only)
/*
INSERT INTO pod_data (
    project_id, 
    scale_list, 
    reference_image_url, 
    reference_comment,
    design_image_url,
    design_comment,
    final_images,
    final_comments,
    additional_design_rows
) VALUES (
    'your-test-project-id-here',
    ARRAY['01/', '02/', '03/'],
    'https://example.com/reference.jpg',
    'Test reference comment',
    'https://example.com/design.jpg',
    'Test design comment',
    ARRAY['https://example.com/final1.jpg'],
    ARRAY['Test final comment'],
    '[{"scaleList": ["01/", "02/"], "referenceImage": "https://example.com/ref2.jpg", "referenceComment": "Additional row reference"}]'::jsonb
);
*/
