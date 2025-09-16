-- Comprehensive fix for stats service errors
-- This script addresses RLS policies and schema issues affecting stats queries

-- 1. Check current RLS policies on profiles table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Check current RLS policies on institution_profiles table
SELECT 
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

-- 3. Check if verified column exists in institution_profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
AND column_name = 'verified';

-- 4. Add verified column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institution_profiles' 
        AND column_name = 'verified'
    ) THEN
        ALTER TABLE institution_profiles ADD COLUMN verified BOOLEAN DEFAULT false;
        UPDATE institution_profiles SET verified = true WHERE verified IS NULL;
    END IF;
END $$;

-- 5. Create public read policies for stats queries
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow public read for stats" ON profiles;
DROP POLICY IF EXISTS "Allow public read for institution stats" ON institution_profiles;

-- Create new policies for stats queries
CREATE POLICY "Allow public read for stats" ON profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read for institution stats" ON institution_profiles
    FOR SELECT
    USING (true);

-- 6. Ensure RLS is enabled on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Test the queries that are failing
-- Test profiles query
SELECT COUNT(*) as total_profiles FROM profiles;

-- Test student count query
SELECT COUNT(*) as student_count FROM profiles WHERE role = 'student';

-- Test institution count query
SELECT COUNT(*) as institution_count FROM institution_profiles WHERE verified = true;

-- 8. Check for any data type issues
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'institution_profiles')
ORDER BY table_name, ordinal_position;

-- 9. Verify the app_role enum is working correctly
SELECT unnest(enum_range(NULL::app_role)) as role_values;

-- 10. Check for any invalid role assignments
SELECT role, COUNT(*) as count
FROM profiles 
GROUP BY role
ORDER BY count DESC;
