-- IMMEDIATE FIX: Reassign Courses to Correct Institution
-- This script fixes the data integrity issue immediately

-- 1. Show current problematic courses
SELECT 
    'BEFORE FIX' as status,
    id,
    title,
    institution_id as current_institution_id
FROM institution_courses 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Fix the courses by reassigning to Institution Director
UPDATE institution_courses 
SET institution_id = '7d29ceab-be34-48ed-87cd-5dae2b873d1c'  -- Institution Director
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Show the fixed courses
SELECT 
    'AFTER FIX' as status,
    ic.id,
    ic.title,
    ic.institution_id as new_institution_id,
    p.full_name as institution_name
FROM institution_courses ic
LEFT JOIN profiles p ON ic.institution_id = p.id
WHERE ic.id IN (
    'ca2860ab-81e8-4055-a3f2-139a32bead75',  -- Introduction to AI
    '58f49a6f-6729-4d86-8e24-0094cd3aefa2'   -- Cloud Computing
);

-- 4. Verify student enrollments are still intact
SELECT 
    'STUDENT ENROLLMENTS VERIFIED' as status,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    p.full_name as student_name,
    ic.title as course_title
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.course_id IN (
    'ca2860ab-81e8-4055-a3f2-139a32bead75',
    '58f49a6f-6729-4d86-8e24-0094cd3aefa2'
);

-- 5. Success message
SELECT 
    'SUCCESS' as status,
    'Courses have been reassigned to Institution Director' as message,
    'Student enrollments remain intact' as note;
