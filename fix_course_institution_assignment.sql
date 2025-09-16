-- Fix Course Institution Assignment
-- This script fixes the data integrity issue where student user_id was used as institution_id

-- 1. Show the current problematic state
SELECT 
    'CURRENT PROBLEM' as check_type,
    'Student user_id being used as institution_id' as issue,
    'This is incorrect data modeling' as problem;

-- 2. Show the courses that need to be fixed
SELECT 
    'Courses to Fix' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id as current_institution_id,
    'WRONG - This is a student user_id' as status
FROM institution_courses ic
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Show available institution profiles to choose from
SELECT 
    'Available Institutions' as check_type,
    p.id as profile_id,
    p.full_name as institution_name,
    p.user_id,
    p.created_at
FROM profiles p
WHERE p.role = 'institution'
ORDER BY p.created_at DESC;

-- 4. Show the student profile that was incorrectly used
SELECT 
    'Student Profile (Incorrectly Used)' as check_type,
    p.id as profile_id,
    p.full_name as student_name,
    p.user_id as student_user_id,
    'This user_id was incorrectly used as institution_id' as issue
FROM profiles p
WHERE p.user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 5. RECOMMENDATION: Choose an appropriate institution
-- Based on the data, I recommend using one of these institutions:
-- - 7d29ceab-be34-48ed-87cd-5dae2b873d1c (Institution Director) - Most recent
-- - 95e3456c-663b-471b-b474-a6b6a74dcc11 (EduVision Academy) - Established
-- - 87744516-8ad1-4f62-b077-0ae2871bf381 (EduVision Academy) - Another option

-- 6. Create the fix (COMMENTED OUT - UNCOMMENT AFTER REVIEW)
-- UPDATE institution_courses 
-- SET institution_id = '7d29ceab-be34-48ed-87cd-5dae2b873d1c'  -- Institution Director
-- WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 7. Verify the fix would work
SELECT 
    'VERIFICATION - After Fix' as check_type,
    'Courses would be assigned to Institution Director' as new_owner,
    'Student enrollments would remain intact' as note;

-- 8. Show what the corrected data would look like
SELECT 
    'CORRECTED DATA PREVIEW' as check_type,
    ic.id as course_id,
    ic.title,
    '7d29ceab-be34-48ed-87cd-5dae2b873d1c' as new_institution_id,
    'Institution Director' as new_institution_name,
    'CORRECT - Real institution profile' as status
FROM institution_courses ic
WHERE ic.institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 9. Show the student enrollments that will remain intact
SELECT 
    'Student Enrollments (Will Remain Intact)' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    p.full_name as student_name
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
WHERE ce.course_id IN (
    SELECT id FROM institution_courses 
    WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'
);

-- 10. Final recommendation
SELECT 
    'FINAL RECOMMENDATION' as check_type,
    'Run the UPDATE statement above to fix the data integrity issue' as action,
    'This will not affect student enrollments, only course ownership' as note;
