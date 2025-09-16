-- Fix Enrollment Counting Issue
-- This script addresses potential issues with enrollment counting

-- 1. Check current enrollment data
SELECT 
    'Current Enrollments' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    p.full_name as student_name,
    ic.title as course_title
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
ORDER BY ce.enrolled_at DESC
LIMIT 10;

-- 2. Check if there are any RLS issues preventing enrollment queries
SELECT 
    'RLS Policies Check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

-- 3. Test enrollment query that the frontend uses
-- This simulates the exact query used in the frontend
SELECT 
    'Frontend Query Test' as check_type,
    ce.id,
    ce.student_id,
    ce.status
FROM course_enrollments ce
WHERE ce.course_id = (
    SELECT id FROM institution_courses 
    WHERE LOWER(title) LIKE '%fundamentals%cloud%computing%' 
    LIMIT 1
)
AND ce.status = 'enrolled';

-- 4. Check if the course exists and get its ID
SELECT 
    'Course ID Check' as check_type,
    id as course_id,
    title,
    institution_id,
    status
FROM institution_courses 
WHERE LOWER(title) LIKE '%fundamentals%cloud%computing%'
   OR LOWER(title) LIKE '%cloud%computing%';

-- 5. Check all enrollments for institution courses
SELECT 
    'All Institution Course Enrollments' as check_type,
    ic.id as course_id,
    ic.title as course_title,
    COUNT(ce.id) as enrollment_count,
    p.full_name as institution_name
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
LEFT JOIN profiles p ON ic.institution_id = p.id
GROUP BY ic.id, ic.title, p.full_name
ORDER BY enrollment_count DESC;

-- 6. Check if there are any data type mismatches
SELECT 
    'Data Type Check' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' 
AND column_name IN ('course_id', 'student_id', 'status');

-- 7. Test a simple count query
SELECT 
    'Simple Count Test' as check_type,
    COUNT(*) as total_enrollments,
    COUNT(CASE WHEN status = 'enrolled' THEN 1 END) as enrolled_count
FROM course_enrollments;

-- 8. Check for any NULL or invalid course_ids
SELECT 
    'Invalid Course IDs' as check_type,
    course_id,
    COUNT(*) as count
FROM course_enrollments 
WHERE course_id IS NULL 
   OR course_id NOT IN (SELECT id FROM institution_courses)
GROUP BY course_id;

-- 9. Verify the specific enrollment exists
SELECT 
    'Specific Enrollment Check' as check_type,
    ce.*,
    p.full_name as student_name,
    ic.title as course_title
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE LOWER(p.full_name) LIKE '%tanmay%'
  AND LOWER(ic.title) LIKE '%cloud%computing%';
