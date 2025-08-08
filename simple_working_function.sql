-- Simple working function without type casting issues
-- Run this in your Supabase SQL Editor

-- Drop the problematic function
DROP FUNCTION IF EXISTS get_projects_for_user(UUID);

-- Create a simple function that works
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
        p.status::TEXT,
        p.template_type::TEXT,
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
