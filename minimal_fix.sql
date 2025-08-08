-- Minimal fix to get the app working
-- Run this in your Supabase SQL Editor

-- 1. Drop and recreate the function without complex logic
DROP FUNCTION IF EXISTS get_projects_for_user(UUID);

CREATE OR REPLACE FUNCTION get_projects_for_user(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    notes TEXT,
    status TEXT,
    template_type TEXT,
    created_at TIMESTAMPTZ,
    team_emails TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.notes,
        COALESCE(p.status, 'on_going') as status,
        COALESCE(p.template_type, 'branding') as template_type,
        p.created_at,
        ARRAY[]::TEXT[] as team_emails
    FROM projects p
    WHERE EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = p.id 
        AND user_id = user_id_param
    )
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_projects_for_user(UUID) TO authenticated;

-- 2. Ensure project_members table exists (don't change existing structure)
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 3. Add current user to projects that don't have members
INSERT INTO project_members (project_id, user_id, role)
SELECT DISTINCT p.id, auth.uid(), 'admin'
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = p.id
)
ON CONFLICT (project_id, user_id) DO NOTHING;
