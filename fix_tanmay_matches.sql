-- FIX TANMAY'S INCORRECT TUTOR MATCHES
-- Tanmay is now correctly a student, but requirement_tutor_matches still has him as a tutor

-- ==========================================
-- STEP 1: IDENTIFY TANMAY'S USER ID
-- ==========================================
SELECT 
    'TANMAY_ID' as section,
    p.user_id,
    p.full_name,
    p.role as current_role
FROM profiles p
WHERE p.full_name = 'Tanmay P Gharat';

-- ==========================================
-- STEP 2: SHOW INCORRECT MATCHES
-- ==========================================
-- Show where Tanmay is incorrectly listed as a tutor
SELECT 
    'INCORRECT_MATCHES' as section,
    rtm.id,
    rtm.requirement_id,
    rtm.tutor_id,
    r.subject,
    p.full_name as tutor_name,
    p.role as tutor_role,
    rtm.status,
    rtm.created_at
FROM requirement_tutor_matches rtm
JOIN requirements r ON rtm.requirement_id = r.id
JOIN profiles p ON rtm.tutor_id = p.user_id
WHERE p.full_name = 'Tanmay P Gharat'
AND p.role = 'student';

-- ==========================================
-- STEP 3: DELETE INCORRECT MATCHES
-- ==========================================
-- Remove all matches where Tanmay is incorrectly listed as a tutor
DELETE FROM requirement_tutor_matches 
WHERE tutor_id IN (
    SELECT p.user_id
    FROM profiles p
    WHERE p.full_name = 'Tanmay P Gharat'
    AND p.role = 'student'
);

-- ==========================================
-- STEP 4: VERIFY CLEANUP
-- ==========================================
-- Check if any incorrect matches remain
SELECT 
    'REMAINING_INCORRECT_MATCHES' as section,
    COUNT(*) as count
FROM requirement_tutor_matches rtm
JOIN profiles p ON rtm.tutor_id = p.user_id
WHERE p.full_name = 'Tanmay P Gharat'
AND p.role = 'student';

-- ==========================================
-- STEP 5: SHOW CLEAN MATCHES
-- ==========================================
-- Show the remaining correct matches
SELECT 
    'CLEAN_MATCHES' as section,
    rtm.id,
    rtm.requirement_id,
    rtm.tutor_id,
    r.subject,
    p.full_name as tutor_name,
    p.role as tutor_role,
    rtm.status
FROM requirement_tutor_matches rtm
JOIN requirements r ON rtm.requirement_id = r.id
JOIN profiles p ON rtm.tutor_id = p.user_id
ORDER BY rtm.created_at DESC
LIMIT 10;
