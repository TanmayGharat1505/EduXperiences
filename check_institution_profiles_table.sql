-- Check Institution Profiles Table
-- This script checks if your institution data is in the institution_profiles table

-- 1. Check all institution profiles
SELECT 
    'All Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 2. Search for Bright Future Institute
SELECT 
    'Bright Future Search' as check_type,
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

-- 3. Check if there's a profile linked to maseerah2003@gmail.com user
SELECT 
    'User Profile Check' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id,
    u.email,
    p.full_name,
    p.role
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
LEFT JOIN profiles p ON ip.user_id = p.user_id
WHERE u.email = 'maseerah2003@gmail.com'
ORDER BY ip.created_at DESC;

-- 4. Check all profiles for the user
SELECT 
    'All User Profiles' as check_type,
    p.id,
    p.full_name,
    p.role,
    p.user_id,
    u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com'
ORDER BY p.created_at DESC;

-- 5. Check if there are any institution courses for this user
SELECT 
    'Institution Courses' as check_type,
    ic.id,
    ic.title,
    ic.institution_id,
    ic.created_at
FROM institution_courses ic
JOIN institution_profiles ip ON ic.institution_id = ip.id
JOIN auth.users u ON ip.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com'
ORDER BY ic.created_at DESC;

-- 6. Check table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
ORDER BY ordinal_position;
