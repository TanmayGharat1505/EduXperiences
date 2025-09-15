-- FINAL: PERMANENTLY DELETE SPECIFIC REQUIREMENTS AND ALL RELATED DATA
-- This script works with your actual messages table structure

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
DELETE FROM requirement_tutor_matches 
WHERE requirement_id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 3: DELETE MESSAGES RELATED TO THESE REQUIREMENTS
-- ==========================================
-- Your messages table uses topic and payload to identify requirements
-- Delete messages where the topic or payload contains the requirement IDs

-- First, let's see what messages exist for these requirements
SELECT 
    'MESSAGES_CHECK' as step,
    'Messages for requirements' as check_type,
    COUNT(*) as count
FROM messages 
WHERE topic IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
)
OR payload::text LIKE '%39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9%'
OR payload::text LIKE '%d4020e55-a9f5-407c-af37-a15c979a3d97%';

-- Delete messages where topic matches the requirement IDs
DELETE FROM messages 
WHERE topic IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- Delete messages where payload contains the requirement IDs
DELETE FROM messages 
WHERE payload::text LIKE '%39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9%'
   OR payload::text LIKE '%d4020e55-a9f5-407c-af37-a15c979a3d97%';

-- ==========================================
-- STEP 4: DELETE CONVERSATIONS FOR THESE REQUIREMENTS
-- ==========================================
DELETE FROM conversations 
WHERE requirement_id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

-- ==========================================
-- STEP 5: DELETE ALL NOTIFICATIONS FOR THESE REQUIREMENTS
-- ==========================================
DELETE FROM notifications 
WHERE requirement_id IN (
    '39bfbf7c-0d76-4bcd-8313-3cd13be0cbd9',
    'd4020e55-a9f5-407c-af37-a15c979a3d97'
);

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
-- STEP 8: CHECK FOR ANY ORPHANED DATA
-- ==========================================
SELECT 
    'ORPHANED_CHECK' as step,
    'Orphaned tutor matches' as data_type,
    COUNT(*) as count
FROM requirement_tutor_matches rtm
LEFT JOIN requirements r ON rtm.requirement_id = r.id
WHERE r.id IS NULL

UNION ALL

SELECT 
    'ORPHANED_CHECK' as step,
    'Orphaned conversations' as data_type,
    COUNT(*) as count
FROM conversations c
LEFT JOIN requirements r ON c.requirement_id = r.id
WHERE r.id IS NULL

UNION ALL

SELECT 
    'ORPHANED_CHECK' as step,
    'Orphaned notifications' as data_type,
    COUNT(*) as count
FROM notifications n
LEFT JOIN requirements r ON n.requirement_id = r.id
WHERE r.id IS NULL;

-- ==========================================
-- STEP 9: FINAL STATUS CHECK
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
