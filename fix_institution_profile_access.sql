-- Fix institution profile access issues
-- This addresses the 406 error when fetching institution profiles

-- 1. Check current RLS policies on profiles table
SELECT 
    'CURRENT POLICIES' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Check if the specific user exists and has correct role
SELECT 
    'USER CHECK' as section,
    user_id,
    role,
    full_name,
    email,
    created_at
FROM profiles 
WHERE user_id = '7f08b928-f5df-4a23-8d6d-5861bebdf0b9';

-- 3. Test the exact query that's failing
SELECT 
    'QUERY TEST' as section,
    user_id,
    role,
    full_name,
    email
FROM profiles 
WHERE id = '7f08b928-f5df-4a23-8d6d-5861bebdf0b9' 
AND role = 'institution';

-- 4. Check if there's a mismatch between id and user_id
SELECT 
    'ID MISMATCH CHECK' as section,
    id,
    user_id,
    role
FROM profiles 
WHERE user_id = '7f08b928-f5df-4a23-8d6d-5861bebdf0b9'
OR id = '7f08b928-f5df-4a23-8d6d-5861bebdf0b9';

-- 5. Fix: Update RLS policies to allow proper access
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public read for basic info" ON profiles;

-- Create improved policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow public read for profiles" ON profiles
    FOR SELECT
    USING (true);

-- 6. Test the fixed query
SELECT 
    'FIXED QUERY TEST' as section,
    user_id,
    role,
    full_name,
    email
FROM profiles 
WHERE user_id = '7f08b928-f5df-4a23-8d6d-5861bebdf0b9' 
AND role = 'institution';
