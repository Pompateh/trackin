-- Create Missing Project Script
-- This script creates the missing project that's causing the foreign key constraint violation

-- Create the missing project
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

-- Verify the project was created
SELECT 
    id,
    name,
    notes,
    created_at
FROM projects 
WHERE id = 'a6c07e34-de77-41b7-993c-21f16382fd5f';

-- Check if there are any POD data records for this project
SELECT 
    id,
    project_id,
    created_at
FROM pod_data 
WHERE project_id = 'a6c07e34-de77-41b7-993c-21f16382fd5f';
