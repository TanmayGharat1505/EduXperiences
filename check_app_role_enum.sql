-- CHECK APP_ROLE ENUM VALUES AND CURRENT DATA
-- Run this to see what's defined and what's in use

-- ==============================================
-- 1. CHECK ALL POSSIBLE ENUM VALUES
-- ==============================================
SELECT 'ENUM VALUES' as section, 'Available roles' as check_type,
       e.enumlabel as role_value,
       e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'app_role'
ORDER BY e.enumsortorder;

-- ==============================================
-- 2. CHECK CURRENT ROLE DISTRIBUTION
-- ==============================================
SELECT 'CURRENT ROLES' as section, 'Role distribution' as check_type,
       role::text as role_value,
       COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- ==============================================
-- 3. CHECK FOR ANY INVALID ROLE VALUES
-- ==============================================
SELECT 'INVALID CHECK' as section, 'Invalid roles found' as check_type,
       COUNT(*) as invalid_count
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'app_role' 
    AND e.enumlabel = p.role::text
);

-- ==============================================
-- 4. CHECK USER-PROFILE RELATIONSHIPS BY ROLE
-- ==============================================
SELECT 'ROLE RELATIONSHIPS' as section, 'Users by role' as check_type,
       p.role::text as role_value,
       COUNT(DISTINCT u.id) as user_count,
       COUNT(DISTINCT p.user_id) as profile_count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
GROUP BY p.role
ORDER BY user_count DESC;

-- ==============================================
-- 5. CHECK FOR USERS WITHOUT PROFILES
-- ==============================================
SELECT 'MISSING PROFILES' as section, 'Users without profiles' as check_type,
       COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- ==============================================
-- 6. CHECK RECENT PROFILE CREATIONS
-- ==============================================
SELECT 'RECENT PROFILES' as section, 'Recent role assignments' as check_type,
       role::text as role_value,
       COUNT(*) as count,
       MAX(created_at) as latest_created
FROM profiles
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY role
ORDER BY count DESC;
