-- Debug script to check what data is being returned
-- Run this in your Supabase SQL Editor

-- 1. Check what the function returns
SELECT * FROM get_projects_for_user(auth.uid()) LIMIT 3;

-- 2. Check project_members data
SELECT 
    p.id as project_id,
    p.name as project_name,
    pm.user_id,
    u.email as member_email,
    pm.role
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN auth.users u ON pm.user_id = u.id
LIMIT 10;

-- 3. Check if projects have deadlines
SELECT 
    id,
    name,
    deadline,
    status,
    template_type
FROM projects
LIMIT 5;
