-- Fix the type mismatch issue
-- Run this in your Supabase SQL Editor

-- Drop the problematic function
DROP FUNCTION IF EXISTS get_projects_for_user(UUID);

-- Create a function that matches the actual return types
CREATE OR REPLACE FUNCTION get_projects_for_user(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    notes TEXT,
    status TEXT,
    template_type TEXT,
    created_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    team_emails CHARACTER VARYING[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.notes,
        p.status::TEXT,
        p.template_type::TEXT,
        p.created_at,
        p.deadline,
        COALESCE(
            ARRAY_AGG(DISTINCT u.email) FILTER (WHERE u.email IS NOT NULL),
            ARRAY[]::CHARACTER VARYING[]
        ) as team_emails
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN auth.users u ON pm.user_id = u.id
    WHERE EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = p.id 
        AND user_id = user_id_param
    )
    GROUP BY p.id, p.name, p.notes, p.status, p.template_type, p.created_at, p.deadline
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_projects_for_user(UUID) TO authenticated;
