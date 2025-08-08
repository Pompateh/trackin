-- Fix team members display issue
-- Run this in your Supabase SQL Editor

-- 1. First, let's check if project_members table exists
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role project_role DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- 3. Enable RLS on project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for project_members
DROP POLICY IF EXISTS "Users can view project members for projects they are members of" ON project_members;
CREATE POLICY "Users can view project members for projects they are members of" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = project_members.project_id 
            AND pm2.user_id = auth.uid()
            AND pm2.id != project_members.id
        )
    );

DROP POLICY IF EXISTS "Users can insert project members for projects they are members of" ON project_members;
CREATE POLICY "Users can insert project members for projects they are members of" ON project_members
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- 5. For existing projects that don't have any members, add the project creator as admin
-- (This is a fallback - ideally we'd know who created each project)
INSERT INTO project_members (project_id, user_id, role)
SELECT DISTINCT p.id, u.id, 'admin'::project_role
FROM projects p
CROSS JOIN auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = p.id
)
AND u.id = auth.uid()
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 6. Update the get_projects_for_user function to ensure it properly aggregates team emails
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
