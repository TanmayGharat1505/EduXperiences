-- Find All User Accounts
-- This script helps identify if you have multiple accounts

-- 1. Find all users with similar email patterns
SELECT 
    'Users with similar email' as info,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email LIKE '%isml%' 
   OR email LIKE '%tanmay%'
   OR email LIKE '%gharat%'
   OR raw_user_meta_data->>'full_name' ILIKE '%tanmay%'
ORDER BY created_at DESC;

-- 2. Find all institution profiles
SELECT 
    'All Institution Profiles' as info,
    id,
    user_id,
    institution_name,
    official_email,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 3. Find all profiles with institution role
SELECT 
    'All Institution Role Profiles' as info,
    id,
    user_id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE role = 'institution'
ORDER BY created_at DESC;

-- 4. Check if any user has both student and institution profiles
SELECT 
    'Users with Multiple Roles' as info,
    p.user_id,
    p.full_name,
    p.role as profile_role,
    ip.institution_name,
    ip.official_email
FROM profiles p
LEFT JOIN institution_profiles ip ON p.user_id = ip.user_id
WHERE p.user_id IN (
    SELECT user_id 
    FROM profiles 
    WHERE role = 'institution'
)
ORDER BY p.user_id;
