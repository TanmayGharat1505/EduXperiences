-- Fix Institution Profiles RLS Policies
-- This script ensures institution users can access their own profiles

-- 1. Check current RLS policies
SELECT 
    'Current RLS Policies' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own institution profile" ON institution_profiles;
DROP POLICY IF EXISTS "Users can update own institution profile" ON institution_profiles;
DROP POLICY IF EXISTS "Users can insert own institution profile" ON institution_profiles;
DROP POLICY IF EXISTS "Admins can view all institution profiles" ON institution_profiles;
DROP POLICY IF EXISTS "Public can view approved institution profiles" ON institution_profiles;

-- 3. Create new, simple RLS policies
-- Policy 1: Allow users to view their own institution profile
CREATE POLICY "Users can view own institution profile" ON institution_profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy 2: Allow users to update their own institution profile
CREATE POLICY "Users can update own institution profile" ON institution_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy 3: Allow users to insert their own institution profile
CREATE POLICY "Users can insert own institution profile" ON institution_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow admins to view all institution profiles
CREATE POLICY "Admins can view all institution profiles" ON institution_profiles
    FOR ALL 
    USING (auth.role() = 'admin');

-- 4. Verify the policies were created
SELECT 
    'New RLS Policies' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- 5. Test the query with the specific user ID
SELECT 
    'Test Query for User' as info,
    COUNT(*) as profile_count
FROM institution_profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';
