-- Debug script to check team members issue
-- Run this in your Supabase SQL Editor to diagnose the problem

-- 1. Check if project_members table exists and has data
SELECT 'Project Members Count:' as info, COUNT(*) as count FROM project_members;

-- 2. Check if current user is in any projects
SELECT 'Current user projects:' as info, COUNT(*) as count 
FROM project_members 
WHERE user_id = auth.uid();

-- 3. Check a sample project with its members
SELECT 
    p.id as project_id,
    p.name as project_name,
    pm.user_id,
    u.email as member_email
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN auth.users u ON pm.user_id = u.id
LIMIT 10;

-- 4. Test the function directly
SELECT * FROM get_projects_for_user(auth.uid()) LIMIT 5;

-- 5. Check if there are any projects without members
SELECT 'Projects without members:' as info, COUNT(*) as count
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = p.id
);
