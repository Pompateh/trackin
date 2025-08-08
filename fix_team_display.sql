-- Fix team member display in the function
-- Run this in your Supabase SQL Editor

-- Update the function to properly show team members
DROP FUNCTION IF EXISTS get_projects_for_user(UUID);

CREATE OR REPLACE FUNCTION get_projects_for_user(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    notes TEXT,
    status TEXT,
    template_type TEXT,
    created_at TIMESTAMPTZ,
    team_emails CHARACTER VARYING[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.notes,
        COALESCE(p.status::TEXT, 'on_going') as status,
        COALESCE(p.template_type::TEXT, 'branding') as template_type,
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
