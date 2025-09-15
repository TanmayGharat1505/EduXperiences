-- Fix Courses Table Migration
-- This migration fixes the foreign key constraint issue by recreating the table properly

-- 1. Drop the existing courses table if it exists (to clean up any failed migration)
DROP TABLE IF EXISTS courses CASCADE;

-- 2. Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
    duration_hours INTEGER DEFAULT 1,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'INR',
    max_students INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_tutor_id ON courses(tutor_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);

-- 4. Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Tutors can view, insert, update, and delete their own courses
CREATE POLICY "Tutors can view own courses" ON courses
    FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can insert own courses" ON courses
    FOR INSERT WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update own courses" ON courses
    FOR UPDATE USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete own courses" ON courses
    FOR DELETE USING (auth.uid() = tutor_id);

-- Students can view active courses (for browsing)
CREATE POLICY "Students can view active courses" ON courses
    FOR SELECT USING (is_active = true);

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update updated_at
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_courses_updated_at();

-- 8. Verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;
