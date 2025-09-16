-- Debug Student ID Not Found Issue
-- This script helps diagnose why student profiles are not found

-- 1. Check if the specific student ID exists in profiles
SELECT 
    'Student ID Check' as check_type,
    id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Check if there are any enrollments for this student
SELECT 
    'Student Enrollments Check' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.student_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Check if there are any profiles with similar IDs (partial match)
SELECT 
    'Similar ID Check' as check_type,
    id,
    full_name,
    role
FROM profiles 
WHERE id::text LIKE '%4136968b%' 
   OR id::text LIKE '%f971%'
   OR id::text LIKE '%82ed%';

-- 4. Check all student profiles to see what IDs exist
SELECT 
    'All Student Profiles' as check_type,
    id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if there are any enrollments without matching profiles
SELECT 
    'Orphaned Enrollments' as check_type,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    p.full_name,
    p.role
FROM course_enrollments ce
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ce.status = 'enrolled'
  AND p.id IS NULL
LIMIT 10;

-- 6. Check RLS policies that might be blocking access
SELECT 
    'RLS Policies Check' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. Test a simple query to see if we can access profiles at all
SELECT 
    'Basic Profiles Access Test' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count
FROM profiles;

-- 8. Check if the issue is with the specific institution's courses
SELECT 
    'Institution Course Enrollments' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    COUNT(ce.id) as enrollment_count
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
GROUP BY ic.id, ic.title, ic.institution_id
ORDER BY enrollment_count DESC;

-- 9. Check if there are any data type mismatches
SELECT 
    'Data Type Check' as check_type,
    'enrollment.student_id' as field,
    pg_typeof(student_id) as data_type
FROM course_enrollments 
LIMIT 1;

SELECT 
    'Data Type Check' as check_type,
    'profiles.id' as field,
    pg_typeof(id) as data_type
FROM profiles 
LIMIT 1;
