-- Fix User ID Confusion Issue
-- This script addresses the data integrity issue where student and institution have the same ID

-- 1. First, let's see what we're dealing with
SELECT 
    'Current State Analysis' as check_type,
    'Student Profile' as profile_type,
    id,
    full_name,
    role::text as role,
    user_id
FROM profiles 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'

UNION ALL

SELECT 
    'Current State Analysis' as check_type,
    'Institution Profile' as profile_type,
    id,
    institution_name as full_name,
    'institution' as role,
    user_id
FROM institution_profiles 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Check if there are any other institution profiles
SELECT 
    'Available Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 3. Check if there are any other student profiles
SELECT 
    'Available Student Profiles' as check_type,
    id,
    full_name,
    role::text as role,
    user_id,
    created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC;

-- 4. The issue is likely that:
--    - Tanmay P Gharat is a STUDENT (correct)
--    - But the courses were created with his ID as institution_id (WRONG)
--    - We need to find the actual institution that should own these courses

-- 5. Let's check who actually created the courses in the database
SELECT 
    'Course Creation Analysis' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    ic.created_at,
    CASE 
        WHEN ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171' THEN 'WRONG - Student ID used as institution_id'
        ELSE 'CORRECT - Real institution ID'
    END as status
FROM institution_courses ic
ORDER BY ic.created_at DESC;

-- 6. Check if there are any real institution profiles we can use
SELECT 
    'Real Institution Check' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id,
    ip.created_at,
    p.full_name as user_name,
    p.role::text as user_role
FROM institution_profiles ip
LEFT JOIN profiles p ON ip.user_id = p.user_id
ORDER BY ip.created_at DESC;

-- 7. If no real institution exists, we need to either:
--    a) Create a proper institution profile for the actual institution user
--    b) Or fix the existing data to point to the correct institution

-- 8. Let's check what the actual institution should be
-- First, let's see if there are any users with role 'institution'
SELECT 
    'Institution Role Users' as check_type,
    id,
    full_name,
    role::text as role,
    user_id,
    created_at
FROM profiles 
WHERE role = 'institution'
ORDER BY created_at DESC;

-- 9. If we find a real institution user, we can update the courses
-- For now, let's just identify the problem and suggest a solution

SELECT 
    'SOLUTION NEEDED' as check_type,
    'The courses are incorrectly assigned to student ID instead of institution ID' as issue,
    'Need to either create proper institution profile or reassign courses' as solution;
