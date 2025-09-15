-- Diagnose institution_profiles table issues
-- This will help us understand why the stats service is failing

-- 1. Check if institution_profiles table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 2. Check total count of institution_profiles (without filters)
SELECT COUNT(*) as total_institution_profiles FROM institution_profiles;

-- 3. Check if verified column exists and its values
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'institution_profiles' 
            AND column_name = 'verified'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as verified_column_status;

-- 4. If verified column exists, check its values
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institution_profiles' 
        AND column_name = 'verified'
    ) THEN
        RAISE NOTICE 'Verified column exists, checking values...';
    ELSE
        RAISE NOTICE 'Verified column does not exist!';
    END IF;
END $$;

-- 5. Check verified column values (only if it exists)
SELECT 
    verified,
    COUNT(*) as count
FROM institution_profiles 
GROUP BY verified
ORDER BY verified;

-- 6. Check all institution_profiles data (first 5 records)
SELECT 
    id,
    institution_name,
    verified,
    created_at
FROM institution_profiles 
LIMIT 5;

-- 7. Check RLS policies on institution_profiles
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- 8. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'institution_profiles';

-- 9. Check for any institution profiles in profiles table (in case they're stored there)
SELECT 
    role,
    COUNT(*) as count
FROM profiles 
WHERE role = 'institution'
GROUP BY role;

-- 10. Check if there are any institution users at all
SELECT 
    'auth.users' as source,
    COUNT(*) as count
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE p.role = 'institution';
