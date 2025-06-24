# Project Grid & Notes Manager

This is a full-stack web application that serves as a powerful and flexible project management tool. It combines a dynamic grid-based content editor with an integrated sidebar for notes, tasks, and comments. It's built with React, Supabase, and Tailwind CSS.

## Key Features

- **Project-Based Workflow**: All content and activities are organized within distinct projects.
- **Dynamic Grid Editor**:
    - Each project section (e.g., "Brief," "Concept") has its own 6x6 grid.
    - **Cell Merging**: Select multiple cells and merge them into a single, larger block.
    - **Unmerging**: Revert merged cells back to their original state.
    - **Content Templates**: Apply pre-defined templates to cells, such as "Text Only," "Image Only," or "Text and Image."
    - **In-place Editing**: Directly edit text content (title, subtitle, body) and upload images within a grid cell.
    - **Fine-grained Control**: Toggle visibility and adjust the font size for each text element.
- **Integrated Project Sidebar**:
    - **Notes**: A dedicated, persistent notepad for each project.
    - **Task List**: A simple to-do list to track project tasks.
    - **Comment Stream**: A real-time comment feed for project discussions.
    - **Recap/Activity Log**: A feed to log important project events.
- **User Authentication**: Secure user login and management handled by Supabase Auth.
- **Real-time Backend**: All data is powered by Supabase, providing a responsive and live experience.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd doodlejump
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Navigate to the **Settings** > **API** section in your Supabase project dashboard.
3.  Find your Project URL and anon key.
4.  Create a file named `.env` in the root of this project.
5.  Add your Supabase credentials to the `.env` file:

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

### 4. Set up the Database

1.  Go to the **SQL Editor** in your Supabase project dashboard.
2.  Click on **New query**.
3.  Copy the content of the `schema.sql` section below and run it to create the necessary tables and database functions.

### 5. Set up Supabase Storage

1. Go to the **Storage** section in your Supabase dashboard.
2. Create a new bucket named `project_images`.
3. **Crucially, ensure the bucket is marked as "Public".** The image upload feature will not work otherwise.

### 6. Run the application

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

---

## `schema.sql`

Copy and paste the following SQL into the Supabase SQL Editor to set up your database. This script is idempotent, meaning it can be run multiple times without causing errors.

```sql
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL PRIMARY KEY,
  email text
);

-- Function to add a new user to public.users when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING; -- Prevents error if user already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- PROJECTS table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    notes TEXT, -- Added for the sidebar notes panel
    created_at TIMESTAMPTZ DEFAULT now()
);

-- COMMENTS table
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- GRID_ITEMS table
CREATE TABLE IF NOT EXISTS grid_items (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    section_id_text TEXT NOT NULL,
    grid_item_id INT NOT NULL,
    
    -- Grid properties
    "row" INT NOT NULL,
    "col" INT NOT NULL,
    "rowSpan" INT NOT NULL DEFAULT 1,
    "colSpan" INT NOT NULL DEFAULT 1,
    hidden BOOLEAN NOT NULL DEFAULT FALSE,

    -- Content properties
    template_type TEXT,
    image_url TEXT,

    -- Structured text content
    title_text TEXT,
    subtitle_text TEXT,
    body_text TEXT,

    -- Text visibility
    is_title_visible BOOLEAN DEFAULT TRUE,
    is_subtitle_visible BOOLEAN DEFAULT TRUE,
    is_body_visible BOOLEAN DEFAULT TRUE,

    -- Text font sizes
    title_font_size TEXT DEFAULT '24px',
    subtitle_font_size TEXT DEFAULT '18px',
    body_font_size TEXT DEFAULT '14px',
    
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    PRIMARY KEY(project_id, section_id_text, grid_item_id)
);


-- ========== DATABASE FUNCTIONS ==========

-- Function to MERGE grid items
CREATE OR REPLACE FUNCTION merge_grid_items(
    p_project_id UUID,
    p_section_id_text TEXT,
    p_main_item_id INT,
    p_row_span INT,
    p_col_span INT,
    p_item_ids_to_hide INT[]
)
RETURNS void AS $$
BEGIN
    -- Update the main item to span across the selected area
    UPDATE grid_items
    SET "rowSpan" = p_row_span, "colSpan" = p_col_span
    WHERE project_id = p_project_id
      AND section_id_text = p_section_id_text
      AND grid_item_id = p_main_item_id;

    -- Hide the other items that are now covered by the main item
    UPDATE grid_items
    SET hidden = TRUE
    WHERE project_id = p_project_id
      AND section_id_text = p_section_id_text
      AND grid_item_id = ANY(p_item_ids_to_hide);
END;
$$ LANGUAGE plpgsql;


-- Function to UNMERGE grid items
CREATE OR REPLACE FUNCTION unmerge_grid_items(
    p_project_id uuid,
    p_section_id_text text,
    p_item_id_to_unmerge int
)
RETURNS void AS $$
DECLARE
    unmerge_item record;
BEGIN
    -- Get the state of the item we want to unmerge
    SELECT "row", "col", "rowSpan", "colSpan"
    INTO unmerge_item
    FROM grid_items
    WHERE project_id = p_project_id
      AND section_id_text = p_section_id_text
      AND grid_item_id = p_item_id_to_unmerge;

    -- Un-hide all items that were covered by this merge
    UPDATE grid_items
    SET hidden = FALSE
    WHERE project_id = p_project_id
      AND section_id_text = p_section_id_text
      AND "row" >= unmerge_item."row"
      AND "row" < unmerge_item."row" + unmerge_item."rowSpan"
      AND "col" >= unmerge_item."col"
      AND "col" < unmerge_item."col" + unmerge_item."colSpan";
      
    -- Reset the main item itself back to its default state
    UPDATE grid_items
    SET "rowSpan" = 1, "colSpan" = 1, body_text = ''
    WHERE project_id = p_project_id
      AND section_id_text = p_section_id_text
      AND grid_item_id = p_item_id_to_unmerge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========== ROW LEVEL SECURITY (RLS) ==========

-- Enable RLS for all relevant tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to see all other users (for comment display)
DROP POLICY IF EXISTS "Allow read access to all users" ON public.users;
CREATE POLICY "Allow read access to all users" ON public.users
FOR SELECT USING (true);

-- Allow users to see and manage their own projects
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects" ON public.projects
FOR ALL USING (auth.uid() = (SELECT user_id FROM project_members WHERE project_id = id AND user_id = auth.uid()))
WITH CHECK (auth.uid() = (SELECT user_id FROM project_members WHERE project_id = id AND user_id = auth.uid()));

-- Allow project members to view/edit grid items in their projects
DROP POLICY IF EXISTS "Project members can manage grid items" ON public.grid_items;
CREATE POLICY "Project members can manage grid items" ON public.grid_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = grid_items.project_id 
        AND project_members.user_id = auth.uid()
    )
);

-- Allow project members to view/create comments in their projects
DROP POLICY IF EXISTS "Project members can read and create comments" ON public.comments;
CREATE POLICY "Project members can read and create comments" ON public.comments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = comments.project_id 
        AND project_members.user_id = auth.uid()
    )
);

``` 