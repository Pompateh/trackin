-- Simple fix for team members without RLS recursion
-- Run this in your Supabase SQL Editor

-- 1. Drop the problematic function first
DROP FUNCTION IF EXISTS get_projects_for_user(UUID);

-- 2. Create a simpler function that doesn't rely on complex RLS
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
        COALESCE(
            ARRAY_AGG(DISTINCT u.email) FILTER (WHERE u.email IS NOT NULL),
            ARRAY[]::TEXT[]
        ) as team_emails
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN auth.users u ON pm.user_id = u.id
    WHERE EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = p.id 
        AND user_id = user_id_param
    )
    GROUP BY p.id, p.name, p.notes, p.status, p.template_type, p.created_at
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_projects_for_user(UUID) TO authenticated;

-- 3. Ensure project_members table exists with correct structure
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role project_role DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 4. Create basic indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- 5. Add current user to projects that don't have members
INSERT INTO project_members (project_id, user_id, role)
SELECT DISTINCT p.id, auth.uid(), 'admin'::project_role
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = p.id
)
ON CONFLICT (project_id, user_id) DO NOTHING;
