-- Add test data to see team members and deadlines working
-- Run this in your Supabase SQL Editor

-- 1. Add some deadlines to existing projects
UPDATE projects 
SET deadline = NOW() + INTERVAL '30 days'
WHERE deadline IS NULL
AND id IN (
    SELECT id FROM projects 
    WHERE deadline IS NULL 
    ORDER BY created_at DESC 
    LIMIT 3
);

-- 2. Add some team members to projects (if you have other users)
-- This will add the current user as admin to all projects that don't have members
INSERT INTO project_members (project_id, user_id, role)
SELECT DISTINCT p.id, auth.uid(), 'admin'::project_role
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = p.id
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 3. Check what data we have
SELECT 
    p.id,
    p.name,
    p.deadline,
    p.status,
    COUNT(pm.user_id) as member_count
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id, p.name, p.deadline, p.status
ORDER BY p.created_at DESC;
