-- Database Diagnostic Script
-- Run this to see what currently exists in your database

-- Check if institutions table exists and what columns it has
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'institutions') THEN
        RAISE NOTICE '✅ institutions table exists';
        
        -- Show all columns in institutions table
        RAISE NOTICE 'Columns in institutions table:';
        FOR col IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'institutions' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (nullable: %)', col.column_name, col.data_type, col.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ institutions table does NOT exist';
    END IF;
END $$;

-- Check if institution_facilities table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'institution_facilities') THEN
        RAISE NOTICE '✅ institution_facilities table exists';
    ELSE
        RAISE NOTICE '❌ institution_facilities table does NOT exist';
    END IF;
END $$;

-- Check if institution_photos table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'institution_photos') THEN
        RAISE NOTICE '✅ institution_photos table exists';
    ELSE
        RAISE NOTICE '❌ institution_photos table does NOT exist';
    END IF;
END $$;

-- Check storage buckets
DO $$
BEGIN
    IF EXISTS (SELECT FROM storage.buckets WHERE id = 'institution-photos') THEN
        RAISE NOTICE '✅ institution-photos storage bucket exists';
    ELSE
        RAISE NOTICE '❌ institution-photos storage bucket does NOT exist';
    END IF;
END $$;

-- Show all tables in public schema
SELECT 'All tables in public schema:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show all storage buckets
SELECT 'All storage buckets:' as info;
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
ORDER BY id;
