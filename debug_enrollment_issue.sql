-- Debug Enrollment Count Issue
-- This script helps diagnose why enrollment counts aren't showing

-- 1. Check if the student "tanmay" exists and their enrollments
SELECT 
    'Student Check' as check_type,
    p.id as user_id,
    p.full_name,
    p.email,
    p.role
FROM profiles p 
WHERE LOWER(p.full_name) LIKE '%tanmay%' 
   OR LOWER(p.email) LIKE '%tanmay%';

-- 2. Check all course enrollments for this student
SELECT 
    'Student Enrollments' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    p.full_name as student_name
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
WHERE LOWER(p.full_name) LIKE '%tanmay%' 
   OR LOWER(p.email) LIKE '%tanmay%';

-- 3. Check the "Fundamentals of Cloud Computing" course
SELECT 
    'Course Check' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    ic.status,
    p.full_name as institution_name
FROM institution_courses ic
JOIN profiles p ON ic.institution_id = p.id
WHERE LOWER(ic.title) LIKE '%fundamentals%cloud%computing%'
   OR LOWER(ic.title) LIKE '%cloud%computing%';

-- 4. Check if there are any enrollments for this specific course
SELECT 
    'Course Enrollments' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    p.full_name as student_name,
    ic.title as course_title
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE LOWER(ic.title) LIKE '%fundamentals%cloud%computing%'
   OR LOWER(ic.title) LIKE '%cloud%computing%';

-- 5. Check all institution courses and their enrollment counts
SELECT 
    'All Institution Courses' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    ic.status,
    COUNT(ce.id) as enrollment_count,
    p.full_name as institution_name
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
LEFT JOIN profiles p ON ic.institution_id = p.id
GROUP BY ic.id, ic.title, ic.institution_id, ic.status, p.full_name
ORDER BY ic.created_at DESC;

-- 6. Check batch enrollment counts
SELECT 
    'Batch Enrollments' as check_type,
    ib.id as batch_id,
    ib.batch_name,
    ib.course_id,
    ib.max_capacity,
    COUNT(ce.id) as current_enrollment,
    ic.title as course_title
FROM institution_batches ib
LEFT JOIN institution_courses ic ON ib.course_id = ic.id
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
GROUP BY ib.id, ib.batch_name, ib.course_id, ib.max_capacity, ic.title
ORDER BY ib.created_at DESC;

-- 7. Check if there are any RLS issues
SELECT 
    'RLS Check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('course_enrollments', 'institution_courses', 'institution_batches')
ORDER BY tablename, policyname;
