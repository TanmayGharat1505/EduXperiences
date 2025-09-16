-- EMERGENCY FIX: Restore login functionality
-- This script will diagnose and fix login/profile issues

-- 1. Check current RLS policies on profiles table
SELECT 
    'CURRENT RLS POLICIES' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Check if profiles table has proper structure
SELECT 
    'PROFILES TABLE STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on profiles
SELECT 
    'RLS STATUS' as section,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Test basic profile access
SELECT 
    'PROFILE ACCESS TEST' as section,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'tutor' THEN 1 END) as tutors,
    COUNT(CASE WHEN role = 'institution' THEN 1 END) as institutions
FROM profiles;

-- 5. Check for any broken policies or constraints
SELECT 
    'CONSTRAINT CHECK' as section,
    conname,
    contype,
    confrelid::regclass as foreign_table
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 6. EMERGENCY FIX: Restore basic RLS policies for profiles
-- Drop all existing policies first
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on profiles table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
    END LOOP;
    
    RAISE NOTICE 'Dropped all existing policies on profiles table';
END $$;

-- 7. Create essential RLS policies for profiles
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow public read for basic profile info (for stats)
CREATE POLICY "Allow public read for basic info" ON profiles
    FOR SELECT
    USING (true);

-- 8. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. Test the policies
SELECT 'TESTING POLICIES' as section;

-- Test 1: Count all profiles (should work with public read policy)
SELECT COUNT(*) as total_profiles FROM profiles;

-- Test 2: Count by role (should work with public read policy)
SELECT role, COUNT(*) as count FROM profiles GROUP BY role;

-- 10. Check if there are any auth issues
SELECT 
    'AUTH USERS CHECK' as section,
    COUNT(*) as total_auth_users
FROM auth.users;

-- 11. Check profile-user relationships
SELECT 
    'PROFILE-USER RELATIONSHIPS' as section,
    COUNT(*) as profiles_with_users
FROM profiles p
JOIN auth.users u ON p.user_id = u.id;

-- 12. Final verification
SELECT 
    'FINAL VERIFICATION' as section,
    'Profiles accessible' as status,
    COUNT(*) as count
FROM profiles;
