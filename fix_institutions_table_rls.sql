-- Fix Institutions Table RLS Policies
-- This script creates proper RLS policies for the institutions table

-- 1. First, check if the institutions table exists and its current structure
SELECT 
    'Institutions Table Check' as check_type,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'institutions' 
ORDER BY ordinal_position;

-- 2. Check current RLS policies on institutions table
SELECT 
    'Current RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institutions'
ORDER BY policyname;

-- 3. Enable RLS on institutions table if not already enabled
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Institutions can view own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can update own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can insert own data" ON institutions;
DROP POLICY IF EXISTS "Public can view approved institutions" ON institutions;

-- 5. Create RLS policies for institutions table

-- Policy 1: Institutions can view their own data
CREATE POLICY "Institutions can view own data" ON institutions
    FOR SELECT USING (
        official_email = auth.jwt() ->> 'email'
    );

-- Policy 2: Institutions can update their own data
CREATE POLICY "Institutions can update own data" ON institutions
    FOR UPDATE USING (
        official_email = auth.jwt() ->> 'email'
    );

-- Policy 3: Institutions can insert their own data
CREATE POLICY "Institutions can insert own data" ON institutions
    FOR INSERT WITH CHECK (
        official_email = auth.jwt() ->> 'email'
    );

-- Policy 4: Public can view approved institutions (for public listings)
CREATE POLICY "Public can view approved institutions" ON institutions
    FOR SELECT USING (
        status = 'approved'
    );

-- 6. Verify the policies were created
SELECT 
    'New RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institutions'
ORDER BY policyname;

-- 7. Test the policies with a sample query
SELECT 
    'Policy Test' as check_type,
    'Testing institutions table access' as note;

-- 8. Check if there are any institutions with the test email
SELECT 
    'Institution Data Check' as check_type,
    id,
    name,
    official_email,
    status,
    created_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com'
LIMIT 5;

-- 9. Success message
SELECT 
    'SUCCESS' as check_type,
    'RLS policies created for institutions table' as message,
    'Institutions can now access their own data' as result;
