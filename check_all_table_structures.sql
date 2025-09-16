-- Check the actual structure of all tables
-- This will help us understand what columns exist

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
-- CHECK REQUIREMENTS TABLE STRUCTURE
-- ==========================================
SELECT 
    'REQUIREMENTS_SCHEMA' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'requirements'
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
-- CHECK SAMPLE DATA IN NOTIFICATIONS
-- ==========================================
SELECT 
    'NOTIFICATIONS_SAMPLE' as section,
    *
FROM notifications 
LIMIT 3;

-- ==========================================
-- CHECK SAMPLE DATA IN REQUIREMENTS
-- ==========================================
SELECT 
    'REQUIREMENTS_SAMPLE' as section,
    id,
    subject,
    status,
    student_id,
    created_at
FROM requirements 
LIMIT 3;
