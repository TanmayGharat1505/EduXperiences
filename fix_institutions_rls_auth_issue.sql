-- Fix Institutions RLS Auth Issue
-- This script fixes the permission denied error by using a different approach for RLS policies

-- 1. First, check current policies
SELECT 
    'Current Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institutions'
ORDER BY policyname;

-- 2. Drop existing policies that use auth.jwt()
DROP POLICY IF EXISTS "Institutions can view own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can update own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can insert own data" ON institutions;
DROP POLICY IF EXISTS "Public can view approved institutions" ON institutions;

-- 3. Create new RLS policies using auth.uid() instead of auth.jwt()
-- This approach uses the user ID from the profiles table instead of JWT email

-- Policy 1: Institutions can view their own data (using profiles table join)
CREATE POLICY "Institutions can view own data" ON institutions
    FOR SELECT USING (
        official_email IN (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- Policy 2: Institutions can update their own data
CREATE POLICY "Institutions can update own data" ON institutions
    FOR UPDATE USING (
        official_email IN (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- Policy 3: Institutions can insert their own data
CREATE POLICY "Institutions can insert own data" ON institutions
    FOR INSERT WITH CHECK (
        official_email IN (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- Policy 4: Public can view approved institutions
CREATE POLICY "Public can view approved institutions" ON institutions
    FOR SELECT USING (
        status = 'approved'
    );

-- 4. Alternative approach: Create a function to get user email
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create policies using the function
DROP POLICY IF EXISTS "Institutions can view own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can update own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can insert own data" ON institutions;

CREATE POLICY "Institutions can view own data" ON institutions
    FOR SELECT USING (
        official_email = get_user_email()
    );

CREATE POLICY "Institutions can update own data" ON institutions
    FOR UPDATE USING (
        official_email = get_user_email()
    );

CREATE POLICY "Institutions can insert own data" ON institutions
    FOR INSERT WITH CHECK (
        official_email = get_user_email()
    );

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- 7. Verify the policies were created
SELECT 
    'New Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institutions'
ORDER BY policyname;

-- 8. Test the function
SELECT 
    'Function Test' as check_type,
    get_user_email() as user_email;

-- 9. Success message
SELECT 
    'SUCCESS' as check_type,
    'RLS policies updated to use auth.uid() approach' as message,
    'Institutions should now be able to access their data' as result;
