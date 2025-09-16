-- Find and Fix Institution Data
-- This script finds your institution data and fixes any user ID mismatches

-- 1. Check all institution profiles to find yours
SELECT 
    'All Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 2. Check if there's a profile with maseerah2003@gmail.com email
SELECT 
    'Profile by Email' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id,
    ip.official_email,
    u.email as user_email
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE ip.official_email = 'maseerah2003@gmail.com';

-- 3. Check all auth.users to see what user IDs exist
SELECT 
    'All Auth Users' as check_type,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 4. Check if there's a profile with "Dr. Anil Kumar" name
SELECT 
    'Profile by Name' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id,
    ip.official_email,
    u.email as user_email
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE ip.institution_name ILIKE '%anil%' 
   OR ip.institution_name ILIKE '%kumar%'
   OR ip.institution_name ILIKE '%dr%';

-- 5. Check profiles table for institution role
SELECT 
    'Institution Profiles' as check_type,
    p.id,
    p.full_name,
    p.role,
    p.user_id,
    u.email as user_email
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'institution'
ORDER BY p.created_at DESC;

-- 6. Find the correct user ID for maseerah2003@gmail.com
SELECT 
    'Correct User ID' as check_type,
    id as correct_user_id,
    email
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 7. Check if there are any institution profiles with null or wrong user_id
SELECT 
    'Institution Profiles with Issues' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    CASE 
        WHEN user_id IS NULL THEN 'NULL user_id'
        WHEN user_id NOT IN (SELECT id FROM auth.users) THEN 'Invalid user_id'
        ELSE 'Valid user_id'
    END as status
FROM institution_profiles 
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users)
   OR official_email = 'maseerah2003@gmail.com';
