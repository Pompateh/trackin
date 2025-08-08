-- Create POD (Proof of Design) data table
-- Run this in your Supabase SQL Editor

-- Create the pod_data table
CREATE TABLE IF NOT EXISTS pod_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scale_list JSONB DEFAULT '[]',
    reference_image_url TEXT,
    reference_comment TEXT,
    design_image_url TEXT,
    design_comment TEXT,
    final_images JSONB DEFAULT '[]', -- Array of final design images
    final_comments JSONB DEFAULT '[]', -- Array of comments for final designs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pod_data_project_id ON pod_data(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE pod_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy to allow users to view POD data for projects they are members of
CREATE POLICY "Users can view POD data for projects they are members of" ON pod_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = pod_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Policy to allow users to insert POD data for projects they are members of
CREATE POLICY "Users can insert POD data for projects they are members of" ON pod_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = pod_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Policy to allow users to update POD data for projects they are members of
CREATE POLICY "Users can update POD data for projects they are members of" ON pod_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = pod_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Policy to allow users to delete POD data for projects they are members of
CREATE POLICY "Users can delete POD data for projects they are members of" ON pod_data
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = pod_data.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_pod_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_pod_data_updated_at 
    BEFORE UPDATE ON pod_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_pod_data_updated_at(); 