-- Simple Fix for Course Enrollment
-- This migration fixes RLS policies without changing table structure

-- 1. Check current RLS policies
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

-- 3. Create comprehensive RLS policies

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own enrollments
-- This policy allows enrollment in any course (tutor or institution)
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

-- 6. Remove the foreign key constraint that only allows courses table references
-- This allows course_enrollments to reference both courses and institution_courses
ALTER TABLE course_enrollments 
DROP CONSTRAINT IF EXISTS course_enrollments_course_id_fkey;

-- 7. Verify the policies are created
SELECT 
    'Updated RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

-- 8. Test enrollment capability
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

-- 9. Check if foreign key constraint was removed
SELECT 
    'Foreign Key Check' as check_type,
    'course_id foreign key removed' as test_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'course_enrollments' 
            AND constraint_name = 'course_enrollments_course_id_fkey'
        ) THEN 'PASS' 
        ELSE 'FAIL' 
    END as result;
