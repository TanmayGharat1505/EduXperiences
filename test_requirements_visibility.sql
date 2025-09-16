-- Test Requirements Visibility for Students
-- Run this in Supabase SQL Editor to debug the visibility issue

-- 1. Check if requirements table exists and has data
SELECT 'Requirements table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'requirements' 
AND table_schema = 'public';

SELECT 'All requirements in database:' as info;
SELECT count(*) as total_requirements FROM requirements;

SELECT 'Requirements by status:' as info;
SELECT status, count(*) as count FROM requirements GROUP BY status;

-- 2. Check RLS policies
SELECT 'RLS policies for requirements:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'requirements';

-- 3. Test basic query as authenticated user
-- This should show requirements for the current user
SELECT 'Requirements for current user:' as info;
SELECT id, student_id, subject, status, created_at 
FROM requirements 
WHERE student_id = auth.uid()
ORDER BY created_at DESC;

-- 4. Check requirement_tutor_matches table
SELECT 'Requirement tutor matches:' as info;
SELECT count(*) as total_matches FROM requirement_tutor_matches;

-- 5. Test if there are any foreign key issues
SELECT 'Requirements with invalid student_id references:' as info;
SELECT r.id, r.student_id, r.subject 
FROM requirements r 
LEFT JOIN auth.users u ON r.student_id = u.id 
WHERE u.id IS NULL;

-- 6. Check if auth.uid() is working
SELECT 'Current user info:' as info;
SELECT auth.uid() as current_user_id, auth.role() as current_role;
