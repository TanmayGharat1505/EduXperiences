-- CHECK ENUM VALUES FOR APP_ROLE
-- Run this to see what role values are available

-- ==============================================
-- 1. CHECK ENUM TYPE DEFINITION
-- ==============================================
SELECT 'ENUM CHECK' as section, 'Enum type' as check_type,
       t.typname as enum_name,
       e.enumlabel as enum_value,
       e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'app_role'
ORDER BY e.enumsortorder;

-- ==============================================
-- 2. CHECK CURRENT ROLE VALUES IN PROFILES
-- ==============================================
SELECT 'CURRENT ROLES' as section, 'Role values in use' as check_type,
       CASE 
         WHEN role IS NULL THEN 'NULL'
         ELSE role::text
       END as role_value,
       COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- ==============================================
-- 3. CHECK FOR INVALID ROLE VALUES
-- ==============================================
-- This will show if there are any profiles with invalid role values
SELECT 'INVALID ROLES' as section, 'Invalid role values' as check_type,
       user_id,
       role::text as current_role,
       'Invalid role value' as issue
FROM profiles
WHERE role IS NOT NULL 
AND role::text NOT IN (
    SELECT enumlabel 
    FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'app_role'
);

-- ==============================================
-- 4. CHECK COLUMN DEFINITION
-- ==============================================
SELECT 'COLUMN INFO' as section, 'Role column definition' as check_type,
       column_name,
       data_type,
       udt_name,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role';
