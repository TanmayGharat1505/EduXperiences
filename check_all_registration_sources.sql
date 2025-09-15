-- Check All Registration Sources
-- This script checks every possible source for your registration data

-- 1. Check if there's any data in the institutions table
SELECT 
    'Institutions Table' as source,
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
   OR name ILIKE '%bright future%'
   OR name ILIKE '%bright%'
   OR name ILIKE '%future%'
   OR name ILIKE '%technology%'
ORDER BY created_at DESC;

-- 2. Check institution_profiles table
SELECT 
    'Institution Profiles Table' as source,
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

-- 3. Check if there's data with different user_id but same email
SELECT 
    'Cross-Reference Check' as source,
    ip.id,
    ip.institution_name,
    ip.user_id,
    ip.official_email,
    ip.address,
    ip.city,
    ip.state,
    ip.pin_code,
    u.email as user_email,
    ip.created_at
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE ip.official_email = 'maseerah2003@gmail.com'
ORDER BY ip.created_at DESC;

-- 4. Check all tables that might contain registration data
SELECT 
    'Table Existence Check' as source,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%institution%' 
       OR table_name LIKE '%registration%'
       OR table_name LIKE '%profile%')
ORDER BY table_name;

-- 5. Check if there are any JSONB fields that might contain registration data
SELECT 
    'JSONB Fields Check' as source,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'institution_profiles'
  AND data_type = 'jsonb';

-- 6. Check if there's data in any JSONB fields
SELECT 
    'JSONB Data Check' as source,
    id,
    institution_name,
    course_categories,
    course_details,
    class_timings,
    created_at
FROM institution_profiles 
WHERE course_categories IS NOT NULL 
   OR course_details IS NOT NULL
   OR class_timings IS NOT NULL
ORDER BY created_at DESC;
