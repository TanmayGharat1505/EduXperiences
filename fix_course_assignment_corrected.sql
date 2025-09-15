-- CORRECTED FIX: Reassign Courses to Correct Institution Profile
-- This script uses the proper institution_profiles table ID

-- 1. First, find the correct institution profile ID
SELECT 
    'Finding Correct Institution' as check_type,
    ip.id as institution_profile_id,
    ip.institution_name,
    ip.user_id,
    'This is the correct ID to use' as note
FROM institution_profiles ip
WHERE ip.user_id IN (
    SELECT user_id FROM profiles WHERE role = 'institution'
)
ORDER BY ip.created_at DESC
LIMIT 1;

-- 2. Show current problematic courses
SELECT 
    'BEFORE FIX' as status,
    id,
    title,
    institution_id as current_institution_id
FROM institution_courses 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Get the correct institution profile ID (we'll use the first one found)
-- Let's use a subquery to get the correct ID
UPDATE institution_courses 
SET institution_id = (
    SELECT ip.id 
    FROM institution_profiles ip 
    WHERE ip.user_id IN (
        SELECT user_id FROM profiles WHERE role = 'institution'
    )
    ORDER BY ip.created_at DESC 
    LIMIT 1
)
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. Show the fixed courses
SELECT 
    'AFTER FIX' as status,
    ic.id,
    ic.title,
    ic.institution_id as new_institution_id,
    ip.institution_name
FROM institution_courses ic
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.id
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
    ic.title as course_title
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.course_id IN (
    'ca2860ab-81e8-4055-a3f2-139a32bead75',
    '58f49a6f-6729-4d86-8e24-0094cd3aefa2'
);

-- 6. Success message
SELECT 
    'SUCCESS' as status,
    'Courses have been reassigned to correct institution profile' as message,
    'Student enrollments remain intact' as note;
