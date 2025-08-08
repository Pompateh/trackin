-- Debug the get_projects_for_user function
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what the function is actually returning
SELECT * FROM get_projects_for_user(auth.uid());

-- 2. Let's also check the raw data to compare
SELECT 
    p.id,
    p.name,
    p.notes,
    p.status,
    p.template_type,
    p.created_at,
    p.deadline,
    ARRAY_AGG(DISTINCT u.email) as team_emails
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN auth.users u ON pm.user_id = u.id
WHERE EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = p.id 
    AND user_id = auth.uid()
)
GROUP BY p.id, p.name, p.notes, p.status, p.template_type, p.created_at, p.deadline
ORDER BY p.created_at DESC;
