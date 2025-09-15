-- Debug Institution Profile Access Issues
-- This script will help diagnose why the institution profile query is failing

-- 1. Check if the institution profile exists
SELECT 
    'Institution Profile Exists Check' as test_name,
    COUNT(*) as profile_count
FROM institution_profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 1b. Get the actual profile data
SELECT 
    'Institution Profile Data' as test_name,
    id,
    user_id,
    institution_name,
    created_at
FROM institution_profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Check the exact user ID from auth.users
SELECT 
    'Auth User Check' as test_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Check if there's a profile in the profiles table
SELECT 
    'Profiles Table Check' as test_name,
    COUNT(*) as profile_count
FROM profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3b. Get the actual profile data
SELECT 
    'Profiles Table Data' as test_name,
    id,
    user_id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. Check RLS policies on institution_profiles table
SELECT 
    'RLS Policies Check' as test_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- 5. Test the exact query that's failing
SELECT 
    'Exact Query Test' as test_name,
    *
FROM institution_profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 6. Check if there are any institution profiles at all
SELECT 
    'All Institution Profiles' as test_name,
    COUNT(*) as total_profiles,
    array_agg(DISTINCT user_id) as user_ids
FROM institution_profiles;

-- 7. Check current user context (if running as authenticated user)
SELECT 
    'Current User Context' as test_name,
    auth.uid() as current_user_id,
    auth.role() as current_role;
