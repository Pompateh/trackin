-- Add font family columns to grid_items table
-- Run this in your Supabase SQL Editor

-- Add font family columns for each text element
ALTER TABLE grid_items 
ADD COLUMN IF NOT EXISTS title_font_family TEXT DEFAULT 'gothic a1',
ADD COLUMN IF NOT EXISTS subtitle_font_family TEXT DEFAULT 'gothic a1',
ADD COLUMN IF NOT EXISTS body_font_family TEXT DEFAULT 'gothic a1';

-- Add text style columns for each text element
ALTER TABLE grid_items 
ADD COLUMN IF NOT EXISTS title_bold BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS title_italic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS title_underline BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subtitle_bold BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subtitle_italic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subtitle_underline BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS body_bold BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS body_italic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS body_underline BOOLEAN DEFAULT FALSE;

-- Add image positioning and scaling columns
ALTER TABLE grid_items 
ADD COLUMN IF NOT EXISTS image_position_x REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_position_y REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_scale REAL DEFAULT 1;

-- Add image container dimension columns (for future use)
ALTER TABLE grid_items 
ADD COLUMN IF NOT EXISTS image_container_width REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_container_height REAL DEFAULT 0;

-- Update existing records to have default font values
UPDATE grid_items 
SET 
  title_font_family = 'gothic a1',
  subtitle_font_family = 'gothic a1',
  body_font_family = 'gothic a1'
WHERE title_font_family IS NULL 
   OR subtitle_font_family IS NULL 
   OR body_font_family IS NULL; 

-- Add project-level template_type field to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'branding';

-- Update existing projects to have 'branding' as default template type
UPDATE projects SET template_type = 'branding' WHERE template_type IS NULL;

-- Create or replace the create_new_project function
CREATE OR REPLACE FUNCTION create_new_project(
    name TEXT,
    description TEXT,
    deadline TIMESTAMPTZ,
    q_and_a TEXT,
    debrief TEXT,
    direction TEXT,
    revision TEXT,
    delivery TEXT,
    status TEXT,
    template_type TEXT DEFAULT 'branding',
    team_member_emails TEXT[] DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
    new_project_id UUID;
    team_member_email TEXT;
BEGIN
    -- Create the project
    INSERT INTO projects (name, notes, template_type)
    VALUES (name, description, template_type)
    RETURNING id INTO new_project_id;

    -- Add the creator as a project member
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (new_project_id, auth.uid(), 'admin');

    -- Add team members
    FOREACH team_member_email IN ARRAY team_member_emails
    LOOP
        INSERT INTO project_members (project_id, user_id, role)
        SELECT new_project_id, id, 'member'
        FROM auth.users
        WHERE email = team_member_email;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 

-- Database migration to add missing columns to brief_data table
-- Run this script to update the existing table structure

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_url') THEN
        ALTER TABLE brief_data ADD COLUMN image_url TEXT DEFAULT '';
    END IF;

    -- Add image_position_x column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_position_x') THEN
        ALTER TABLE brief_data ADD COLUMN image_position_x INTEGER DEFAULT 0;
    END IF;

    -- Add image_position_y column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_position_y') THEN
        ALTER TABLE brief_data ADD COLUMN image_position_y INTEGER DEFAULT 0;
    END IF;

    -- Add image_scale column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_scale') THEN
        ALTER TABLE brief_data ADD COLUMN image_scale REAL DEFAULT 1.0;
    END IF;

    -- Add layout_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'layout_type') THEN
        ALTER TABLE brief_data ADD COLUMN layout_type TEXT DEFAULT 'grid';
    END IF;

    -- Add text_grid_col column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'text_grid_col') THEN
        ALTER TABLE brief_data ADD COLUMN text_grid_col INTEGER DEFAULT 1;
    END IF;

    -- Add text_grid_col_span column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'text_grid_col_span') THEN
        ALTER TABLE brief_data ADD COLUMN text_grid_col_span INTEGER DEFAULT 4;
    END IF;

    -- Add text_grid_row column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'text_grid_row') THEN
        ALTER TABLE brief_data ADD COLUMN text_grid_row INTEGER DEFAULT 1;
    END IF;

    -- Add text_grid_row_span column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'text_grid_row_span') THEN
        ALTER TABLE brief_data ADD COLUMN text_grid_row_span INTEGER DEFAULT 1;
    END IF;

    -- Add image_grid_col column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_grid_col') THEN
        ALTER TABLE brief_data ADD COLUMN image_grid_col INTEGER DEFAULT 5;
    END IF;

    -- Add image_grid_col_span column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_grid_col_span') THEN
        ALTER TABLE brief_data ADD COLUMN image_grid_col_span INTEGER DEFAULT 4;
    END IF;

    -- Add image_grid_row column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_grid_row') THEN
        ALTER TABLE brief_data ADD COLUMN image_grid_row INTEGER DEFAULT 1;
    END IF;

    -- Add image_grid_row_span column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brief_data' AND column_name = 'image_grid_row_span') THEN
        ALTER TABLE brief_data ADD COLUMN image_grid_row_span INTEGER DEFAULT 1;
    END IF;

    RAISE NOTICE 'Migration completed successfully';
END $$; 