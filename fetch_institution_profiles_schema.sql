-- Fetch Institution Profiles Table Schema and Data
-- This script will show us the exact structure and data in the institution_profiles table

-- 1. Get table structure (columns, types, constraints)
SELECT 
    'Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Get table constraints (primary keys, foreign keys, etc.)
SELECT 
    'Table Constraints' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'institution_profiles' 
    AND tc.table_schema = 'public';

-- 3. Get sample data (first 5 rows)
SELECT 
    'Sample Data' as info,
    *
FROM institution_profiles 
LIMIT 5;

-- 4. Get row count
SELECT 
    'Row Count' as info,
    COUNT(*) as total_rows
FROM institution_profiles;

-- 5. Get column count
SELECT 
    'Column Count' as info,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
    AND table_schema = 'public';
