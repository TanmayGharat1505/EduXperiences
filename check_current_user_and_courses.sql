-- Check Current User and Course Visibility
-- This script helps identify which user you're logged in as

-- 1. Check current authenticated user
SELECT 
    'Current User Info' as check_type,
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 2. Check all courses with visibility status
SELECT 
    'Course Visibility Status' as check_type,
    id,
    title,
    institution_id,
    auth.uid() as current_user_id,
    (institution_id = auth.uid()) as is_visible_to_current_user,
    status,
    created_at
FROM institution_courses
ORDER BY created_at DESC;

-- 3. Check which courses should be visible to current user
SELECT 
    'Visible Courses' as check_type,
    id,
    title,
    institution_id,
    status,
    created_at
FROM institution_courses
WHERE institution_id = auth.uid()
ORDER BY created_at DESC;

-- 4. Check profiles table for institution users
SELECT 
    'Institution Users' as check_type,
    user_id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE role = 'institution'
ORDER BY created_at DESC;

-- 5. Check if current user has institution profile
SELECT 
    'Current User Profile' as check_type,
    user_id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE user_id = auth.uid();
