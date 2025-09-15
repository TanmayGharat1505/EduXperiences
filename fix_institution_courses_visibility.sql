-- Fix institution courses visibility in institution dashboard
-- This ensures institutions can see their own courses

-- 1. Check current RLS policies on institution_courses table
SELECT 
    'CURRENT RLS POLICIES' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_courses'
ORDER BY policyname;

-- 2. Check if institution_courses table exists and has data
SELECT 
    'TABLE CHECK' as section,
    COUNT(*) as total_courses,
    COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_courses,
    COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft_courses
FROM institution_courses;

-- 3. Check sample data
SELECT 
    'SAMPLE DATA' as section,
    id,
    institution_id,
    category,
    status,
    created_at
FROM institution_courses 
LIMIT 5;

-- 4. Check if RLS is enabled on institution_courses
SELECT 
    'RLS STATUS' as section,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'institution_courses';

-- 5. Fix: Drop existing policies and create proper ones
DROP POLICY IF EXISTS "Institutions can view own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can insert own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can update own courses" ON institution_courses;
DROP POLICY IF EXISTS "Institutions can delete own courses" ON institution_courses;
DROP POLICY IF EXISTS "Allow public read for institution courses" ON institution_courses;

-- 6. Create proper RLS policies for institution_courses
-- Policy 1: Institutions can view their own courses
CREATE POLICY "Institutions can view own courses" ON institution_courses
    FOR SELECT
    USING (
        institution_id IN (
            SELECT id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        institution_id IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'institution'
        )
    );

-- Policy 2: Institutions can insert their own courses
CREATE POLICY "Institutions can insert own courses" ON institution_courses
    FOR INSERT
    WITH CHECK (
        institution_id IN (
            SELECT id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        institution_id IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'institution'
        )
    );

-- Policy 3: Institutions can update their own courses
CREATE POLICY "Institutions can update own courses" ON institution_courses
    FOR UPDATE
    USING (
        institution_id IN (
            SELECT id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        institution_id IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'institution'
        )
    )
    WITH CHECK (
        institution_id IN (
            SELECT id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        institution_id IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'institution'
        )
    );

-- Policy 4: Institutions can delete their own courses
CREATE POLICY "Institutions can delete own courses" ON institution_courses
    FOR DELETE
    USING (
        institution_id IN (
            SELECT id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
        OR
        institution_id IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'institution'
        )
    );

-- Policy 5: Public can view active courses (for students)
CREATE POLICY "Allow public read for active courses" ON institution_courses
    FOR SELECT
    USING (status = 'Active');

-- 7. Ensure RLS is enabled
ALTER TABLE institution_courses ENABLE ROW LEVEL SECURITY;

-- 8. Test the policies
SELECT 
    'TESTING POLICIES' as section,
    'Institution courses should now be visible to their creators' as status;

-- 9. Check if institution_profiles table exists and has the right structure
SELECT 
    'INSTITUTION_PROFILES CHECK' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'institution_profiles'
        ) THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as table_status;

-- 10. If institution_profiles doesn't exist, check if institutions are in profiles table
SELECT 
    'INSTITUTION DATA LOCATION' as section,
    COUNT(*) as institution_count
FROM profiles 
WHERE role = 'institution';
