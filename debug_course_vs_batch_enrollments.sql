-- Debug Course vs Batch Enrollments
-- This script compares why batch enrollments work but course enrollments don't

-- 1. Check all institution courses and their enrollments
SELECT 
    'Institution Courses with Enrollments' as check_type,
    ic.id as course_id,
    ic.title as course_title,
    ic.institution_id,
    ic.status as course_status,
    COUNT(ce.id) as enrollment_count,
    COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END) as enrolled_count
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id
GROUP BY ic.id, ic.title, ic.institution_id, ic.status
ORDER BY enrollment_count DESC;

-- 2. Check all institution batches and their course enrollments
SELECT 
    'Institution Batches with Course Enrollments' as check_type,
    ib.id as batch_id,
    ib.batch_name,
    ib.course_id,
    ic.title as course_title,
    ic.status as course_status,
    COUNT(ce.id) as enrollment_count,
    COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END) as enrolled_count
FROM institution_batches ib
LEFT JOIN institution_courses ic ON ib.course_id = ic.id
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id
GROUP BY ib.id, ib.batch_name, ib.course_id, ic.title, ic.status
ORDER BY enrollment_count DESC;

-- 3. Check if there are any differences in the course_id values
SELECT 
    'Course ID Comparison' as check_type,
    'Courses table' as source,
    course_id,
    COUNT(*) as count
FROM course_enrollments 
WHERE course_id IN (SELECT id FROM institution_courses)
GROUP BY course_id
UNION ALL
SELECT 
    'Course ID Comparison' as check_type,
    'Batches table' as source,
    ib.course_id,
    COUNT(*) as count
FROM institution_batches ib
JOIN course_enrollments ce ON ib.course_id = ce.course_id
GROUP BY ib.course_id
ORDER BY course_id, source;

-- 4. Check for any data type mismatches
SELECT 
    'Data Type Check' as check_type,
    'institution_courses.id' as field,
    pg_typeof(id) as data_type
FROM institution_courses 
LIMIT 1;

SELECT 
    'Data Type Check' as check_type,
    'course_enrollments.course_id' as field,
    pg_typeof(course_id) as data_type
FROM course_enrollments 
LIMIT 1;

-- 5. Check if there are any RLS issues specific to courses vs batches
SELECT 
    'RLS Policies - institution_courses' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'institution_courses'
ORDER BY policyname;

SELECT 
    'RLS Policies - institution_batches' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'institution_batches'
ORDER BY policyname;

-- 6. Test the exact queries used by the frontend
-- Course enrollment query (from loadCourses)
SELECT 
    'Frontend Course Query Test' as check_type,
    ce.id,
    ce.student_id,
    ce.status
FROM course_enrollments ce
WHERE ce.course_id IN (
    SELECT id FROM institution_courses 
    WHERE institution_id = (
        SELECT id FROM profiles 
        WHERE role = 'institution' 
        LIMIT 1
    )
)
AND ce.status = 'enrolled'
LIMIT 5;

-- Batch enrollment query (from loadBatches)
SELECT 
    'Frontend Batch Query Test' as check_type,
    ce.id,
    ce.student_id,
    ce.status
FROM course_enrollments ce
WHERE ce.course_id IN (
    SELECT ib.course_id 
    FROM institution_batches ib
    JOIN institution_courses ic ON ib.course_id = ic.id
    WHERE ic.institution_id = (
        SELECT id FROM profiles 
        WHERE role = 'institution' 
        LIMIT 1
    )
)
AND ce.status = 'enrolled'
LIMIT 5;

-- 7. Check if there are any timing issues or recent changes
SELECT 
    'Recent Enrollment Activity' as check_type,
    ce.id,
    ce.course_id,
    ce.student_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.enrolled_at >= NOW() - INTERVAL '1 hour'
ORDER BY ce.enrolled_at DESC;
