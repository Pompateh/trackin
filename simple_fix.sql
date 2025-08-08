-- Simple fix for the main database issues
-- Run this in your Supabase SQL Editor to fix the core errors

-- 1. Fix the get_projects_for_user function
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
        ARRAY_AGG(DISTINCT u.email) FILTER (WHERE u.email IS NOT NULL) as team_emails
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

-- 2. Add missing columns to brief_data table
ALTER TABLE brief_data 
ADD COLUMN IF NOT EXISTS text_horizontal_align TEXT DEFAULT 'left',
ADD COLUMN IF NOT EXISTS text_vertical_align TEXT DEFAULT 'top',
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS image_position_x INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_position_y INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_scale REAL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'grid',
ADD COLUMN IF NOT EXISTS text_grid_col INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS text_grid_col_span INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS text_grid_row INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS text_grid_row_span INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS image_grid_col INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS image_grid_col_span INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS image_grid_row INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS image_grid_row_span INTEGER DEFAULT 1;

-- 3. Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'on_going',
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'branding',
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

-- 4. Update existing projects to have default values
UPDATE projects 
SET status = 'on_going' 
WHERE status IS NULL;

UPDATE projects 
SET template_type = 'branding' 
WHERE template_type IS NULL;
