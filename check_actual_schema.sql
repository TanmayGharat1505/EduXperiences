-- Check the actual structure of your tables
-- This will help us understand what columns exist

-- ==========================================
-- CHECK CONVERSATIONS TABLE STRUCTURE
-- ==========================================
SELECT 
    'CONVERSATIONS_SCHEMA' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- ==========================================
-- CHECK NOTIFICATIONS TABLE STRUCTURE
-- ==========================================
SELECT 
    'NOTIFICATIONS_SCHEMA' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- ==========================================
-- CHECK REQUIREMENT_TUTOR_MATCHES TABLE STRUCTURE
-- ==========================================
SELECT 
    'TUTOR_MATCHES_SCHEMA' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'requirement_tutor_matches'
ORDER BY ordinal_position;

-- ==========================================
-- CHECK SAMPLE DATA IN CONVERSATIONS
-- ==========================================
SELECT 
    'CONVERSATIONS_SAMPLE' as section,
    *
FROM conversations 
LIMIT 3;

-- ==========================================
-- CHECK SAMPLE DATA IN NOTIFICATIONS
-- ==========================================
SELECT 
    'NOTIFICATIONS_SAMPLE' as section,
    *
FROM notifications 
LIMIT 3;

-- ==========================================
-- CHECK SAMPLE DATA IN TUTOR MATCHES
-- ==========================================
SELECT 
    'TUTOR_MATCHES_SAMPLE' as section,
    *
FROM requirement_tutor_matches 
LIMIT 3;
