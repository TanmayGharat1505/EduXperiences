-- Check Institution Data Sources
-- This script checks where institution data might be stored

-- 1. Check profiles table for institution users
SELECT 
    'Institution Profiles' as check_type,
    id,
    full_name,
    role,
    user_id,
    created_at
FROM profiles 
WHERE role = 'institution'
ORDER BY created_at DESC;

-- 2. Check institution_profiles table
SELECT 
    'Institution Profiles Table' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 3. Check auth.users for institution emails
SELECT 
    'Auth Users' as check_type,
    id,
    email,
    created_at
FROM auth.users 
WHERE email LIKE '%maseerah%' 
   OR email LIKE '%institution%'
ORDER BY created_at DESC;

-- 4. Check if there are any institution courses
SELECT 
    'Institution Courses' as check_type,
    id,
    title,
    institution_id,
    created_at
FROM institution_courses 
ORDER BY created_at DESC;

-- 5. Check institution batches
SELECT 
    'Institution Batches' as check_type,
    id,
    batch_name,
    course_id,
    created_at
FROM institution_batches 
ORDER BY created_at DESC;

-- 6. Check for any institution-related data in other tables
SELECT 
    'Other Institution Data' as check_type,
    'institution_courses' as table_name,
    COUNT(*) as count
FROM institution_courses

UNION ALL

SELECT 
    'Other Institution Data' as check_type,
    'institution_batches' as table_name,
    COUNT(*) as count
FROM institution_batches

UNION ALL

SELECT 
    'Other Institution Data' as check_type,
    'institution_profiles' as table_name,
    COUNT(*) as count
FROM institution_profiles;

-- 7. Check if there's a mismatch between user email and institution email
SELECT 
    'Email Mismatch Check' as check_type,
    u.email as user_email,
    p.full_name as profile_name,
    p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'maseerah2003@gmail.com';
