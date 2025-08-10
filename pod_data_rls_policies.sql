-- Row Level Security (RLS) Policies for pod_data table
-- This script enables RLS and creates policies for secure data access

-- Enable Row Level Security on the pod_data table
ALTER TABLE pod_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to view POD data for projects they have access to
CREATE POLICY "Users can view POD data for their projects" ON pod_data
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 2: Allow users to insert POD data for projects they own
CREATE POLICY "Users can insert POD data for their projects" ON pod_data
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 3: Allow users to update POD data for projects they own
CREATE POLICY "Users can update POD data for their projects" ON pod_data
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 4: Allow users to delete POD data for projects they own
CREATE POLICY "Users can delete POD data for their projects" ON pod_data
    FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

-- Verify the policies were created
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
