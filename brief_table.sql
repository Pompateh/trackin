-- Create brief_data table for storing project brief information
CREATE TABLE IF NOT EXISTS brief_data (
  id SERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title_text TEXT DEFAULT '',
  subtitle_text TEXT DEFAULT '',
  body_text TEXT DEFAULT '',
  is_title_visible BOOLEAN DEFAULT true,
  is_subtitle_visible BOOLEAN DEFAULT true,
  is_body_visible BOOLEAN DEFAULT true,
  title_font_size INTEGER DEFAULT 24,
  subtitle_font_size INTEGER DEFAULT 16,
  body_font_size INTEGER DEFAULT 14,
  title_font_family TEXT DEFAULT 'gothic a1',
  subtitle_font_family TEXT DEFAULT 'gothic a1',
  body_font_family TEXT DEFAULT 'gothic a1',
  title_bold BOOLEAN DEFAULT false,
  title_italic BOOLEAN DEFAULT false,
  title_underline BOOLEAN DEFAULT false,
  subtitle_bold BOOLEAN DEFAULT false,
  subtitle_italic BOOLEAN DEFAULT false,
  subtitle_underline BOOLEAN DEFAULT false,
  body_bold BOOLEAN DEFAULT false,
  body_italic BOOLEAN DEFAULT false,
  body_underline BOOLEAN DEFAULT false,
  text_vertical_align TEXT DEFAULT 'top',
  text_horizontal_align TEXT DEFAULT 'left',
  image_url TEXT DEFAULT '',
  image_position_x INTEGER DEFAULT 0,
  image_position_y INTEGER DEFAULT 0,
  image_scale REAL DEFAULT 1.0,
  -- Grid layout support
  layout_type TEXT DEFAULT 'grid', -- 'grid' or 'flex'
  text_grid_col INTEGER DEFAULT 1, -- Starting column for text (1-8)
  text_grid_col_span INTEGER DEFAULT 4, -- Number of columns text spans
  text_grid_row INTEGER DEFAULT 1, -- Starting row for text
  text_grid_row_span INTEGER DEFAULT 1, -- Number of rows text spans
  image_grid_col INTEGER DEFAULT 5, -- Starting column for image (1-8)
  image_grid_col_span INTEGER DEFAULT 4, -- Number of columns image spans
  image_grid_row INTEGER DEFAULT 1, -- Starting row for image
  image_grid_row_span INTEGER DEFAULT 1, -- Number of rows image spans
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_brief_data_project_id ON brief_data(project_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE brief_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view brief data for accessible projects" ON brief_data;
DROP POLICY IF EXISTS "Users can modify brief data for accessible projects" ON brief_data;

-- Policy to allow users to view brief data for projects they have access to
CREATE POLICY "Users can view brief data for accessible projects" ON brief_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = brief_data.project_id 
      AND user_id = auth.uid()
    )
  );

-- Policy to allow users to insert/update brief data for projects they have access to
CREATE POLICY "Users can modify brief data for accessible projects" ON brief_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = brief_data.project_id 
      AND user_id = auth.uid()
    )
  ); 