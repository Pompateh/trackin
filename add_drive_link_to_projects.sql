-- Add drive_link field to projects table
-- Run this in your Supabase SQL Editor

-- Add the drive_link column to the projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS drive_link TEXT;

-- Add a comment to describe the field
COMMENT ON COLUMN projects.drive_link IS 'Google Drive link for project files and resources';

-- Update existing projects to have a default value (optional)
-- UPDATE projects SET drive_link = '' WHERE drive_link IS NULL;
