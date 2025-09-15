-- Fix Student Profile 406 Error
-- This script addresses potential RLS and query issues causing 406 errors

-- 1. Check current RLS policies on profiles table
SELECT 
    'Current RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Check if there are any institution courses with enrollments
SELECT 
    'Institution Course Enrollments' as check_type,
    ic.id as course_id,
    ic.title as course_title,
    ic.institution_id,
    COUNT(ce.id) as enrollment_count
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
GROUP BY ic.id, ic.title, ic.institution_id
ORDER BY enrollment_count DESC;

-- 3. Check specific enrollments and their student profiles
WITH institution_enrollments AS (
    SELECT 
        ce.id as enrollment_id,
        ce.student_id,
        ce.course_id,
        ce.status,
        ce.enrolled_at,
        ic.title as course_title,
        ic.institution_id
    FROM course_enrollments ce
    JOIN institution_courses ic ON ce.course_id = ic.id
    WHERE ce.status = 'enrolled'
    LIMIT 5
)
SELECT 
    'Enrollment with Profile Check' as check_type,
    ie.enrollment_id,
    ie.student_id,
    ie.course_title,
    p.full_name,
    p.email,
    p.role
FROM institution_enrollments ie
LEFT JOIN profiles p ON ie.student_id = p.id;

-- 4. Test the exact query structure used by the frontend
SELECT 
    'Frontend Query Test' as check_type,
    p.id,
    p.full_name,
    p.email,
    p.role,
    p.avatar_url,
    p.created_at,
    p.updated_at
FROM profiles p
WHERE p.id IN (
    SELECT DISTINCT ce.student_id
    FROM course_enrollments ce
    JOIN institution_courses ic ON ce.course_id = ic.id
    WHERE ce.status = 'enrolled'
    LIMIT 3
);

-- 5. Check for any missing RLS policies that might cause 406 errors
-- Create a policy to allow institutions to view student profiles for their enrolled students
DROP POLICY IF EXISTS "Institutions can view enrolled student profiles" ON profiles;

CREATE POLICY "Institutions can view enrolled student profiles" ON profiles
    FOR SELECT USING (
        id IN (
            SELECT ce.student_id
            FROM course_enrollments ce
            JOIN institution_courses ic ON ce.course_id = ic.id
            WHERE ic.institution_id = auth.uid()
            AND ce.status = 'enrolled'
        )
    );

-- 6. Alternative approach: Allow institutions to view all student profiles
-- (Use this if the above doesn't work)
-- DROP POLICY IF EXISTS "Institutions can view student profiles" ON profiles;
-- CREATE POLICY "Institutions can view student profiles" ON profiles
--     FOR SELECT USING (role = 'student');

-- 7. Check if the issue is with the query structure
-- Test a simpler query
SELECT 
    'Simple Query Test' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_profiles
FROM profiles;

-- 8. Verify the policy was created
SELECT 
    'Updated RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
AND policyname = 'Institutions can view enrolled student profiles';

-- 9. Test the policy with a sample query
-- This simulates what the frontend does
WITH test_institution AS (
    SELECT id as institution_id
    FROM profiles 
    WHERE role = 'institution'
    LIMIT 1
),
test_courses AS (
    SELECT id as course_id
    FROM institution_courses ic
    JOIN test_institution ti ON ic.institution_id = ti.institution_id
    LIMIT 1
),
test_enrollments AS (
    SELECT DISTINCT student_id
    FROM course_enrollments ce
    JOIN test_courses tc ON ce.course_id = tc.course_id
    WHERE ce.status = 'enrolled'
    LIMIT 1
)
SELECT 
    'Policy Test' as check_type,
    p.id,
    p.full_name,
    p.email,
    p.role
FROM profiles p
JOIN test_enrollments te ON p.id = te.student_id;
