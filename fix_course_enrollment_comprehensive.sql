-- Comprehensive Fix for Course Enrollment
-- This migration addresses both RLS policies and table structure issues

-- 1. First, let's check the current foreign key constraints
SELECT 
    'Foreign Key Constraints' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'course_enrollments';

-- 2. Check if we need to modify the course_enrollments table structure
-- The current structure only references courses(id), but we need to support institution_courses too

-- Option 1: Create a unified courses view that includes both tables
-- This is the cleanest approach - create a view that unions both course types
CREATE OR REPLACE VIEW unified_courses AS
SELECT 
    id,
    title,
    description,
    'tutor' as course_type,
    tutor_id as instructor_id,
    created_at,
    updated_at
FROM courses
WHERE is_active = true

UNION ALL

SELECT 
    id,
    title,
    description,
    'institution' as course_type,
    institution_id as instructor_id,
    created_at,
    updated_at
FROM institution_courses
WHERE status = 'Active';

-- 3. Update the course_enrollments table to remove the foreign key constraint
-- and add a course_type column to distinguish between tutor and institution courses
ALTER TABLE course_enrollments 
DROP CONSTRAINT IF EXISTS course_enrollments_course_id_fkey;

-- Add course_type column to track whether it's a tutor or institution course
ALTER TABLE course_enrollments 
ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'tutor' 
CHECK (course_type IN ('tutor', 'institution'));

-- 4. Create a function to validate course enrollment
CREATE OR REPLACE FUNCTION validate_course_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the course exists in either courses or institution_courses table
    IF NEW.course_type = 'tutor' THEN
        IF NOT EXISTS (SELECT 1 FROM courses WHERE id = NEW.course_id) THEN
            RAISE EXCEPTION 'Course with id % does not exist in courses table', NEW.course_id;
        END IF;
    ELSIF NEW.course_type = 'institution' THEN
        IF NOT EXISTS (SELECT 1 FROM institution_courses WHERE id = NEW.course_id) THEN
            RAISE EXCEPTION 'Course with id % does not exist in institution_courses table', NEW.course_id;
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid course_type: %', NEW.course_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to validate course enrollment
DROP TRIGGER IF EXISTS validate_course_enrollment_trigger ON course_enrollments;
CREATE TRIGGER validate_course_enrollment_trigger
    BEFORE INSERT OR UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION validate_course_enrollment();

-- 6. Update RLS policies to work with the new structure
DROP POLICY IF EXISTS "Students can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Tutors can view course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Institutions can view course enrollments" ON course_enrollments;

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
        course_type = 'tutor' AND
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_enrollments.course_id 
            AND courses.tutor_id = auth.uid()
        )
    );

-- Institutions can view enrollments for their courses
CREATE POLICY "Institutions can view course enrollments" ON course_enrollments
    FOR SELECT USING (
        course_type = 'institution' AND
        EXISTS (
            SELECT 1 FROM institution_courses 
            WHERE institution_courses.id = course_enrollments.course_id 
            AND institution_courses.institution_id = auth.uid()
        )
    );

-- 7. Ensure RLS is enabled
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON course_enrollments TO authenticated;

-- 9. Verify the setup
SELECT 
    'Setup Verification' as check_type,
    'Unified courses view created' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'unified_courses') 
         THEN 'PASS' ELSE 'FAIL' END as result

UNION ALL

SELECT 
    'Setup Verification' as check_type,
    'Course type column added' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'course_enrollments' AND column_name = 'course_type') 
         THEN 'PASS' ELSE 'FAIL' END as result

UNION ALL

SELECT 
    'Setup Verification' as check_type,
    'Validation trigger created' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers 
                      WHERE trigger_name = 'validate_course_enrollment_trigger') 
         THEN 'PASS' ELSE 'FAIL' END as result;

-- 10. Show current RLS policies
SELECT 
    'Final RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;
