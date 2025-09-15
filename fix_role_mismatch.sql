-- FIX ROLE MISMATCH ISSUE
-- This will resolve the role confusion in messaging

-- ==========================================
-- STEP 1: IDENTIFY THE ROLE MISMATCH
-- ==========================================
-- Find the user with conflicting roles
SELECT 
    'ROLE_MISMATCH_DETAILS' as section,
    p.user_id,
    p.full_name,
    p.role as current_role,
    CASE 
        WHEN EXISTS (SELECT 1 FROM tutor_profiles tp WHERE tp.user_id = p.user_id) THEN 'HAS_TUTOR_PROFILE'
        ELSE 'NO_TUTOR_PROFILE'
    END as tutor_profile_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = p.user_id) THEN 'HAS_STUDENT_PROFILE'
        ELSE 'NO_STUDENT_PROFILE'
    END as student_profile_status
FROM profiles p
WHERE p.role = 'tutor' 
AND NOT EXISTS (SELECT 1 FROM tutor_profiles tp WHERE tp.user_id = p.user_id)
AND EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = p.user_id);

-- ==========================================
-- STEP 2: FIX THE ROLE MISMATCH
-- ==========================================
-- Update the role to match the actual profile
UPDATE profiles 
SET role = 'student'::app_role
WHERE user_id IN (
    SELECT p.user_id
    FROM profiles p
    WHERE p.role = 'tutor' 
    AND NOT EXISTS (SELECT 1 FROM tutor_profiles tp WHERE tp.user_id = p.user_id)
    AND EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = p.user_id)
);

-- ==========================================
-- STEP 3: VERIFY THE FIX
-- ==========================================
-- Check if role mismatch is resolved
SELECT 
    'ROLE_MISMATCH_CHECK' as section,
    'role_mismatches' as check_type,
    COUNT(*) as count
FROM profiles p
WHERE p.role = 'tutor' 
AND NOT EXISTS (SELECT 1 FROM tutor_profiles tp WHERE tp.user_id = p.user_id)
AND EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = p.user_id);

-- ==========================================
-- STEP 4: FINAL ROLE VERIFICATION
-- ==========================================
-- Show the final role distribution
SELECT 
    'FINAL_ROLE_DISTRIBUTION' as section,
    role,
    COUNT(*) as user_count
FROM profiles 
GROUP BY role 
ORDER BY role;
