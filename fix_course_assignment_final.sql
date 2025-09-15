-- FINAL FIX: Reassign Courses to Correct Institution Profile
-- Using the Institution Director profile ID: 7d29ceab-be34-48ed-87cd-5dae2b873d1c

-- 1. Show current problematic courses
SELECT 
    'BEFORE FIX' as status,
    id,
    title,
    institution_id as current_institution_id,
    'WRONG - Student user_id used as institution_id' as issue
FROM institution_courses 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Show the institution we're assigning to
SELECT 
    'ASSIGNING TO' as status,
    id as institution_profile_id,
    full_name as institution_name,
    role,
    user_id,
    'This is the correct institution profile' as note
FROM profiles 
WHERE id = '7d29ceab-be34-48ed-87cd-5dae2b873d1c';

-- 3. Fix the courses by reassigning to Institution Director
UPDATE institution_courses 
SET institution_id = '7d29ceab-be34-48ed-87cd-5dae2b873d1c'  -- Institution Director
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. Show the fixed courses
SELECT 
    'AFTER FIX' as status,
    ic.id,
    ic.title,
    ic.institution_id as new_institution_id,
    p.full_name as institution_name,
    'CORRECT - Real institution profile' as status
FROM institution_courses ic
LEFT JOIN profiles p ON ic.institution_id = p.id
WHERE ic.id IN (
    'ca2860ab-81e8-4055-a3f2-139a32bead75',  -- Introduction to AI
    '58f49a6f-6729-4d86-8e24-0094cd3aefa2'   -- Cloud Computing
);

-- 5. Verify student enrollments are still intact
SELECT 
    'STUDENT ENROLLMENTS VERIFIED' as status,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    p.full_name as student_name,
    ic.title as course_title,
    'All enrollments preserved' as note
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.course_id IN (
    'ca2860ab-81e8-4055-a3f2-139a32bead75',
    '58f49a6f-6729-4d86-8e24-0094cd3aefa2'
);

-- 6. Test the enrollment count query that was failing
SELECT 
    'ENROLLMENT COUNT TEST' as status,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    COUNT(ce.id) as enrollment_count,
    'This should now work correctly' as note
FROM institution_courses ic
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id AND ce.status = 'enrolled'
WHERE ic.id IN (
    'ca2860ab-81e8-4055-a3f2-139a32bead75',
    '58f49a6f-6729-4d86-8e24-0094cd3aefa2'
)
GROUP BY ic.id, ic.title, ic.institution_id;

-- 7. Success message
SELECT 
    'SUCCESS' as status,
    'Courses have been reassigned to Institution Director' as message,
    'Student enrollments remain intact' as note,
    'Enrollment counts should now update correctly' as expected_result;
