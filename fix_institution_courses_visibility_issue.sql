-- Fix Institution Courses Visibility Issue
-- This script addresses the issue where only 1 course is visible on institution side

-- 1. First, let's check the current RLS policies
SELECT 
    'Current RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_courses';

-- 2. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Institutions can view own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can insert own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can update own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can delete own courses" ON institution_courses;
DROP POLICY IF EXISTS "Students can view active institution courses" ON institution_courses;

-- 3. Create more permissive RLS policies
-- Allow institutions to view their own courses
CREATE POLICY "Institutions can view own courses" ON institution_courses
    FOR SELECT USING (institution_id = auth.uid());

-- Allow institutions to insert their own courses
CREATE POLICY "Institutions can insert own courses" ON institution_courses
    FOR INSERT WITH CHECK (institution_id = auth.uid());

-- Allow institutions to update their own courses
CREATE POLICY "Institutions can update own courses" ON institution_courses
    FOR UPDATE USING (institution_id = auth.uid())
    WITH CHECK (institution_id = auth.uid());

-- Allow institutions to delete their own courses
CREATE POLICY "Institutions can delete own courses" ON institution_courses
    FOR DELETE USING (institution_id = auth.uid());

-- Allow students to view active courses (for enrollment)
CREATE POLICY "Students can view active institution courses" ON institution_courses
    FOR SELECT USING (status = 'Active');

-- 4. Add a temporary policy to allow viewing all courses (for debugging)
-- This will help identify if the issue is with RLS or data
CREATE POLICY "Temporary: Allow viewing all courses for debugging" ON institution_courses
    FOR SELECT USING (true);

-- 5. Ensure RLS is enabled
ALTER TABLE institution_courses ENABLE ROW LEVEL SECURITY;

-- 6. Check the results
SELECT 
    'Fixed RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'institution_courses';

-- 7. Show all courses with their institution_id
SELECT 
    'All Courses After Fix' as check_type,
    id,
    title,
    institution_id,
    status,
    created_at
FROM institution_courses 
ORDER BY created_at DESC;
