-- Check Profiles Table Structure
-- This script shows what columns actually exist in the profiles table

-- 1. Check all columns in profiles table
SELECT 
    'Profiles Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check if there are any other tables that might have user information
SELECT 
    'Related Tables' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%user%' OR table_name LIKE '%profile%' OR table_name LIKE '%student%')
ORDER BY table_name;

-- 3. Check if there's a separate user table with email/avatar info
SELECT 
    'Auth Users Check' as check_type,
    'Checking if we can access auth.users' as description;

-- 4. Sample data from profiles table (first 3 rows)
SELECT 
    'Sample Profiles Data' as check_type,
    *
FROM profiles 
LIMIT 3;

-- 5. Check if there are any views that might have the missing columns
SELECT 
    'Views with Profile Info' as check_type,
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public' 
AND (view_definition LIKE '%email%' OR view_definition LIKE '%avatar%')
LIMIT 5;
