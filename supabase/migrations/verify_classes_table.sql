-- Migration: Verify classes table structure
-- This migration checks if the classes table exists and has the correct structure

-- 1. Check if classes table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'classes'
    ) THEN
        RAISE EXCEPTION 'Classes table does not exist. Please run the enhance_classes_table_for_bookings migration first.';
    END IF;
    
    RAISE NOTICE 'Classes table exists';
END $$;

-- 2. Check required columns exist
DO $$
BEGIN
    -- Check for required columns
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'classes' 
        AND column_name = 'id'
    ) THEN
        RAISE EXCEPTION 'Required column "id" missing from classes table';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'classes' 
        AND column_name = 'student_id'
    ) THEN
        RAISE EXCEPTION 'Required column "student_id" missing from classes table';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'classes' 
        AND column_name = 'tutor_id'
    ) THEN
        RAISE EXCEPTION 'Required column "tutor_id" missing from classes table';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'classes' 
        AND column_name = 'start_time'
    ) THEN
        RAISE EXCEPTION 'Required column "start_time" missing from classes table';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'classes' 
        AND column_name = 'end_time'
    ) THEN
        RAISE EXCEPTION 'Required column "end_time" missing from classes table';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'classes' 
        AND column_name = 'status'
    ) THEN
        RAISE EXCEPTION 'Required column "status" missing from classes table';
    END IF;
    
    RAISE NOTICE 'All required columns exist in classes table';
END $$;

-- 3. Show current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'classes'
ORDER BY ordinal_position;

-- 4. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'classes';

-- 5. Check existing policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'classes'
ORDER BY policyname;

-- 6. Check if table has any data
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_sessions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_sessions
FROM classes;
