# DoodleJump Milanote Clone

This is a full-stack web application that functions as a Milanote-style collaborative project tracker. It's built with React, Supabase, Tailwind CSS, and `tldraw` for the canvas.

## Features

- **User Authentication**: Email/password login via Supabase Auth.
- **Projects**: Create and manage projects with details like descriptions, deadlines, and more.
- **Role-Based Access Control**: Admin, Member, and Viewer roles for projects.
- **Collaborative Canvas**: A freeform `tldraw` board for each project.
- **Task Management**: Assign and track tasks with different statuses.
- **Commenting**: Users can leave comments on projects.

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd doodlejump-milanote
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Navigate to the **Settings** > **API** section in your Supabase project dashboard.
3.  Find your Project URL and anon key.
4.  Create a `.env` file in the root of this project.
5.  Add your Supabase credentials to the `.env` file:

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

### 4. Set up the database schema

1.  Go to the **SQL Editor** in your Supabase project dashboard.
2.  Click on **New query**.
3.  Copy the content of `schema.sql` below and run it to create the necessary tables and policies.

### 5. Run the application

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

---

## `schema.sql`

Copy and paste the following SQL into the Supabase SQL Editor to set up your database.
This script is idempotent, meaning it can be run multiple times without causing errors.

```sql
-- Create a public users table to store non-sensitive user data
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
    name TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    q_and_a TEXT,
    debrief TEXT,
    direction TEXT,
    revision TEXT,
    delivery TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ROLES enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_role') THEN
        CREATE TYPE project_role AS ENUM ('admin', 'member', 'viewer');
    END IF;
END$$;

-- PROJECT_MEMBERS table
CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role project_role NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- BOARDS table
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
    board_data JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TASKS status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
    END IF;
END$$;


-- TASKS table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status task_status DEFAULT 'todo',
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- COMMENTS table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ DEFAULT now()
);

-- Function to add creator as admin to project_members
CREATE OR REPLACE FUNCTION public.add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (project_id, user_id) DO NOTHING; -- Prevents error if member already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a project is created
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.add_creator_as_admin();


-- Helper function to check project membership and break recursion
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check project admin status and break recursion
CREATE OR REPLACE FUNCTION public.is_project_admin(p_project_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id AND user_id = p_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;


--- POLICIES
--- They are safe to re-run, as they will be replaced.

-- Policies for USERS
DROP POLICY IF EXISTS "All users can view user profiles." ON public.users;
CREATE POLICY "All users can view user profiles." ON public.users FOR SELECT USING (true);

-- Policies for PROJECTS
DROP POLICY IF EXISTS "Users can see projects they are members of." ON projects;
CREATE POLICY "Users can see projects they are members of." ON projects FOR SELECT USING ( public.is_project_member(id, auth.uid()) );

DROP POLICY IF EXISTS "Creator-role users can insert projects." ON projects;
CREATE POLICY "Creator-role users can insert projects." ON projects FOR INSERT WITH CHECK (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'can_create_projects')::boolean = true
);

DROP POLICY IF EXISTS "Admins can update projects." ON projects;
CREATE POLICY "Admins can update projects." ON projects FOR UPDATE USING ( public.is_project_admin(id, auth.uid()) );

DROP POLICY IF EXISTS "Admins can delete projects." ON projects;
CREATE POLICY "Admins can delete projects." ON projects FOR DELETE USING ( public.is_project_admin(id, auth.uid()) );

-- Policies for PROJECT_MEMBERS (Corrected AGAIN to prevent recursion)
DROP POLICY IF EXISTS "Users can view members of projects they belong to." ON public.project_members;
CREATE POLICY "Users can view members of projects they belong to."
ON public.project_members FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

DROP POLICY IF EXISTS "Admins can manage project members." ON public.project_members;
CREATE POLICY "Admins can manage project members."
ON public.project_members FOR ALL
USING ( public.is_project_admin(project_id, auth.uid()) );


-- Policies for BOARDS
DROP POLICY IF EXISTS "Members can view boards of their projects." ON boards;
CREATE POLICY "Members can view boards of their projects." ON boards FOR SELECT USING ( public.is_project_member(project_id, auth.uid()) );

DROP POLICY IF EXISTS "Admins and members can update boards." ON boards;
CREATE POLICY "Admins and members can update boards." ON boards FOR UPDATE USING (
  (SELECT role FROM project_members WHERE project_id = boards.project_id AND user_id = auth.uid()) IN ('admin', 'member')
);

-- Policies for TASKS
DROP POLICY IF EXISTS "Members can view tasks of their projects." ON tasks;
CREATE POLICY "Members can view tasks of their projects." ON tasks FOR SELECT USING ( public.is_project_member(project_id, auth.uid()) );

DROP POLICY IF EXISTS "Admins can create tasks." ON tasks;
CREATE POLICY "Admins can create tasks." ON tasks FOR INSERT WITH CHECK ( public.is_project_admin(project_id, auth.uid()) );

DROP POLICY IF EXISTS "Admins and members can update tasks." ON tasks;
CREATE POLICY "Admins and members can update tasks." ON tasks FOR UPDATE USING (
  (SELECT role FROM project_members WHERE project_id = tasks.project_id AND user_id = auth.uid()) IN ('admin', 'member')
);

DROP POLICY IF EXISTS "Admins and members can delete tasks." ON tasks;
CREATE POLICY "Admins and members can delete tasks." ON tasks FOR DELETE USING (
  (SELECT role FROM project_members WHERE project_id = tasks.project_id AND user_id = auth.uid()) IN ('admin', 'member')
);


-- Policies for COMMENTS
DROP POLICY IF EXISTS "Members can view comments." ON comments;
CREATE POLICY "Members can view comments." ON comments FOR SELECT USING ( public.is_project_member(project_id, auth.uid()) );

DROP POLICY IF EXISTS "Members can create comments." ON comments;
CREATE POLICY "Members can create comments." ON comments FOR INSERT WITH CHECK ( public.is_project_member(project_id, auth.uid()) );

DROP POLICY IF EXISTS "Users can delete their own comments." ON comments;
CREATE POLICY "Users can delete their own comments." ON comments FOR DELETE USING (auth.uid() = user_id);

-- Function to get projects for a user
CREATE OR REPLACE FUNCTION get_projects_for_user(user_id_param uuid)
RETURNS TABLE(id uuid, name text, description text, deadline timestamptz, q_and_a text, debrief text, direction text, revision text, delivery text, created_by uuid, created_at timestamptz, role project_role) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.deadline, p.q_and_a, p.debrief, p.direction, p.revision, p.delivery, p.created_by, p.created_at, pm.role
  FROM public.projects p
  JOIN public.project_members pm ON p.id = pm.project_id
  WHERE pm.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

---
## Advanced: Granting Creator Privileges

By default, no users can create projects. To grant this permission, you must assign a special role via the user's metadata. Since this cannot always be done through the Supabase dashboard, the most reliable method is to use a secure Edge Function.

### 1. Set up the Supabase CLI

First, link your local project to your Supabase project.
*   Install the new `supabase` dependency: `npm install`
*   Log in to Supabase: `npm exec supabase login`
*   Navigate to your project's dashboard URL (e.g., `https://app.supabase.com/project/your-project-ref`) and find your project's reference ID.
*   Link the project: `npm exec supabase link --project-ref <your-project-ref>`

### 2. Deploy the Edge Function

We have already created the function for you in the `supabase/functions` directory.
*   Deploy the `grant-creator-role` function: `npm exec supabase functions deploy grant-creator-role`

### 3. How to Use the Function

1.  **Get the User ID:** Go to **Authentication -> Users** in your Supabase dashboard and copy the ID of the user you want to grant privileges to.

2.  **Invoke the Function:**
    *   Go to **Edge Functions** in your Supabase dashboard.
    *   Click on the `grant-creator-role` function.
    *   Go to the **Invoke** tab.
    *   In the **Payload** section, paste the following JSON, replacing the `userId` with the one you copied:
        ```json
        {
          "userId": "paste-the-user-id-here"
        }
        ```
    *   Click **Invoke function**.

The user will now have the ability to create projects. 