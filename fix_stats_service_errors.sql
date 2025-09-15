-- Fix Stats Service Database Errors
-- Run this in your Supabase SQL Editor to fix the 500 and 400 errors

-- 1. Check if profiles table has role column
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role';

-- 2. Check if institution_profiles table exists and has verified column
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
AND column_name = 'verified';

-- 3. Add role column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Added role column to profiles table';
    ELSE
        RAISE NOTICE 'Role column already exists in profiles table';
    END IF;
END $$;

-- 4. Add verified column to institution_profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institution_profiles' AND column_name = 'verified'
    ) THEN
        ALTER TABLE institution_profiles ADD COLUMN verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added verified column to institution_profiles table';
    ELSE
        RAISE NOTICE 'Verified column already exists in institution_profiles table';
    END IF;
END $$;

-- 5. Check RLS policies on profiles table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Check RLS policies on institution_profiles table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- 7. Create basic RLS policies if they don't exist
-- For profiles table - allow public read access for stats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Allow public read for stats'
    ) THEN
        CREATE POLICY "Allow public read for stats" ON profiles
            FOR SELECT USING (true);
        RAISE NOTICE 'Created public read policy for profiles table';
    END IF;
END $$;

-- For institution_profiles table - allow public read access for stats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'institution_profiles' AND policyname = 'Allow public read for stats'
    ) THEN
        CREATE POLICY "Allow public read for stats" ON institution_profiles
            FOR SELECT USING (true);
        RAISE NOTICE 'Created public read policy for institution_profiles table';
    END IF;
END $$;

-- 8. Test the queries that were failing
SELECT 'Testing profiles query' as test_name, COUNT(*) as count FROM profiles WHERE role = 'student';
SELECT 'Testing institution_profiles query' as test_name, COUNT(*) as count FROM institution_profiles WHERE verified = true;
