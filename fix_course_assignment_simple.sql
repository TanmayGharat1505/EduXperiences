-- SIMPLE FIX: Check and Fix Course Assignment
-- This script first checks what institution profiles exist, then fixes the courses

-- 1. Check what institution profiles are available
SELECT 
    'Available Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

-- 2. Check which ones have valid user records
SELECT 
    'Valid Institution Profiles' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id,
    'Valid' as status
FROM institution_profiles ip
WHERE ip.user_id IN (
    SELECT user_id FROM profiles WHERE role = 'institution'
)
ORDER BY ip.created_at DESC;

-- 3. Show the problematic courses
SELECT 
    'Problematic Courses' as check_type,
    id,
    title,
    institution_id,
    'Needs to be fixed' as status
FROM institution_courses 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. If we find a valid institution profile, we'll use it
-- For now, let's just show what we would do
SELECT 
    'NEXT STEP' as check_type,
    'Run the UPDATE statement below with the correct institution profile ID' as instruction,
    'Replace XXXX with the actual institution profile ID from step 2' as note;

-- 5. Example UPDATE (replace XXXX with actual ID from step 2)
-- UPDATE institution_courses 
-- SET institution_id = 'XXXX'  -- Replace with actual institution profile ID
-- WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';
