-- Find Bright Future Institute of Technology
-- This script searches for your institution data across all tables

-- 1. Search in institutions table by name
SELECT 
    'Institutions by Name' as check_type,
    id,
    name,
    official_email,
    type,
    status,
    created_at
FROM institutions 
WHERE name ILIKE '%bright future%' 
   OR name ILIKE '%bright%'
   OR name ILIKE '%future%'
   OR name ILIKE '%technology%'
ORDER BY created_at DESC;

-- 2. Search in institutions table by email
SELECT 
    'Institutions by Email' as check_type,
    id,
    name,
    official_email,
    type,
    status,
    created_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com'
ORDER BY created_at DESC;

-- 3. Search in profiles table
SELECT 
    'Profiles by Name' as check_type,
    id,
    full_name,
    role,
    user_id,
    created_at
FROM profiles 
WHERE full_name ILIKE '%bright future%' 
   OR full_name ILIKE '%bright%'
   OR full_name ILIKE '%future%'
   OR full_name ILIKE '%technology%'
ORDER BY created_at DESC;

-- 4. Search in institution_profiles table
SELECT 
    'Institution Profiles by Name' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
WHERE institution_name ILIKE '%bright future%' 
   OR institution_name ILIKE '%bright%'
   OR institution_name ILIKE '%future%'
   OR institution_name ILIKE '%technology%'
ORDER BY created_at DESC;

-- 5. Check all institutions to see what's there
SELECT 
    'All Institutions' as check_type,
    id,
    name,
    official_email,
    type,
    status,
    created_at
FROM institutions 
ORDER BY created_at DESC;

-- 6. Check all profiles with institution role
SELECT 
    'All Institution Profiles' as check_type,
    id,
    full_name,
    role,
    user_id,
    created_at
FROM profiles 
WHERE role = 'institution'
ORDER BY created_at DESC;

-- 7. Check auth.users for the email
SELECT 
    'Auth User' as check_type,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 8. Check if there's a mismatch between tables
SELECT 
    'Data Mismatch Check' as check_type,
    u.email as user_email,
    p.full_name as profile_name,
    p.role as profile_role,
    ip.institution_name as institution_profile_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN institution_profiles ip ON u.id = ip.user_id
WHERE u.email = 'maseerah2003@gmail.com';
