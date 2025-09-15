-- Check where institution data is actually stored
-- This will help us understand the correct table structure

-- 1. Check if institution_profiles table exists at all
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'institution_profiles'
        ) THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as institution_profiles_table_status;

-- 2. Check institution data in profiles table
SELECT 
    role,
    COUNT(*) as count,
    MIN(created_at) as earliest_created,
    MAX(created_at) as latest_created
FROM profiles 
WHERE role = 'institution'
GROUP BY role;

-- 3. Check if profiles table has verified column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'verified';

-- 4. Check all columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Sample institution profile data from profiles table
SELECT 
    id,
    user_id,
    role,
    full_name,
    email,
    created_at
FROM profiles 
WHERE role = 'institution'
LIMIT 3;

-- 6. Check if there's a separate institution_profiles table with different name
SELECT table_name
FROM information_schema.tables 
WHERE table_name LIKE '%institution%'
ORDER BY table_name;
