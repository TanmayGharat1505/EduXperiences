-- Check Course Data Consistency
-- This script helps identify data issues that might cause visibility problems

-- 1. Check all courses and their institution_id
SELECT 
    'Course Data Check' as check_type,
    id,
    title,
    institution_id,
    status,
    created_at,
    LENGTH(institution_id::text) as id_length
FROM institution_courses 
ORDER BY created_at DESC;

-- 2. Check for any courses with NULL institution_id
SELECT 
    'Courses with NULL institution_id' as check_type,
    COUNT(*) as count
FROM institution_courses 
WHERE institution_id IS NULL;

-- 3. Check for any courses with empty institution_id
SELECT 
    'Courses with empty institution_id' as check_type,
    COUNT(*) as count
FROM institution_courses 
WHERE institution_id = '';

-- 4. Check unique institution_ids
SELECT 
    'Unique Institution IDs' as check_type,
    institution_id,
    COUNT(*) as course_count
FROM institution_courses 
GROUP BY institution_id
ORDER BY course_count DESC;

-- 5. Check if there are any courses created by different users
-- (This would indicate a user ID mismatch)
SELECT 
    'Institution ID Distribution' as check_type,
    institution_id,
    array_agg(title) as course_titles,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM institution_courses 
GROUP BY institution_id
ORDER BY first_created DESC;

-- 6. Check current user context
SELECT 
    'Current User Context' as check_type,
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 7. Check if there are any RLS policy conflicts
SELECT 
    'RLS Policy Check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_courses'
ORDER BY policyname;
