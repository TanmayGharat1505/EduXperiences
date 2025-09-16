-- Investigate Profile Mixing Root Cause
-- This script will identify why student and institution profiles are getting mixed up

-- 1. Check all users and their account creation timeline
SELECT 
    'User Creation Timeline' as info,
    u.id,
    u.email,
    u.created_at as user_created,
    u.raw_user_meta_data->>'role' as auth_role,
    u.raw_user_meta_data->>'full_name' as auth_name,
    p.role as profile_role,
    p.full_name as profile_name,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at;

-- 2. Check for any duplicate user IDs across different profile types
SELECT 
    'Duplicate User IDs Analysis' as info,
    user_id,
    COUNT(*) as profile_count,
    array_agg(DISTINCT profile_type) as profile_types,
    array_agg(DISTINCT role) as roles
FROM (
    SELECT user_id, 'profiles' as profile_type, role FROM profiles
    UNION ALL
    SELECT user_id, 'institution_profiles' as profile_type, 'institution' as role FROM institution_profiles
    UNION ALL
    SELECT user_id, 'student_profiles' as profile_type, 'student' as role FROM student_profiles
) all_profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 3. Check for role mismatches between auth.users and profiles
SELECT 
    'Role Mismatch Analysis' as info,
    u.id,
    u.email,
    u.raw_user_meta_data->>'role' as auth_role,
    p.role as profile_role,
    CASE 
        WHEN u.raw_user_meta_data->>'role' != p.role::text THEN 'MISMATCH'
        ELSE 'MATCH'
    END as status
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.raw_user_meta_data->>'role' IS NOT NULL;

-- 4. Check recent profile creations to see the pattern
SELECT 
    'Recent Profile Creations' as info,
    p.id,
    p.user_id,
    p.full_name,
    p.role,
    p.created_at,
    u.email,
    u.raw_user_meta_data->>'role' as auth_role
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Check if there are any profiles without corresponding auth.users
SELECT 
    'Orphaned Profiles' as info,
    p.id,
    p.user_id,
    p.full_name,
    p.role,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- 6. Check for any auth.users without profiles
SELECT 
    'Users Without Profiles' as info,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as auth_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 7. Check the specific user IDs that are getting mixed up
SELECT 
    'Student Account' as account_type,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as auth_role,
    p.role as profile_role,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'

UNION ALL

SELECT 
    'Institution Account' as account_type,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as auth_role,
    p.role as profile_role,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 8. Check for any data created by the wrong user
SELECT 
    'Batches' as data_type,
    COUNT(*) as count,
    '4136968b-f971-4b9c-82ed-bbc0c4d82171' as user_id
FROM institution_batches 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'

UNION ALL

SELECT 
    'Courses' as data_type,
    COUNT(*) as count,
    '4136968b-f971-4b9c-82ed-bbc0c4d82171' as user_id
FROM courses 
WHERE tutor_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';
