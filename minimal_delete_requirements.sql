-- MINIMAL: DELETE ONLY WHAT WE KNOW EXISTS
-- This script avoids column errors by only deleting confirmed data

-- ==========================================
-- STEP 1: IDENTIFY THE REQUIREMENTS TO DELETE
-- ==========================================
SELECT 
    'REQUIREMENTS_TO_DELETE' as step,
    id,
    subject,
    status,
    student_id,
    created_at
FROM requirements 
WHERE id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',  -- Physics (already deleted)
    'd4020e55-a9f5-407c-af37-a15c979a3d97'   -- Mathematics (active)
);

-- ==========================================
-- STEP 2: DELETE ALL TUTOR MATCHES FOR THESE REQUIREMENTS
-- ==========================================
-- This should work since we know this table exists
DELETE FROM requirement_tutor_matches 
WHERE requirement_id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 3: FINALLY DELETE THE REQUIREMENTS THEMSELVES
-- ==========================================
DELETE FROM requirements 
WHERE id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 4: VERIFY DELETION
-- ==========================================
SELECT 
    'VERIFICATION' as step,
    'Requirements deleted successfully' as status,
    COUNT(*) as remaining_requirements
FROM requirements 
WHERE id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 5: FINAL STATUS CHECK
-- ==========================================
SELECT 
    'FINAL_STATUS' as step,
    'Total active requirements' as metric,
    COUNT(*) as value
FROM requirements 
WHERE status = 'active'

UNION ALL

SELECT 
    'FINAL_STATUS' as step,
    'Total requirements in database' as metric,
    COUNT(*) as value
FROM requirements;
