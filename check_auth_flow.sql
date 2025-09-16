-- AUTH FLOW DIAGNOSTIC SCRIPT
-- Run this to check the authentication flow components

-- ==============================================
-- 1. CHECK AUTH FUNCTIONS AND TRIGGERS
-- ==============================================
SELECT 'AUTH FUNCTIONS' as section, 'Functions' as check_type, 
       routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE '%auth%' OR routine_name LIKE '%profile%' OR routine_name LIKE '%user%')
ORDER BY routine_name;

-- ==============================================
-- 2. CHECK TRIGGERS ON PROFILES TABLE
-- ==============================================
SELECT 'TRIGGERS' as section, 'Profile triggers' as check_type,
       trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

-- ==============================================
-- 3. CHECK FOREIGN KEY CONSTRAINTS
-- ==============================================
SELECT 'FOREIGN KEYS' as section, 'Profile constraints' as check_type,
       tc.constraint_name, 
       tc.table_name, 
       kcu.column_name, 
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles';

-- ==============================================
-- 4. CHECK FOR BROKEN RLS POLICIES
-- ==============================================
SELECT 'BROKEN RLS' as section, 'Problematic policies' as check_type,
       tablename, policyname, cmd, permissive, roles, qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'tutor_profiles', 'student_profiles', 'institution_profiles')
AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.role%')
ORDER BY tablename, policyname;

-- ==============================================
-- 5. CHECK FOR MISSING INDEXES
-- ==============================================
SELECT 'MISSING INDEXES' as section, 'Profile indexes' as check_type,
       indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename = 'profiles'
ORDER BY indexname;

-- ==============================================
-- 6. CHECK AUTH.USERS VS PROFILES MISMATCH
-- ==============================================
SELECT 'MISMATCH CHECK' as section, 'User-Profile mismatch' as check_type,
       'Users without profiles' as issue_type,
       COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL

UNION ALL

SELECT 'MISMATCH CHECK', 'Profile-User mismatch', 'Profiles without users', COUNT(*)
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- ==============================================
-- 7. CHECK ROLE DISTRIBUTION
-- ==============================================
SELECT 'ROLE DISTRIBUTION' as section, 'Role counts' as check_type,
       CASE 
         WHEN role IS NULL THEN 'NULL'
         ELSE role::text
       END as role_value,
       COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- ==============================================
-- 8. CHECK FOR DUPLICATE PROFILES
-- ==============================================
SELECT 'DUPLICATE CHECK' as section, 'Duplicate profiles' as check_type,
       user_id,
       COUNT(*) as duplicate_count
FROM profiles
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
