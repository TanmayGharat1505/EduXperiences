-- Debug Institution Courses Visibility Issue
-- This script will help identify why only 1 course is visible on institution side

-- 1. Check all institution courses and their institution_id
SELECT 
    id,
    title,
    category,
    institution_id,
    status,
    created_at
FROM institution_courses 
ORDER BY created_at DESC;

-- 2. Check current authenticated user
SELECT 
    'Current User' as check_type,
    auth.uid() as user_id;

-- 3. Check if there are any RLS policy issues
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_courses';

-- 4. Check if institution_id matches current user
SELECT 
    'Course Visibility Check' as check_type,
    id,
    title,
    institution_id,
    auth.uid() as current_user_id,
    (institution_id = auth.uid()) as should_be_visible
FROM institution_courses;

-- 5. Check profiles table for institution users
SELECT 
    'Institution Profiles' as check_type,
    user_id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE role = 'institution'
ORDER BY created_at DESC;

-- 6. Check if there are any courses with different institution_id patterns
SELECT 
    'Institution ID Patterns' as check_type,
    institution_id,
    COUNT(*) as course_count,
    array_agg(title) as course_titles
FROM institution_courses 
GROUP BY institution_id;
