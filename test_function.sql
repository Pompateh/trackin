-- Test the function directly
-- Run this in your Supabase SQL Editor

-- Test the function with the current user
SELECT * FROM get_projects_for_user(auth.uid());

-- Test just the team_emails to see what we get
SELECT 
    p.name,
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
GROUP BY p.id, p.name, p.deadline
ORDER BY p.created_at DESC;

-- Also test with a specific user ID (replace with your actual user ID)
-- SELECT * FROM get_projects_for_user('your-user-id-here');
