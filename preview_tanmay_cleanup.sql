-- PREVIEW: Tanmay P Gharat Cleanup (DRY RUN)
-- This script shows what will be deleted without actually deleting anything

-- 1. Show Tanmay's student profile (WILL BE PRESERVED)
SELECT 
    'TANMAY STUDENT PROFILE (PRESERVED)' as check_type,
    id as student_profile_id,
    full_name,
    role,
    user_id,
    'This will be kept - Tanmay remains a student' as status
FROM profiles 
WHERE full_name = 'Tanmay P Gharat';

-- 2. Show courses that will be DELETED
SELECT 
    'COURSES TO BE DELETED' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    ic.created_at,
    'These courses were incorrectly created with student user_id as institution_id' as reason
FROM institution_courses ic
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Show enrollments that will be DELETED
SELECT 
    'ENROLLMENTS TO BE DELETED' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ic.title as course_title,
    p.full_name as student_name,
    'These enrollments are for incorrectly created courses' as reason
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. Show batches that will be DELETED
SELECT 
    'BATCHES TO BE DELETED' as check_type,
    ib.id as batch_id,
    ib.batch_name,
    ib.course_id,
    ic.title as course_title,
    'These batches are for incorrectly created courses' as reason
FROM institution_batches ib
JOIN institution_courses ic ON ib.course_id = ic.id
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 5. Show Tanmay's legitimate student enrollments (WILL BE PRESERVED)
SELECT 
    'TANMAY LEGITIMATE STUDENT ENROLLMENTS (PRESERVED)' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    'These are legitimate student enrollments and will be kept' as status
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
WHERE p.full_name = 'Tanmay P Gharat'
AND ce.course_id NOT IN (
    SELECT id FROM institution_courses 
    WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'
);

-- 6. Summary of what will happen
SELECT 
    'CLEANUP SUMMARY' as check_type,
    'Tanmay P Gharat will remain a student only' as result,
    'Courses created with his user_id as institution_id will be deleted' as action1,
    'Enrollments for those courses will be deleted' as action2,
    'Batches for those courses will be deleted' as action3,
    'His legitimate student enrollments will be preserved' as preservation;

-- 7. Count of records to be affected
SELECT 
    'RECORD COUNTS' as check_type,
    (SELECT COUNT(*) FROM institution_courses WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171') as courses_to_delete,
    (SELECT COUNT(*) FROM course_enrollments ce JOIN institution_courses ic ON ce.course_id = ic.id WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171') as enrollments_to_delete,
    (SELECT COUNT(*) FROM institution_batches ib JOIN institution_courses ic ON ib.course_id = ic.id WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171') as batches_to_delete;
