-- Investigate User ID Mixing Issue
-- This script will help identify why user IDs are getting mixed up

-- 1. Check all users and their roles
SELECT 
    'All Users and Roles' as info,
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    p.role as profile_role,
    p.full_name,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- 2. Check institution profiles and their user IDs
SELECT 
    'Institution Profiles' as info,
    ip.id as profile_id,
    ip.user_id,
    ip.institution_name,
    ip.official_email,
    ip.created_at,
    u.email as auth_email,
    u.created_at as auth_created
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
ORDER BY ip.created_at DESC;

-- 3. Check student profiles and their user IDs
SELECT 
    'Student Profiles' as info,
    sp.id as profile_id,
    sp.user_id,
    sp.created_at,
    u.email as auth_email,
    u.created_at as auth_created,
    p.full_name
FROM student_profiles sp
LEFT JOIN auth.users u ON sp.user_id = u.id
LEFT JOIN profiles p ON sp.user_id = p.user_id
ORDER BY sp.created_at DESC;

-- 4. Check recent batches and their institution IDs
SELECT 
    'Recent Batches' as info,
    ib.id as batch_id,
    ib.batch_name,
    ib.institution_id,
    ib.created_at,
    u.email as institution_email,
    p.full_name as institution_name
FROM institution_batches ib
LEFT JOIN auth.users u ON ib.institution_id = u.id
LEFT JOIN profiles p ON ib.institution_id = p.user_id
ORDER BY ib.created_at DESC
LIMIT 10;

-- 5. Check for duplicate user IDs across different profile types
SELECT 
    'Duplicate User IDs' as info,
    user_id,
    COUNT(*) as profile_count,
    array_agg(DISTINCT 'profiles') as profile_types
FROM (
    SELECT user_id, 'profiles' as profile_type FROM profiles
    UNION ALL
    SELECT user_id, 'institution_profiles' as profile_type FROM institution_profiles
    UNION ALL
    SELECT user_id, 'student_profiles' as profile_type FROM student_profiles
) all_profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 6. Check for user IDs that exist in profiles but not in auth.users
SELECT 
    'Orphaned Profiles' as info,
    p.user_id,
    p.full_name,
    p.role,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- 7. Check for auth.users that don't have profiles
SELECT 
    'Users Without Profiles' as info,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as auth_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;
