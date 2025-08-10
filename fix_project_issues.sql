-- Fix Project Issues Script
-- This script diagnoses and fixes project-related issues

-- =====================================================
-- 1. DIAGNOSE ISSUES
-- =====================================================

-- Check if the specific project exists
SELECT 
    id,
    name,
    created_at
FROM projects 
WHERE id = 'a6c07e34-de77-41b7-993c-21f16382fd5f';

-- Check all projects to see what exists
SELECT 
    id,
    name,
    created_at
FROM projects 
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any POD data records
SELECT 
    id,
    project_id,
    created_at
FROM pod_data 
ORDER BY created_at DESC
LIMIT 10;

-- Check for orphaned POD data (POD data without corresponding projects)
SELECT 
    pd.id as pod_data_id,
    pd.project_id,
    pd.created_at as pod_created_at
FROM pod_data pd
LEFT JOIN projects p ON pd.project_id = p.id
WHERE p.id IS NULL;

-- =====================================================
-- 2. FIX ISSUES
-- =====================================================

-- Option 1: Create the missing project if it doesn't exist
-- Uncomment the following lines if you want to create the project
/*
INSERT INTO projects (id, name, created_at)
VALUES (
    'a6c07e34-de77-41b7-993c-21f16382fd5f',
    'Test Project',
    NOW()
)
ON CONFLICT (id) DO NOTHING;
*/

-- Option 2: Clean up orphaned POD data
-- Uncomment the following lines if you want to delete orphaned POD data
/*
DELETE FROM pod_data 
WHERE project_id NOT IN (SELECT id FROM projects);
*/

-- Option 3: Disable foreign key constraint temporarily (for development)
-- Uncomment the following lines if you want to disable the constraint temporarily
/*
ALTER TABLE pod_data 
DROP CONSTRAINT IF EXISTS pod_data_project_id_fkey;

-- Re-add the constraint later when needed
-- ALTER TABLE pod_data 
-- ADD CONSTRAINT pod_data_project_id_fkey 
-- FOREIGN KEY (project_id) REFERENCES projects(id);
*/

-- =====================================================
-- 3. VERIFICATION
-- =====================================================

-- Check projects table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='pod_data';

-- =====================================================
-- 4. CREATE TEST PROJECT (if needed)
-- =====================================================

-- Uncomment to create a test project with the specific ID
/*
INSERT INTO projects (id, name, notes, created_at)
VALUES (
    'a6c07e34-de77-41b7-993c-21f16382fd5f',
    'Test Project for POD',
    'Test notes for the project',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    notes = EXCLUDED.notes;
*/
