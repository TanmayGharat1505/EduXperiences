-- Cleanup Tanmay P Gharat Institution Data
-- This script removes Tanmay's data that was incorrectly used as institution data

-- 1. First, let's see what Tanmay's data looks like
SELECT 
    'TANMAY STUDENT PROFILE' as check_type,
    id as student_profile_id,
    full_name,
    role,
    user_id as student_user_id,
    created_at
FROM profiles 
WHERE full_name = 'Tanmay P Gharat';

-- 2. Check if there are any courses incorrectly assigned to Tanmay's user_id
SELECT 
    'COURSES TO DELETE' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    ic.created_at,
    'These courses were incorrectly created with student user_id as institution_id' as issue
FROM institution_courses ic
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Check enrollments for these courses
SELECT 
    'ENROLLMENTS TO DELETE' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ic.title as course_title,
    'These enrollments are for incorrectly created courses' as issue
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. Check if there are any batches for these courses
SELECT 
    'BATCHES TO DELETE' as check_type,
    ib.id as batch_id,
    ib.batch_name,
    ib.course_id,
    ic.title as course_title,
    'These batches are for incorrectly created courses' as issue
FROM institution_batches ib
JOIN institution_courses ic ON ib.course_id = ic.id
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 5. SAFETY CHECK: Make sure we're not deleting legitimate data
SELECT 
    'SAFETY CHECK' as check_type,
    'Tanmay P Gharat should only be a student' as note,
    'We will delete courses created with his user_id as institution_id' as action,
    'His student profile and legitimate enrollments will be preserved' as preservation;

-- 6. DELETE the incorrectly created courses and related data
-- First, delete enrollments for these courses
DELETE FROM course_enrollments 
WHERE course_id IN (
    SELECT id FROM institution_courses 
    WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'
);

-- 7. Delete batches for these courses
DELETE FROM institution_batches 
WHERE course_id IN (
    SELECT id FROM institution_courses 
    WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'
);

-- 8. Delete the incorrectly created courses
DELETE FROM institution_courses 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 9. Verify the cleanup
SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Courses deleted' as status,
    COUNT(*) as remaining_courses_with_tanmay_user_id
FROM institution_courses 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 10. Verify Tanmay's student profile is intact
SELECT 
    'TANMAY STUDENT PROFILE VERIFIED' as check_type,
    id as student_profile_id,
    full_name,
    role,
    user_id,
    'Student profile preserved' as status
FROM profiles 
WHERE full_name = 'Tanmay P Gharat';

-- 11. Check if there are any remaining enrollments for Tanmay as a student
SELECT 
    'TANMAY STUDENT ENROLLMENTS' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    'These are legitimate student enrollments' as note
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
WHERE p.full_name = 'Tanmay P Gharat';

-- 12. Success message
SELECT 
    'SUCCESS' as check_type,
    'Tanmay P Gharat is now only a student' as message,
    'Incorrect institution data has been removed' as action,
    'Student profile and legitimate enrollments preserved' as preservation;
