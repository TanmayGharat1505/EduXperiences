-- Fix Course Enrollment RLS Policies
-- This migration ensures students can enroll in both tutor courses and institution courses

-- 1. Check current RLS policies on course_enrollments
SELECT 
    'Current RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

-- 2. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Students can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Tutors can view course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Institutions can view course enrollments" ON course_enrollments;

-- 3. Create comprehensive RLS policies for course_enrollments

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own enrollments
-- This policy allows enrollment in both courses and institution_courses
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

-- Institutions can view enrollments for their courses
CREATE POLICY "Institutions can view course enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM institution_courses 
            WHERE institution_courses.id = course_enrollments.course_id 
            AND institution_courses.institution_id = auth.uid()
        )
    );

-- 4. Ensure RLS is enabled
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON course_enrollments TO authenticated;

-- 6. Verify the policies are created
SELECT 
    'Updated RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

-- 7. Test enrollment capability by checking if a student can insert
-- (This will only work if there's an authenticated user)
SELECT 
    'Enrollment Test' as check_type,
    'Students can insert enrollments' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'course_enrollments' 
            AND policyname = 'Students can insert own enrollments'
            AND cmd = 'INSERT'
        ) THEN 'PASS' 
        ELSE 'FAIL' 
    END as result;
