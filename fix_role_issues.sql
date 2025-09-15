-- FIX ROLE-RELATED LOGIN ISSUES
-- Run this after checking the enum values

-- ==============================================
-- 1. FIRST, LET'S SEE WHAT WE'RE WORKING WITH
-- ==============================================
-- Check current enum values
SELECT 'BEFORE FIX' as section, 'Current enum values' as check_type,
       e.enumlabel as role_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'app_role'
ORDER BY e.enumsortorder;

-- ==============================================
-- 2. ADD MISSING ROLE VALUES IF NEEDED
-- ==============================================
-- Add 'tutor' role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'app_role' AND e.enumlabel = 'tutor'
    ) THEN
        ALTER TYPE app_role ADD VALUE 'tutor';
        RAISE NOTICE 'Added tutor role to app_role enum';
    END IF;
END $$;

-- Add 'institution' role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'app_role' AND e.enumlabel = 'institution'
    ) THEN
        ALTER TYPE app_role ADD VALUE 'institution';
        RAISE NOTICE 'Added institution role to app_role enum';
    END IF;
END $$;

-- Add 'admin' role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'app_role' AND e.enumlabel = 'admin'
    ) THEN
        ALTER TYPE app_role ADD VALUE 'admin';
        RAISE NOTICE 'Added admin role to app_role enum';
    END IF;
END $$;

-- ==============================================
-- 3. CREATE MISSING PROFILES FOR USERS
-- ==============================================
-- Create profiles for users who don't have them
INSERT INTO profiles (user_id, full_name, role, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
    'student'::app_role, -- Default role
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- 4. UPDATE PROFILES WITH INVALID ROLES
-- ==============================================
-- Update any profiles with invalid roles to 'student'
UPDATE profiles 
SET role = 'student'::app_role
WHERE role::text NOT IN (
    SELECT e.enumlabel 
    FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'app_role'
);

-- ==============================================
-- 5. VERIFY THE FIX
-- ==============================================
-- Check enum values after fix
SELECT 'AFTER FIX' as section, 'Updated enum values' as check_type,
       e.enumlabel as role_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'app_role'
ORDER BY e.enumsortorder;

-- Check role distribution after fix
SELECT 'AFTER FIX' as section, 'Role distribution' as check_type,
       role::text as role_value,
       COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- Check users without profiles after fix
SELECT 'AFTER FIX' as section, 'Users without profiles' as check_type,
       COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;
