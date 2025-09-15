-- =====================================================
-- INSTITUTION OBJECTS DIAGNOSTIC SCRIPT FOR SUPABASE
-- =====================================================
-- Run this script first to gather information about what exists
-- Copy the results and send them to me to create a precise cleanup script
-- =====================================================

-- =====================================================
-- SECTION 1: INSTITUTION TABLES
-- =====================================================
-- Copy the results of this query

SELECT 
    'TABLE' as object_type,
    schemaname,
    tablename,
    tableowner,
    tablespace,
    'DROP TABLE IF EXISTS ' || quote_ident(tablename) || ' CASCADE;' as drop_command
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename ILIKE '%institution%'
ORDER BY tablename;

-- =====================================================
-- SECTION 2: INSTITUTION VIEWS
-- =====================================================
-- Copy the results of this query

SELECT 
    'VIEW' as object_type,
    schemaname,
    viewname as object_name,
    viewowner as owner,
    NULL as tablespace,
    'DROP VIEW IF EXISTS ' || quote_ident(viewname) || ' CASCADE;' as drop_command
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname ILIKE '%institution%'
ORDER BY viewname;

-- =====================================================
-- SECTION 3: INSTITUTION FUNCTIONS
-- =====================================================
-- Copy the results of this query

SELECT 
    'FUNCTION' as object_type,
    'public' as schemaname,
    p.proname as object_name,
    p.proowner::regrole::text as owner,
    NULL as tablespace,
    'DROP FUNCTION IF EXISTS ' || quote_ident(p.proname) || '(' || 
    CASE 
        WHEN p.proargtypes = '' THEN ''
        ELSE pg_get_function_arguments(p.oid)
    END || ') CASCADE;' as drop_command
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname ILIKE '%institution%'
ORDER BY p.proname;

-- =====================================================
-- SECTION 4: INSTITUTION TRIGGERS
-- =====================================================
-- Copy the results of this query

SELECT 
    'TRIGGER' as object_type,
    'public' as schemaname,
    t.tgname as object_name,
    c.relowner::regrole::text as owner,
    NULL as tablespace,
    'DROP TRIGGER IF EXISTS ' || quote_ident(t.tgname) || ' ON ' || 
    quote_ident(c.relname) || ' CASCADE;' as drop_command
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname ILIKE '%institution%'
ORDER BY c.relname, t.tgname;

-- =====================================================
-- SECTION 5: INSTITUTION SEQUENCES
-- =====================================================
-- Copy the results of this query

SELECT 
    'SEQUENCE' as object_type,
    schemaname,
    sequencename as object_name,
    sequenceowner as owner,
    NULL as tablespace,
    'DROP SEQUENCE IF EXISTS ' || quote_ident(sequencename) || ' CASCADE;' as drop_command
FROM pg_sequences 
WHERE schemaname = 'public' 
AND sequencename ILIKE '%institution%'
ORDER BY sequencename;

-- =====================================================
-- SECTION 6: INSTITUTION INDEXES
-- =====================================================
-- Copy the results of this query

SELECT 
    'INDEX' as object_type,
    'public' as schemaname,
    i.indexname as object_name,
    c.relowner::regrole::text as owner,
    NULL as tablespace,
    'DROP INDEX IF EXISTS ' || quote_ident(i.indexname) || ';' as drop_command
FROM pg_indexes i
JOIN pg_class c ON i.tablename = c.relname
WHERE i.schemaname = 'public' 
AND (i.indexname ILIKE '%institution%' OR i.tablename ILIKE '%institution%')
ORDER BY i.indexname;

-- =====================================================
-- SECTION 7: INSTITUTION POLICIES (RLS)
-- =====================================================
-- Copy the results of this query

SELECT 
    'POLICY' as object_type,
    'public' as schemaname,
    pol.polname as object_name,
    c.relowner::regrole::text as owner,
    NULL as tablespace,
    'DROP POLICY IF EXISTS ' || quote_ident(pol.polname) || ' ON ' || 
    quote_ident(c.relname) || ';' as drop_command
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
WHERE c.relname ILIKE '%institution%'
ORDER BY c.relname, pol.polname;

-- =====================================================
-- SECTION 8: INSTITUTION TYPES
-- =====================================================
-- Copy the results of this query

SELECT 
    'TYPE' as object_type,
    'public' as schemaname,
    t.typname as object_name,
    t.typowner::regrole::text as owner,
    NULL as tablespace,
    'DROP TYPE IF EXISTS ' || quote_ident(t.typname) || ' CASCADE;' as drop_command
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
AND t.typname ILIKE '%institution%'
ORDER BY t.typname;

-- =====================================================
-- SECTION 9: INSTITUTION SCHEMAS (if any)
-- =====================================================
-- Copy the results of this query

SELECT 
    'SCHEMA' as object_type,
    nspname as schemaname,
    nspname as object_name,
    nspowner::regrole::text as owner,
    NULL as tablespace,
    'DROP SCHEMA IF EXISTS ' || quote_ident(nspname) || ' CASCADE;' as drop_command
FROM pg_namespace
WHERE nspname ILIKE '%institution%'
AND nspname != 'public'
ORDER BY nspname;

-- =====================================================
-- SECTION 10: SUMMARY COUNT
-- =====================================================
-- Copy the results of this query

SELECT 
    'SUMMARY' as object_type,
    'COUNTS' as schemaname,
    'Total Objects Found' as object_name,
    COUNT(*) as total_count,
    NULL as tablespace,
    'Review all results above' as drop_command
FROM (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename ILIKE '%institution%'
    UNION ALL
    SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname ILIKE '%institution%'
    UNION ALL
    SELECT proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname ILIKE '%institution%'
    UNION ALL
    SELECT tgname FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE c.relname ILIKE '%institution%'
    UNION ALL
    SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequencename ILIKE '%institution%'
    UNION ALL
    SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND (indexname ILIKE '%institution%' OR tablename ILIKE '%institution%')
    UNION ALL
    SELECT polname FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid WHERE c.relname ILIKE '%institution%'
    UNION ALL
    SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typname ILIKE '%institution%'
    UNION ALL
    SELECT nspname FROM pg_namespace WHERE nspname ILIKE '%institution%' AND nspname != 'public'
) all_objects;

-- =====================================================
-- SECTION 11: DEPENDENCY CHECK
-- =====================================================
-- Copy the results of this query

SELECT 
    'DEPENDENCY' as object_type,
    'CHECK' as schemaname,
    'Foreign Key References' as object_name,
    COUNT(*) as dependency_count,
    NULL as tablespace,
    'These tables reference institution tables' as drop_command
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name ILIKE '%institution%';

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Run this entire script in your Supabase SQL Editor
-- 2. Copy ALL the results from each section
-- 3. Send the results to me
-- 4. I will create a precise cleanup script based on what actually exists
-- =====================================================
