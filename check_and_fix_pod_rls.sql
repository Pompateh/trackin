-- Check and Fix POD RLS Policies
-- This script first checks the table structure and then creates appropriate RLS policies

-- =====================================================
-- 1. CHECK TABLE STRUCTURES
-- =====================================================

-- Check the projects table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Check the pod_data table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'pod_data' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. CREATE RLS POLICIES BASED ON ACTUAL STRUCTURE
-- =====================================================

-- Enable Row Level Security on the pod_data table
ALTER TABLE pod_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can insert POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can update POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can delete POD data for their projects" ON pod_data;

-- Policy 1: Allow users to view POD data for projects they have access to
-- Try different possible column names for user ownership
CREATE POLICY "Users can view POD data for their projects" ON pod_data
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE (
                -- Try common column names for user ownership
                (user_id = auth.uid()) OR
                (owner_id = auth.uid()) OR
                (created_by = auth.uid()) OR
                (user = auth.uid())
            )
        )
    );

-- Policy 2: Allow users to insert POD data for projects they own
CREATE POLICY "Users can insert POD data for their projects" ON pod_data
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE (
                -- Try common column names for user ownership
                (user_id = auth.uid()) OR
                (owner_id = auth.uid()) OR
                (created_by = auth.uid()) OR
                (user = auth.uid())
            )
        )
    );

-- Policy 3: Allow users to update POD data for projects they own
CREATE POLICY "Users can update POD data for their projects" ON pod_data
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE (
                -- Try common column names for user ownership
                (user_id = auth.uid()) OR
                (owner_id = auth.uid()) OR
                (created_by = auth.uid()) OR
                (user = auth.uid())
            )
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE (
                -- Try common column names for user ownership
                (user_id = auth.uid()) OR
                (owner_id = auth.uid()) OR
                (created_by = auth.uid()) OR
                (user = auth.uid())
            )
        )
    );

-- Policy 4: Allow users to delete POD data for projects they own
CREATE POLICY "Users can delete POD data for their projects" ON pod_data
    FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE (
                -- Try common column names for user ownership
                (user_id = auth.uid()) OR
                (owner_id = auth.uid()) OR
                (created_by = auth.uid()) OR
                (user = auth.uid())
            )
        )
    );

-- =====================================================
-- 3. ALTERNATIVE: SIMPLE POLICIES (if above fails)
-- =====================================================

-- If the above policies fail, you can temporarily disable RLS or use simpler policies
-- Uncomment the following lines if needed:

/*
-- Option A: Disable RLS temporarily (for development)
-- ALTER TABLE pod_data DISABLE ROW LEVEL SECURITY;

-- Option B: Allow all authenticated users (less secure, for testing)
-- CREATE POLICY "Allow all authenticated users" ON pod_data
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);
*/

-- =====================================================
-- 4. VERIFICATION
-- =====================================================

-- Verify the RLS policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pod_data'
ORDER BY policyname;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'pod_data';
