-- Create Institution Courses Table (Simple Version)
-- This creates the courses table for institutions

-- 1. Create institution_courses table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS institution_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration TEXT NOT NULL,
    fee_structure JSONB NOT NULL DEFAULT '{"type": "fixed", "amount": 0, "currency": "INR"}',
    prerequisites TEXT[] DEFAULT '{}',
    syllabus_url TEXT,
    certificate_details JSONB DEFAULT '{"provided": false, "name": "", "description": ""}',
    images JSONB DEFAULT '[]',
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    status TEXT CHECK (status IN ('Active', 'Inactive', 'Draft')) DEFAULT 'Draft',
    instructor TEXT,
    students_enrolled INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_courses_institution_id ON institution_courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_courses_category ON institution_courses(category);
CREATE INDEX IF NOT EXISTS idx_institution_courses_status ON institution_courses(status);

-- 3. Enable Row Level Security
ALTER TABLE institution_courses ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Institutions can view own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can insert own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can update own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can delete own courses" ON institution_courses;
DROP POLICY IF EXISTS "Students can view active institution courses" ON institution_courses;

-- Institutions can view, insert, update, and delete their own courses
CREATE POLICY "Institutions can view own courses" ON institution_courses
    FOR SELECT USING (auth.uid() = institution_id);

CREATE POLICY "Institutions can insert own courses" ON institution_courses
    FOR INSERT WITH CHECK (auth.uid() = institution_id);

CREATE POLICY "Institutions can update own courses" ON institution_courses
    FOR UPDATE USING (auth.uid() = institution_id);

CREATE POLICY "Institutions can delete own courses" ON institution_courses
    FOR DELETE USING (auth.uid() = institution_id);

-- Students can view active courses (for browsing)
CREATE POLICY "Students can view active institution courses" ON institution_courses
    FOR SELECT USING (status = 'Active');

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_institution_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_update_institution_courses_updated_at ON institution_courses;
CREATE TRIGGER trigger_update_institution_courses_updated_at
    BEFORE UPDATE ON institution_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_institution_courses_updated_at();
