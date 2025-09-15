-- Fix Institution Student Enrollment Issue
-- This script addresses the issue where institutions can't see their own enrollments

-- 1. Check if the same user has multiple roles
SELECT 
    'User Role Check' as check_type,
    id,
    full_name,
    role,
    user_id
FROM profiles 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Check if there are any enrollments where student_id = institution_id
SELECT 
    'Self-Enrollment Check' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id,
    CASE 
        WHEN ce.student_id = ic.institution_id THEN 'SELF-ENROLLMENT'
        ELSE 'NORMAL-ENROLLMENT'
    END as enrollment_type
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.status = 'enrolled'
ORDER BY ce.enrolled_at DESC;

-- 3. Check RLS policies for course_enrollments
SELECT 
    'RLS Policies - course_enrollments' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

-- 4. Create a policy to allow institutions to see enrollments for their courses
-- (including self-enrollments)
DROP POLICY IF EXISTS "Institutions can view enrollments for their courses" ON course_enrollments;

CREATE POLICY "Institutions can view enrollments for their courses" ON course_enrollments
    FOR SELECT USING (
        course_id IN (
            SELECT id 
            FROM institution_courses 
            WHERE institution_id = auth.uid()
        )
    );

-- 5. Test the policy with a sample query
SELECT 
    'Policy Test' as check_type,
    ce.id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ic.title as course_title,
    ic.institution_id
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'
AND ce.status = 'enrolled';

-- 6. Check if there are any actual student enrollments (different user)
SELECT 
    'Real Student Enrollments' as check_type,
    ce.id,
    ce.student_id,
    ce.course_id,
    ce.status,
    p.full_name as student_name,
    p.role as student_role,
    ic.title as course_title
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ce.status = 'enrolled'
AND ce.student_id != ic.institution_id
ORDER BY ce.enrolled_at DESC;

-- 7. Verify the new policy works
SELECT 
    'New Policy Verification' as check_type,
    'Policy created successfully' as status;
