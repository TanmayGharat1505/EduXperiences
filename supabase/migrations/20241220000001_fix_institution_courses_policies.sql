-- Fix Institution Courses RLS Policies
-- This ensures the RLS policies are correctly set up for institution_courses

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Institutions can view own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can insert own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can update own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can delete own courses" ON institution_courses;
DROP POLICY IF EXISTS "Students can view active institution courses" ON institution_courses;

-- Create the correct RLS policies
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
