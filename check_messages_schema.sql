-- Check the actual structure of the messages table
-- This will help us understand how to properly delete messages

-- ==========================================
-- CHECK MESSAGES TABLE STRUCTURE
-- ==========================================
SELECT 
    'MESSAGES_SCHEMA' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

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
-- CHECK SAMPLE DATA IN MESSAGES
-- ==========================================
SELECT 
    'MESSAGES_SAMPLE' as section,
    *
FROM messages 
LIMIT 5;

-- ==========================================
-- CHECK SAMPLE DATA IN CONVERSATIONS
-- ==========================================
SELECT 
    'CONVERSATIONS_SAMPLE' as section,
    *
FROM conversations 
LIMIT 5;

-- ==========================================
-- CHECK HOW MESSAGES RELATE TO REQUIREMENTS
-- ==========================================
SELECT 
    'RELATIONSHIP_CHECK' as section,
    'Messages count' as metric,
    COUNT(*) as value
FROM messages

UNION ALL

SELECT 
    'RELATIONSHIP_CHECK' as section,
    'Conversations count' as metric,
    COUNT(*) as value
FROM conversations

UNION ALL

SELECT 
    'RELATIONSHIP_CHECK' as section,
    'Messages with conversation_id' as metric,
    COUNT(*) as value
FROM messages 
WHERE conversation_id IS NOT NULL

UNION ALL

SELECT 
    'RELATIONSHIP_CHECK' as section,
    'Messages without conversation_id' as metric,
    COUNT(*) as value
FROM messages 
WHERE conversation_id IS NULL;
