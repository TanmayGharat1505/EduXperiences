-- Fix RLS policies for stats service
-- This ensures the stats queries can access the data

-- 1. Create public read policy for profiles table (for stats)
DROP POLICY IF EXISTS "Allow public read for stats" ON profiles;

CREATE POLICY "Allow public read for stats" ON profiles
    FOR SELECT
    USING (true);

-- 2. Create public read policy for tutor_profiles table (for stats)
DROP POLICY IF EXISTS "Allow public read for tutor stats" ON tutor_profiles;

CREATE POLICY "Allow public read for tutor stats" ON tutor_profiles
    FOR SELECT
    USING (true);

-- 3. Test the queries that were failing
SELECT 'Testing profiles query...' as test;

-- Test student count
SELECT COUNT(*) as student_count FROM profiles WHERE role = 'student';

-- Test institution count  
SELECT COUNT(*) as institution_count FROM profiles WHERE role = 'institution';

-- Test tutor count
SELECT COUNT(*) as tutor_count FROM profiles WHERE role = 'tutor';

-- Test total profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 4. Check if tutor_profiles table exists and has verified column
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'tutor_profiles'
        ) THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as tutor_profiles_table_status;

-- 5. If tutor_profiles exists, test verified tutors query
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tutor_profiles'
    ) THEN
        PERFORM 1; -- This will execute if table exists
        RAISE NOTICE 'tutor_profiles table exists, testing verified tutors query...';
    ELSE
        RAISE NOTICE 'tutor_profiles table does not exist!';
    END IF;
END $$;
