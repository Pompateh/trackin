-- Simple POD RLS Fix
-- This script provides basic RLS policies that should work for most setups

-- =====================================================
-- OPTION 1: DISABLE RLS (Temporary fix for development)
-- =====================================================

-- Uncomment the following line to disable RLS temporarily
-- ALTER TABLE pod_data DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPTION 2: ALLOW ALL AUTHENTICATED USERS (Less secure)
-- =====================================================

-- Enable Row Level Security
ALTER TABLE pod_data ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all authenticated users" ON pod_data;
DROP POLICY IF EXISTS "Users can view POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can insert POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can update POD data for their projects" ON pod_data;
DROP POLICY IF EXISTS "Users can delete POD data for their projects" ON pod_data;

-- Create a simple policy that allows all authenticated users
CREATE POLICY "Allow all authenticated users" ON pod_data
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- OPTION 3: CHECK PROJECTS TABLE STRUCTURE FIRST
-- =====================================================

-- Run this first to see what columns exist in the projects table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'pod_data';

-- Check what policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'pod_data'
ORDER BY policyname;
