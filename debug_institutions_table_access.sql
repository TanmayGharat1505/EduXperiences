-- Debug Institutions Table Access
-- This script helps diagnose the 406/403 error when accessing institutions table

-- 1. Check if institutions table exists
SELECT 
    'Table Exists Check' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'institutions';

-- 2. Check table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institutions' 
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'institutions';

-- 4. Check current RLS policies
SELECT 
    'Current Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institutions'
ORDER BY policyname;

-- 5. Check if there are any institutions in the table
SELECT 
    'Data Count' as check_type,
    COUNT(*) as total_institutions
FROM institutions;

-- 6. Check sample data (if any exists)
SELECT 
    'Sample Data' as check_type,
    id,
    name,
    official_email,
    status,
    created_at
FROM institutions 
LIMIT 3;

-- 7. Check if the specific email exists
SELECT 
    'Email Check' as check_type,
    id,
    name,
    official_email,
    status
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com';

-- 8. Check all emails in the table
SELECT 
    'All Emails' as check_type,
    official_email,
    name,
    status
FROM institutions 
ORDER BY created_at DESC
LIMIT 10;
