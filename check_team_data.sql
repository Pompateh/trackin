-- Check team member data
-- Run this in your Supabase SQL Editor

-- 1. Check what team members exist
SELECT 
    pm.project_id,
    p.name as project_name,
    pm.user_id,
    u.email as user_email,
    pm.role
FROM project_members pm
JOIN projects p ON pm.project_id = p.id
JOIN auth.users u ON pm.user_id = u.id
ORDER BY p.created_at DESC;

-- 2. Check how many members each project has
SELECT 
    p.id,
    p.name,
    COUNT(pm.user_id) as member_count,
    ARRAY_AGG(u.email) as member_emails
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN auth.users u ON pm.user_id = u.id
GROUP BY p.id, p.name
ORDER BY p.created_at DESC;
