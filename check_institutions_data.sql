-- Check Institutions Data
-- This script checks what data exists in the institutions table

-- 1. Check if institutions table exists and is accessible
SELECT 
    'Table Access Check' as check_type,
    COUNT(*) as total_institutions
FROM institutions;

-- 2. Check table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'institutions' 
ORDER BY ordinal_position;

-- 3. Check all institutions in the table
SELECT 
    'All Institutions' as check_type,
    id,
    name,
    official_email,
    type,
    status,
    created_at
FROM institutions 
ORDER BY created_at DESC;

-- 4. Check for the specific email
SELECT 
    'Email Search' as check_type,
    id,
    name,
    official_email,
    type,
    status
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com';

-- 5. Check all emails in the table
SELECT 
    'All Emails' as check_type,
    official_email,
    name,
    status
FROM institutions 
ORDER BY created_at DESC;

-- 6. Check if there are any institutions with similar emails
SELECT 
    'Similar Emails' as check_type,
    official_email,
    name,
    status
FROM institutions 
WHERE official_email LIKE '%maseerah%' 
   OR official_email LIKE '%gmail%'
ORDER BY created_at DESC;

-- 7. Check RLS status
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'institutions';

-- 8. Check current policies
SELECT 
    'Current Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'institutions'
ORDER BY policyname;
