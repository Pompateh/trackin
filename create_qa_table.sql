-- Create Q&A data table
CREATE TABLE IF NOT EXISTS qa_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    question_1 TEXT DEFAULT '',
    answer_1 TEXT DEFAULT '',
    question_2 TEXT DEFAULT '',
    answer_2 TEXT DEFAULT '',
    question_3 TEXT DEFAULT '',
    answer_3 TEXT DEFAULT '',
    question_4 TEXT DEFAULT '',
    answer_4 TEXT DEFAULT '',
    question_5 TEXT DEFAULT '',
    answer_5 TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for qa_data
ALTER TABLE qa_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view qa_data for projects they are members of" ON qa_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = qa_data.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert qa_data for projects they are members of" ON qa_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = qa_data.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update qa_data for projects they are members of" ON qa_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = qa_data.project_id 
            AND user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON qa_data TO authenticated;
