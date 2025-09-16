-- Check Institution Profiles Table
-- This script checks the actual institution_profiles table to find the correct ID

-- 1. Check all institution profiles
SELECT 
    'Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 2. Check which institution profiles have corresponding user records
SELECT 
    'Institution Profiles with Users' as check_type,
    ip.id as institution_profile_id,
    ip.institution_name,
    ip.user_id,
    u.id as user_id_exists,
    CASE 
        WHEN u.id IS NOT NULL THEN 'HAS USER RECORD'
        ELSE 'NO USER RECORD'
    END as status
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
ORDER BY ip.created_at DESC;

-- 3. Check the profiles table for institution role users
SELECT 
    'Institution Role Profiles' as check_type,
    id,
    full_name,
    role,
    user_id,
    created_at
FROM profiles 
WHERE role = 'institution'
ORDER BY created_at DESC;

-- 4. Find the correct institution profile ID to use
SELECT 
    'RECOMMENDED INSTITUTION' as check_type,
    ip.id as institution_profile_id,
    ip.institution_name,
    ip.user_id,
    'Use this ID for institution_courses.institution_id' as note
FROM institution_profiles ip
WHERE ip.user_id IN (
    SELECT user_id FROM profiles WHERE role = 'institution'
)
ORDER BY ip.created_at DESC
LIMIT 1;
