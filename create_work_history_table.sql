-- Create work history table for tracking user actions
CREATE TABLE IF NOT EXISTS work_history (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    action_description TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_work_history_project_id ON work_history(project_id);
CREATE INDEX IF NOT EXISTS idx_work_history_user_id ON work_history(user_id);
CREATE INDEX IF NOT EXISTS idx_work_history_created_at ON work_history(created_at);

-- Enable RLS
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;

-- RLS policies - updated to work with project_members table structure
CREATE POLICY "Users can view work history for projects they have access to" ON work_history
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE id = work_history.project_id 
            AND (created_by = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM project_members 
                     WHERE project_members.project_id = work_history.project_id 
                     AND project_members.user_id = auth.uid()
                 )
                )
        )
    );

CREATE POLICY "Users can insert work history for projects they have access to" ON work_history
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE id = work_history.project_id 
            AND (created_by = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM project_members 
                     WHERE project_members.project_id = work_history.project_id 
                     AND project_members.user_id = auth.uid()
                 )
                )
        )
    );

-- Function to log work history
CREATE OR REPLACE FUNCTION log_work_history(
    p_project_id UUID,
    p_action_type VARCHAR(100),
    p_action_description TEXT,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id VARCHAR(100) DEFAULT NULL,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO work_history (
        project_id,
        user_id,
        action_type,
        action_description,
        entity_type,
        entity_id,
        old_value,
        new_value,
        metadata
    ) VALUES (
        p_project_id,
        auth.uid(),
        p_action_type,
        p_action_description,
        p_entity_type,
        p_entity_id,
        p_old_value,
        p_new_value,
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profiles for work history display
DROP FUNCTION IF EXISTS get_user_profiles(UUID[]);
CREATE OR REPLACE FUNCTION get_user_profiles(user_ids UUID[])
RETURNS TABLE (
    id UUID,
    email CHARACTER VARYING(255),
    user_metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.raw_user_meta_data as user_metadata
    FROM auth.users au
    WHERE au.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON work_history TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
