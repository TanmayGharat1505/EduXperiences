-- Debug 406 Error for Student Profile Loading
-- This script helps diagnose the 406 error when loading student profiles

-- 1. Check if there are any enrollments for institution courses
SELECT 
    'Enrollment Check' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ic.institution_id IS NOT NULL
ORDER BY ce.enrolled_at DESC
LIMIT 10;

-- 2. Check RLS policies on profiles table
SELECT 
    'RLS Policies - Profiles' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Test a simple profile query (like the frontend does)
SELECT 
    'Profile Query Test' as check_type,
    id,
    full_name,
    email,
    role
FROM profiles 
WHERE role = 'student'
LIMIT 5;

-- 4. Check if there are any students in the system
SELECT 
    'Student Count' as check_type,
    COUNT(*) as total_students,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count
FROM profiles;

-- 5. Check specific student IDs from enrollments
WITH enrollment_students AS (
    SELECT DISTINCT ce.student_id
    FROM course_enrollments ce
    LEFT JOIN institution_courses ic ON ce.course_id = ic.id
    WHERE ic.institution_id IS NOT NULL
    LIMIT 5
)
SELECT 
    'Enrollment Students Check' as check_type,
    es.student_id,
    p.full_name,
    p.email,
    p.role
FROM enrollment_students es
LEFT JOIN profiles p ON es.student_id = p.id;

-- 6. Check if the issue is with the specific query structure
SELECT 
    'Query Structure Test' as check_type,
    'Testing single profile query' as description,
    id,
    full_name,
    email
FROM profiles 
WHERE id = (
    SELECT student_id 
    FROM course_enrollments 
    LIMIT 1
)
LIMIT 1;

-- 7. Check for any data type mismatches
SELECT 
    'Data Type Check' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('id', 'full_name', 'email', 'role');
