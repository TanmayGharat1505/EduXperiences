-- Simple Debug for Student ID Not Found
-- This script checks the basic issue without complex queries

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
    ce.enrolled_at
FROM course_enrollments ce
WHERE ce.student_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Check all student profiles to see what IDs exist
SELECT 
    'All Student Profiles' as check_type,
    id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check if there are any enrollments without matching profiles
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
LIMIT 5;

-- 5. Check basic profiles access
SELECT 
    'Basic Profiles Access Test' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count
FROM profiles;

-- 6. Check RLS policies
SELECT 
    'RLS Policies Check' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
