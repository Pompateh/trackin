-- Fix the create_new_project function to save deadline and status
-- Run this in your Supabase SQL Editor

-- Drop and recreate the create_new_project function
DROP FUNCTION IF EXISTS create_new_project(TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]);

CREATE OR REPLACE FUNCTION create_new_project(
    name TEXT,
    description TEXT,
    deadline TIMESTAMPTZ,
    q_and_a TEXT,
    debrief TEXT,
    direction TEXT,
    revision TEXT,
    delivery TEXT,
    status TEXT,
    template_type TEXT DEFAULT 'branding',
    team_member_emails TEXT[] DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
    new_project_id UUID;
    team_member_email TEXT;
BEGIN
    -- Create the project with deadline and status (cast status to enum)
    INSERT INTO projects (name, notes, template_type, deadline, status)
    VALUES (name, description, template_type, deadline, status::project_status)
    RETURNING id INTO new_project_id;

    -- Add the creator as a project member
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (new_project_id, auth.uid(), 'admin');

    -- Add team members
    FOREACH team_member_email IN ARRAY team_member_emails
    LOOP
        INSERT INTO project_members (project_id, user_id, role)
        SELECT new_project_id, id, 'member'
        FROM auth.users
        WHERE email = team_member_email;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_new_project(TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;
