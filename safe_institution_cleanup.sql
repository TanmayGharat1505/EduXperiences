-- =====================================================
-- SAFE INSTITUTION CLEANUP SCRIPT FOR SUPABASE
-- =====================================================
-- This script provides a safer, staged approach to cleanup
-- Run each section separately and verify before proceeding
-- =====================================================

-- =====================================================
-- SECTION 1: IDENTIFY EXISTING INSTITUTION TABLES
-- =====================================================
-- Run this first to see what actually exists in your database

SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename ILIKE '%institution%'
ORDER BY tablename;

-- =====================================================
-- SECTION 2: IDENTIFY INSTITUTION FUNCTIONS
-- =====================================================
-- Check what functions exist before dropping

SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname ILIKE '%institution%'
ORDER BY p.proname;

-- =====================================================
-- SECTION 3: IDENTIFY INSTITUTION VIEWS
-- =====================================================
-- Check what views exist

SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname ILIKE '%institution%'
ORDER BY viewname;

-- =====================================================
-- SECTION 4: IDENTIFY INSTITUTION TRIGGERS
-- =====================================================
-- Check what triggers exist

SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname ILIKE '%institution%'
ORDER BY c.relname, t.tgname;

-- =====================================================
-- SECTION 5: IDENTIFY INSTITUTION SEQUENCES
-- =====================================================
-- Check what sequences exist

SELECT 
    schemaname,
    sequencename,
    sequenceowner
FROM pg_sequences 
WHERE schemaname = 'public' 
AND sequencename ILIKE '%institution%'
ORDER BY sequencename;

-- =====================================================
-- SECTION 6: SAFE DROP - ONLY KNOWN TABLES
-- =====================================================
-- Uncomment and run this section after reviewing what exists above

/*
-- Start transaction for safe rollback
BEGIN;

-- Drop only the tables that actually exist (based on your findings)
-- Modify this list based on what you found in SECTION 1

-- Example drops (uncomment and modify as needed):
-- DROP TABLE IF EXISTS institution_profiles CASCADE;
-- DROP TABLE IF EXISTS institution_users CASCADE;
-- DROP TABLE IF EXISTS institution_courses CASCADE;
-- DROP TABLE IF EXISTS institution_enrollments CASCADE;

-- Add your specific table names here based on SECTION 1 results

COMMIT;
*/

-- =====================================================
-- SECTION 7: VERIFICATION AFTER CLEANUP
-- =====================================================
-- Run this after cleanup to verify everything is gone

-- Check remaining institution tables
SELECT COUNT(*) as remaining_institution_tables
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename ILIKE '%institution%';

-- Check remaining institution functions
SELECT COUNT(*) as remaining_institution_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname ILIKE '%institution%';

-- Check remaining institution views
SELECT COUNT(*) as remaining_institution_views
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname ILIKE '%institution%';

-- =====================================================
-- SECTION 8: MANUAL CLEANUP COMMANDS
-- =====================================================
-- Use these commands in Supabase SQL Editor for specific cleanup

-- To drop a specific table:
-- DROP TABLE IF EXISTS your_table_name CASCADE;

-- To drop a specific function:
-- DROP FUNCTION IF EXISTS your_function_name() CASCADE;

-- To drop a specific view:
-- DROP VIEW IF EXISTS your_view_name CASCADE;

-- To drop a specific sequence:
-- DROP SEQUENCE IF EXISTS your_sequence_name CASCADE;

-- =====================================================
-- USAGE INSTRUCTIONS:
-- =====================================================
-- 1. Run SECTION 1-5 to see what exists
-- 2. Review the results carefully
-- 3. Modify SECTION 6 with your specific table names
-- 4. Run SECTION 6 to perform the actual cleanup
-- 5. Run SECTION 7 to verify cleanup is complete
-- 6. Use SECTION 8 commands for any remaining items
-- =====================================================
