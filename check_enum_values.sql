-- Check enum values for project_role
-- Run this in your Supabase SQL Editor

-- Check what enum values exist
SELECT unnest(enum_range(NULL::project_role)) as valid_roles;

-- Check the current project_members table structure
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'project_members' AND column_name = 'role';
