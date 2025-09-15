-- Debug Institution Profile Lookup
-- This script helps debug why the institution profile is not being found

-- 1. Check the user ID for maseerah2003@gmail.com
SELECT 
    'User ID Lookup' as check_type,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 2. Check all institution profiles
SELECT 
    'All Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 3. Check if there's a profile for this user
SELECT 
    'User Profile Check' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id,
    ip.official_email,
    u.email as user_email
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com';

-- 4. Check profiles table for this user
SELECT 
    'Profiles Table Check' as check_type,
    p.id,
    p.full_name,
    p.role,
    p.user_id,
    u.email as user_email
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com';

-- 5. Check if there are any institution courses for this user
SELECT 
    'Institution Courses Check' as check_type,
    ic.id,
    ic.title,
    ic.institution_id,
    ic.created_at
FROM institution_courses ic
JOIN institution_profiles ip ON ic.institution_id = ip.id
JOIN auth.users u ON ip.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com';

-- 6. Check RLS policies on institution_profiles
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- 7. Test direct query to institution_profiles
SELECT 
    'Direct Query Test' as check_type,
    id,
    institution_name,
    user_id,
    official_email
FROM institution_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maseerah2003@gmail.com');
