-- DIAGNOSTIC SCRIPT: Login Functionality Issues
-- Run this in your Supabase SQL Editor and share the results

-- ==============================================
-- 1. CHECK AUTH.USERS TABLE INTEGRITY
-- ==============================================
SELECT 'AUTH USERS CHECK' as section, 'Total users' as check_type, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'AUTH USERS CHECK', 'Users with email', COUNT(*) FROM auth.users WHERE email IS NOT NULL
UNION ALL
SELECT 'AUTH USERS CHECK', 'Users created today', COUNT(*) FROM auth.users WHERE created_at::date = CURRENT_DATE
UNION ALL
SELECT 'AUTH USERS CHECK', 'Users created this week', COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- ==============================================
-- 2. CHECK PROFILES TABLE INTEGRITY
-- ==============================================
SELECT 'PROFILES CHECK' as section, 'Total profiles' as check_type, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'PROFILES CHECK', 'Profiles with user_id', COUNT(*) FROM profiles WHERE user_id IS NOT NULL
UNION ALL
SELECT 'PROFILES CHECK', 'Student profiles', COUNT(*) FROM profiles WHERE role = 'student'
UNION ALL
SELECT 'PROFILES CHECK', 'Tutor profiles', COUNT(*) FROM profiles WHERE role = 'tutor'
UNION ALL
SELECT 'PROFILES CHECK', 'Institution profiles', COUNT(*) FROM profiles WHERE role = 'institution'
UNION ALL
SELECT 'PROFILES CHECK', 'Profiles without role', COUNT(*) FROM profiles WHERE role IS NULL;

-- ==============================================
-- 3. CHECK USER-PROFILE RELATIONSHIPS
-- ==============================================
SELECT 'RELATIONSHIP CHECK' as section, 'Users without profiles' as check_type, COUNT(*) as count 
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.user_id 
WHERE p.user_id IS NULL

UNION ALL

SELECT 'RELATIONSHIP CHECK', 'Profiles without users', COUNT(*) 
FROM profiles p 
LEFT JOIN auth.users u ON p.user_id = u.id 
WHERE u.id IS NULL

UNION ALL

SELECT 'RELATIONSHIP CHECK', 'Valid user-profile pairs', COUNT(*) 
FROM auth.users u 
INNER JOIN profiles p ON u.id = p.user_id;

-- ==============================================
-- 4. CHECK RLS POLICIES ON PROFILES TABLE
-- ==============================================
SELECT 'RLS POLICIES' as section, 'Profiles policies' as check_type, policyname, cmd, permissive, roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ==============================================
-- 5. CHECK SPECIFIC USER DATA (Replace with your test user email)
-- ==============================================
-- Replace 'your-email@example.com' with an actual user email from your system
SELECT 'USER DATA CHECK' as section, 'User details' as check_type, 
       u.id as user_id, 
       u.email, 
       u.created_at as user_created,
       p.role as profile_role,
       p.full_name,
       p.created_at as profile_created
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.user_id 
WHERE u.email = 'your-email@example.com'  -- CHANGE THIS EMAIL
LIMIT 5;

-- ==============================================
-- 6. CHECK FOR ORPHANED DATA
-- ==============================================
SELECT 'ORPHANED DATA' as section, 'Tutor profiles without users' as check_type, COUNT(*) as count
FROM tutor_profiles tp
LEFT JOIN auth.users u ON tp.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'ORPHANED DATA', 'Student profiles without users', COUNT(*)
FROM student_profiles sp
LEFT JOIN auth.users u ON sp.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'ORPHANED DATA', 'Institution profiles without users', COUNT(*)
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE u.id IS NULL;

-- ==============================================
-- 7. CHECK RECENT CHANGES (Last 24 hours)
-- ==============================================
SELECT 'RECENT CHANGES' as section, 'Recent profile changes' as check_type, 
       COUNT(*) as count,
       MAX(updated_at) as last_update
FROM profiles 
WHERE updated_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT 'RECENT CHANGES', 'Recent user changes', 
       COUNT(*),
       MAX(created_at) as last_update
FROM auth.users 
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- ==============================================
-- 8. CHECK TABLE STRUCTURE INTEGRITY
-- ==============================================
SELECT 'TABLE STRUCTURE' as section, 'Profiles columns' as check_type, 
       column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
