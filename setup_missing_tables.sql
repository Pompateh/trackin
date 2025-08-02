-- Setup missing tables for the application
-- Run this in your Supabase SQL Editor

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the boards table
CREATE TABLE IF NOT EXISTS boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    board_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_boards_project_id ON boards(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for boards
CREATE POLICY "Users can view boards for projects they are members of" ON boards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert boards for projects they are members of" ON boards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update boards for projects they are members of" ON boards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete boards for projects they are members of" ON boards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Create trigger for boards
CREATE TRIGGER update_boards_updated_at 
    BEFORE UPDATE ON boards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create the brief_data table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_brief_data_project_id ON brief_data(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE brief_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brief_data
CREATE POLICY "Users can view brief_data for projects they are members of" ON brief_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = brief_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert brief_data for projects they are members of" ON brief_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = brief_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update brief_data for projects they are members of" ON brief_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = brief_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete brief_data for projects they are members of" ON brief_data
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = brief_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Create trigger for brief_data
CREATE TRIGGER update_brief_data_updated_at 
    BEFORE UPDATE ON brief_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 'boards table created successfully' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boards');
SELECT 'brief_data table created successfully' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brief_data'); 