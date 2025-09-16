-- Find Real Registration Data
-- This script searches for your actual registration data from the 7-page form

-- 1. Check if there's any institution data with your email in any table
SELECT 
    'Institution Profiles by Email' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    address,
    city,
    state,
    pin_code,
    created_at
FROM institution_profiles 
WHERE official_email = 'maseerah2003@gmail.com'
ORDER BY created_at DESC;

-- 2. Check if there's data in the institutions table
SELECT 
    'Institutions Table by Email' as check_type,
    id,
    name,
    official_email,
    complete_address,
    city,
    state,
    pincode,
    created_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com'
ORDER BY created_at DESC;

-- 3. Check all institution profiles to see if there's data with different user_id
SELECT 
    'All Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    address,
    city,
    state,
    pin_code,
    created_at
FROM institution_profiles 
WHERE official_email = 'maseerah2003@gmail.com'
   OR institution_name ILIKE '%bright future%'
   OR institution_name ILIKE '%bright%'
   OR institution_name ILIKE '%future%'
   OR institution_name ILIKE '%technology%'
ORDER BY created_at DESC;

-- 4. Check if there's data with different email variations
SELECT 
    'Institution Profiles by Name Pattern' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    address,
    city,
    state,
    pin_code,
    created_at
FROM institution_profiles 
WHERE institution_name ILIKE '%bright%'
   OR institution_name ILIKE '%future%'
   OR institution_name ILIKE '%technology%'
   OR institution_name ILIKE '%anil%'
   OR institution_name ILIKE '%kumar%'
ORDER BY created_at DESC;

-- 5. Check all institution profiles to see what's available
SELECT 
    'All Institution Profiles (Recent)' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    address,
    city,
    state,
    pin_code,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check if there's data in any other tables that might contain registration info
SELECT 
    'Profiles Table Check' as check_type,
    p.id,
    p.full_name,
    p.role,
    p.user_id,
    u.email
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'institution'
ORDER BY p.created_at DESC;

-- 7. Check if there are any courses created by this user that might give us clues
SELECT 
    'Institution Courses Check' as check_type,
    ic.id,
    ic.title,
    ic.institution_id,
    ic.created_at
FROM institution_courses ic
WHERE ic.institution_id IN (
    SELECT id FROM institution_profiles 
    WHERE official_email = 'maseerah2003@gmail.com'
       OR user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
);
