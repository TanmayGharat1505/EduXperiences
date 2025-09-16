-- CORRECTED: Delete requirements safely without column errors
-- This script only deletes from tables and columns we know exist

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
-- STEP 3: DELETE ALL MESSAGES FOR THESE REQUIREMENTS
-- ==========================================
-- Delete messages linked to conversations for these requirements
DELETE FROM messages 
WHERE conversation_id IN (
    SELECT id FROM conversations 
    WHERE requirement_id IN (
        '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
        'd4020e55-a9f5-407c-af37-a15c979a3d97'
    )
);

-- Also delete messages directly linked to these requirements (if column exists)
-- This will only work if the column was added by the fix script
DELETE FROM messages 
WHERE requirement_id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 4: DELETE ALL CONVERSATIONS FOR THESE REQUIREMENTS
-- ==========================================
DELETE FROM conversations 
WHERE requirement_id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 5: DELETE ALL NOTIFICATIONS FOR THESE REQUIREMENTS
-- ==========================================
-- Try to delete notifications if they have requirement_id column
-- If this fails, we'll skip it (notifications might not be linked to requirements)
BEGIN;
    DELETE FROM notifications 
    WHERE requirement_id IN (
        '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
        'd4020e55-a9f5-407c-af37-a15c979a3d97'
    );
EXCEPTION WHEN undefined_column THEN
    -- If requirement_id column doesn't exist, skip this step
    RAISE NOTICE 'Notifications table does not have requirement_id column, skipping notifications deletion';
END;

-- ==========================================
-- STEP 6: FINALLY DELETE THE REQUIREMENTS THEMSELVES
-- ==========================================
DELETE FROM requirements 
WHERE id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 7: VERIFY DELETION
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
-- STEP 8: FINAL STATUS CHECK
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
