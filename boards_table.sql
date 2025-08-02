-- Create boards table for TldrawCanvas functionality
-- Run this in your Supabase SQL Editor

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

-- Create RLS policies
-- Policy to allow users to view boards for projects they are members of
CREATE POLICY "Users can view boards for projects they are members of" ON boards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Policy to allow users to insert boards for projects they are members of
CREATE POLICY "Users can insert boards for projects they are members of" ON boards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Policy to allow users to update boards for projects they are members of
CREATE POLICY "Users can update boards for projects they are members of" ON boards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Policy to allow users to delete boards for projects they are members of
CREATE POLICY "Users can delete boards for projects they are members of" ON boards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = boards.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_boards_updated_at 
    BEFORE UPDATE ON boards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 