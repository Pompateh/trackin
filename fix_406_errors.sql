-- Fix for 406 errors - Create missing tables and fix RLS policies
-- Run this in your Supabase SQL Editor

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the brief_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS brief_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title_text TEXT DEFAULT '',
    subtitle_text TEXT DEFAULT '',
    body_text TEXT DEFAULT '',
    is_title_visible BOOLEAN DEFAULT TRUE,
    is_subtitle_visible BOOLEAN DEFAULT TRUE,
    is_body_visible BOOLEAN DEFAULT TRUE,
    title_font_size INTEGER DEFAULT 24,
    subtitle_font_size INTEGER DEFAULT 16,
    body_font_size INTEGER DEFAULT 14,
    title_font_family TEXT DEFAULT 'gothic a1',
    subtitle_font_family TEXT DEFAULT 'gothic a1',
    body_font_family TEXT DEFAULT 'gothic a1',
    title_bold BOOLEAN DEFAULT FALSE,
    title_italic BOOLEAN DEFAULT FALSE,
    title_underline BOOLEAN DEFAULT FALSE,
    subtitle_bold BOOLEAN DEFAULT FALSE,
    subtitle_italic BOOLEAN DEFAULT FALSE,
    subtitle_underline BOOLEAN DEFAULT FALSE,
    body_bold BOOLEAN DEFAULT FALSE,
    body_italic BOOLEAN DEFAULT FALSE,
    body_underline BOOLEAN DEFAULT FALSE,
    text_vertical_align TEXT DEFAULT 'top',
    text_horizontal_align TEXT DEFAULT 'left',
    image_url TEXT DEFAULT '',
    image_position_x INTEGER DEFAULT 0,
    image_position_y INTEGER DEFAULT 0,
    image_scale REAL DEFAULT 1.0,
    layout_type TEXT DEFAULT 'grid',
    text_grid_col INTEGER DEFAULT 1,
    text_grid_col_span INTEGER DEFAULT 4,
    text_grid_row INTEGER DEFAULT 1,
    text_grid_row_span INTEGER DEFAULT 1,
    image_grid_col INTEGER DEFAULT 5,
    image_grid_col_span INTEGER DEFAULT 4,
    image_grid_row INTEGER DEFAULT 1,
    image_grid_row_span INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the boards table if it doesn't exist
CREATE TABLE IF NOT EXISTS boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    board_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_brief_data_project_id ON brief_data(project_id);
CREATE INDEX IF NOT EXISTS idx_boards_project_id ON boards(project_id);

-- Temporarily disable RLS to fix the 406 errors
ALTER TABLE brief_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_brief_data_updated_at ON brief_data;
CREATE TRIGGER update_brief_data_updated_at 
    BEFORE UPDATE ON brief_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
CREATE TRIGGER update_boards_updated_at 
    BEFORE UPDATE ON boards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default brief_data for existing projects if they don't have any
INSERT INTO brief_data (project_id, title_text, subtitle_text, body_text)
SELECT p.id, p.name, 'Project Subtitle', p.notes
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM brief_data bd WHERE bd.project_id = p.id
);

-- Insert default boards for existing projects if they don't have any
INSERT INTO boards (project_id, board_data)
SELECT p.id, '{}'::jsonb
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM boards b WHERE b.project_id = p.id
);

-- Re-enable RLS with more permissive policies
ALTER TABLE brief_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view brief_data for projects they are members of" ON brief_data;
DROP POLICY IF EXISTS "Users can insert brief_data for projects they are members of" ON brief_data;
DROP POLICY IF EXISTS "Users can update brief_data for projects they are members of" ON brief_data;
DROP POLICY IF EXISTS "Users can delete brief_data for projects they are members of" ON brief_data;

DROP POLICY IF EXISTS "Users can view boards for projects they are members of" ON boards;
DROP POLICY IF EXISTS "Users can insert boards for projects they are members of" ON boards;
DROP POLICY IF EXISTS "Users can update boards for projects they are members of" ON boards;
DROP POLICY IF EXISTS "Users can delete boards for projects they are members of" ON boards;

-- Create more permissive RLS policies that allow access to project owners and members
-- For brief_data
CREATE POLICY "Allow access to brief_data for project access" ON brief_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = brief_data.project_id 
            AND project_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = brief_data.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- For boards
CREATE POLICY "Allow access to boards for project access" ON boards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = boards.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Verify tables were created
SELECT 'brief_data table status:' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brief_data') 
            THEN 'EXISTS' ELSE 'MISSING' END as status;

SELECT 'boards table status:' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boards') 
            THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Show sample data
SELECT 'brief_data count:' as info, COUNT(*) as count FROM brief_data;
SELECT 'boards count:' as info, COUNT(*) as count FROM boards;
