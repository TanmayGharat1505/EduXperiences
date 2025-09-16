-- COMPLETE DATABASE STRUCTURE ANALYSIS
-- Run this script and provide the output so I can fix everything correctly

-- ==========================================
-- STEP 1: CHECK ALL TABLE STRUCTURES
-- ==========================================
-- Check if tables exist and their current structure
SELECT 
    'TABLE_EXISTENCE' as section,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles',
    'tutor_profiles', 
    'student_profiles',
    'requirements',
    'requirement_tutor_matches',
    'messages',
    'conversations',
    'notifications'
)
ORDER BY tablename;

-- ==========================================
-- STEP 2: DETAILED TABLE SCHEMAS
-- ==========================================
-- Get detailed column information for each table
SELECT 
    'TABLE_SCHEMA' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles',
    'tutor_profiles', 
    'student_profiles',
    'requirements',
    'requirement_tutor_matches',
    'messages',
    'conversations',
    'notifications'
)
ORDER BY table_name, ordinal_position;

-- ==========================================
-- STEP 3: CHECK CONSTRAINTS AND INDEXES
-- ==========================================
-- Get all constraints for the tables
SELECT 
    'CONSTRAINTS' as section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
AND tc.table_name IN (
    'profiles',
    'tutor_profiles', 
    'student_profiles',
    'requirements',
    'requirement_tutor_matches',
    'messages',
    'conversations',
    'notifications'
)
ORDER BY tc.table_name, tc.constraint_name;

-- ==========================================
-- STEP 4: CHECK RLS POLICIES
-- ==========================================
-- Get all RLS policies
SELECT 
    'RLS_POLICIES' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles',
    'tutor_profiles', 
    'student_profiles',
    'requirements',
    'requirement_tutor_matches',
    'messages',
    'conversations',
    'notifications'
)
ORDER BY tablename, policyname;

-- ==========================================
-- STEP 5: CHECK FUNCTIONS AND TRIGGERS
-- ==========================================
-- Get all functions
SELECT 
    'FUNCTIONS' as section,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'handle_requirement_tutor_match',
    'revoke_tutor_interest',
    'get_matching_tutors_for_requirement',
    'update_updated_at_column'
)
ORDER BY p.proname;

-- Get all triggers
SELECT 
    'TRIGGERS' as section,
    schemaname,
    tablename,
    triggername,
    tgtype,
    proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public'
AND c.relname IN (
    'profiles',
    'tutor_profiles', 
    'student_profiles',
    'requirements',
    'requirement_tutor_matches',
    'messages',
    'conversations',
    'notifications'
)
ORDER BY tablename, triggername;

-- ==========================================
-- STEP 6: CHECK VIEWS
-- ==========================================
-- Get all views
SELECT 
    'VIEWS' as section,
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN (
    'tutor_requirements_view',
    'conversations'
)
ORDER BY viewname;

-- ==========================================
-- STEP 7: SAMPLE DATA CHECK
-- ==========================================
-- Check sample data in each table
SELECT 
    'SAMPLE_DATA' as section,
    'profiles' as table_name,
    COUNT(*) as record_count,
    'user_id, full_name, role' as sample_columns
FROM profiles
UNION ALL
SELECT 
    'SAMPLE_DATA' as section,
    'tutor_profiles' as table_name,
    COUNT(*) as record_count,
    'user_id, subjects, hourly_rate_min' as sample_columns
FROM tutor_profiles
UNION ALL
SELECT 
    'SAMPLE_DATA' as section,
    'student_profiles' as table_name,
    COUNT(*) as record_count,
    'user_id, education_level, learning_mode' as sample_columns
FROM student_profiles
UNION ALL
SELECT 
    'SAMPLE_DATA' as section,
    'requirements' as table_name,
    COUNT(*) as record_count,
    'id, subject, status, student_id' as sample_columns
FROM requirements
UNION ALL
SELECT 
    'SAMPLE_DATA' as section,
    'requirement_tutor_matches' as table_name,
    COUNT(*) as record_count,
    'requirement_id, tutor_id, status' as sample_columns
FROM requirement_tutor_matches
UNION ALL
SELECT 
    'SAMPLE_DATA' as section,
    'messages' as table_name,
    COUNT(*) as record_count,
    'id, sender_id, receiver_id, content' as sample_columns
FROM messages
UNION ALL
SELECT 
    'SAMPLE_DATA' as section,
    'conversations' as table_name,
    COUNT(*) as record_count,
    'id, requirement_id, student_id, tutor_id' as sample_columns
FROM conversations
UNION ALL
SELECT 
    'SAMPLE_DATA' as section,
    'notifications' as table_name,
    COUNT(*) as record_count,
    'id, user_id, type, title' as sample_columns
FROM notifications;

-- ==========================================
-- STEP 8: CHECK CURRENT ERRORS
-- ==========================================
-- Check for any obvious data inconsistencies
SELECT 
    'DATA_CHECK' as section,
    'orphaned_matches' as check_type,
    COUNT(*) as count
FROM requirement_tutor_matches rtm
LEFT JOIN requirements r ON rtm.requirement_id = r.id
WHERE r.id IS NULL

UNION ALL

SELECT 
    'DATA_CHECK' as section,
    'orphaned_requirements' as check_type,
    COUNT(*) as count
FROM requirements r
LEFT JOIN profiles p ON r.student_id = p.user_id
WHERE p.user_id IS NULL

UNION ALL

SELECT 
    'DATA_CHECK' as section,
    'role_mismatches' as check_type,
    COUNT(*) as count
FROM profiles p
WHERE p.role = 'tutor' 
AND NOT EXISTS (SELECT 1 FROM tutor_profiles tp WHERE tp.user_id = p.user_id)
AND EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = p.user_id)

UNION ALL

SELECT 
    'DATA_CHECK' as section,
    'duplicate_matches' as check_type,
    COUNT(*) as count
FROM (
    SELECT requirement_id, tutor_id, COUNT(*)
    FROM requirement_tutor_matches
    GROUP BY requirement_id, tutor_id
    HAVING COUNT(*) > 1
) duplicates;

-- ==========================================
-- STEP 9: CHECK MIGRATION STATUS
-- ==========================================
-- Check which migrations have been applied
SELECT 
    'MIGRATION_STATUS' as section,
    'migration_check' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requirement_tutor_matches' AND column_name = 'revoked_at') 
        THEN 'revoke_interest_migration_applied'
        ELSE 'revoke_interest_migration_NOT_applied'
    END as revoke_migration,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'requirement_id') 
        THEN 'conversations_migration_applied'
        ELSE 'conversations_migration_NOT_applied'
    END as conversations_migration,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_requirement_tutor_match') 
        THEN 'upsert_function_exists'
        ELSE 'upsert_function_missing'
    END as upsert_function;
