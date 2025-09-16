-- Create Course Enrollments Table Migration
-- This migration creates the course_enrollments table for tracking student enrollments

-- 1. Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'cancelled', 'dropped')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a student can only enroll in a course once
    UNIQUE(course_id, student_id)
);

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at);

-- 3. Enable Row Level Security
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Students can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Tutors can view course enrollments" ON course_enrollments;

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own enrollments
CREATE POLICY "Students can insert own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own enrollments
CREATE POLICY "Students can update own enrollments" ON course_enrollments
    FOR UPDATE USING (auth.uid() = student_id);

-- Tutors can view enrollments for their courses
CREATE POLICY "Tutors can view course enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_enrollments.course_id 
            AND courses.tutor_id = auth.uid()
        )
    );

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update updated_at
-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;

CREATE TRIGGER update_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_enrollments_updated_at();

-- 7. Verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' 
ORDER BY ordinal_position;
