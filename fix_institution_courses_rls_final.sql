-- Fix Institution Courses RLS Policy
-- This will ensure institutions can see their own courses and add debugging capability

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Institutions can view own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can insert own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can update own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can delete own courses" ON institution_courses;
DROP POLICY IF EXISTS "Students can view active institution courses" ON institution_courses;
DROP POLICY IF EXISTS "Temporary: Allow viewing all courses for debugging" ON institution_courses;

-- 2. Create proper RLS policies
-- Institutions can view their own courses
CREATE POLICY "Institutions can view own courses" ON institution_courses
    FOR SELECT USING (institution_id = auth.uid());

-- Institutions can insert their own courses
CREATE POLICY "Institutions can insert own courses" ON institution_courses
    FOR INSERT WITH CHECK (institution_id = auth.uid());

-- Institutions can update their own courses
CREATE POLICY "Institutions can update own courses" ON institution_courses
    FOR UPDATE USING (institution_id = auth.uid())
    WITH CHECK (institution_id = auth.uid());

-- Institutions can delete their own courses
CREATE POLICY "Institutions can delete own courses" ON institution_courses
    FOR DELETE USING (institution_id = auth.uid());

-- Students can view active courses (for enrollment)
CREATE POLICY "Students can view active institution courses" ON institution_courses
    FOR SELECT USING (status = 'Active');

-- 3. Add a temporary debugging policy (remove this after testing)
-- This allows institutions to see all courses for debugging
CREATE POLICY "Debug: Allow institutions to view all courses" ON institution_courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'institution'
        )
    );

-- 4. Ensure RLS is enabled
ALTER TABLE institution_courses ENABLE ROW LEVEL SECURITY;

-- 5. Show current policies
SELECT 
    'Current RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'institution_courses'
ORDER BY policyname;

-- 6. Show courses with their institution_id and current user
SELECT 
    'Course Visibility Check' as check_type,
    id,
    title,
    institution_id,
    auth.uid() as current_user_id,
    (institution_id = auth.uid()) as should_be_visible
FROM institution_courses
ORDER BY created_at DESC;
