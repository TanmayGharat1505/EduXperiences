-- Fix Institution Profile Creation
-- This script ensures institution users have proper profiles in the profiles table

-- 1. Check if there are institution users without profiles
SELECT 
  'Institution users without profiles' as check_name,
  COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.raw_user_meta_data->>'role' = 'institution'
  AND p.user_id IS NULL;

-- 2. Create profiles for institution users who don't have them
INSERT INTO profiles (user_id, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Institution User') as full_name,
  'institution'::app_role,
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.raw_user_meta_data->>'role' = 'institution'
  AND p.user_id IS NULL
  AND u.email_confirmed_at IS NOT NULL; -- Only confirmed users

-- 3. Verify the fix
SELECT 
  'Institution users with profiles after fix' as check_name,
  COUNT(*) as count
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.raw_user_meta_data->>'role' = 'institution'
  AND p.role = 'institution';

-- 4. Show all institution profiles
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.role,
  p.created_at,
  u.email,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'institution'
ORDER BY p.created_at DESC;
