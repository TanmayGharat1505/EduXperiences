-- QUICK LOGIN FIX SCRIPT
-- Run this if the diagnostic scripts show issues

-- ==============================================
-- 1. EMERGENCY FIX: Ensure all users have profiles
-- ==============================================
-- This creates missing profiles for users who don't have them
INSERT INTO profiles (user_id, full_name, role, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
    'user', -- Default role
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- 2. FIX: Ensure role column exists and has proper values
-- ==============================================
-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Added role column to profiles table';
    END IF;
END $$;

-- Update NULL roles to 'user'
UPDATE profiles SET role = 'user' WHERE role IS NULL OR role = '';

-- ==============================================
-- 3. FIX: Create basic RLS policies if missing
-- ==============================================
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create working RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- 4. FIX: Ensure proper indexes exist
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ==============================================
-- 5. VERIFY: Check the fix worked
-- ==============================================
SELECT 'FIX VERIFICATION' as section, 'Users with profiles' as check_type, COUNT(*) as count
FROM auth.users u
INNER JOIN profiles p ON u.id = p.user_id

UNION ALL

SELECT 'FIX VERIFICATION', 'Profiles with valid roles', COUNT(*)
FROM profiles
WHERE role IS NOT NULL AND role != '';

-- ==============================================
-- 6. TEST: Create a test user profile (optional)
-- ==============================================
-- Uncomment and modify this if you want to test with a specific user
/*
INSERT INTO profiles (user_id, full_name, role, city, area)
VALUES (
    'your-test-user-id-here', -- Replace with actual user ID
    'Test User',
    'student',
    'Test City',
    'Test Area'
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
*/
