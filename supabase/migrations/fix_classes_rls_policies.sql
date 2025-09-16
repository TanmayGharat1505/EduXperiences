-- Migration: Fix RLS policies for classes table
-- This migration fixes the Row-Level Security policies to allow proper session booking

-- 1. Enable RLS on classes table if not already enabled
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Tutors can view own classes" ON classes;
DROP POLICY IF EXISTS "Students can view own classes" ON classes;
DROP POLICY IF EXISTS "Users can insert classes" ON classes;
DROP POLICY IF EXISTS "Users can update own classes" ON classes;
DROP POLICY IF EXISTS "Users can delete own classes" ON classes;

-- 3. Create comprehensive RLS policies for classes table

-- Policy: Students can view their own booked classes
CREATE POLICY "Students can view own classes" ON classes
    FOR SELECT USING (
        auth.uid() = student_id
    );

-- Policy: Tutors can view classes they're teaching
CREATE POLICY "Tutors can view own classes" ON classes
    FOR SELECT USING (
        auth.uid() = tutor_id
    );

-- Policy: Students can insert new class bookings
CREATE POLICY "Students can insert class bookings" ON classes
    FOR INSERT WITH CHECK (
        auth.uid() = student_id
    );

-- Policy: Users can update classes they're involved with
CREATE POLICY "Users can update own classes" ON classes
    FOR UPDATE USING (
        auth.uid() = student_id OR auth.uid() = tutor_id
    );

-- Policy: Users can delete classes they're involved with
CREATE POLICY "Users can delete own classes" ON classes
    FOR DELETE USING (
        auth.uid() = student_id OR auth.uid() = tutor_id
    );

-- 4. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON classes TO authenticated;

-- 5. Verify the policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'classes'
ORDER BY policyname;

-- 6. Test the policies by checking if they exist
DO $$
BEGIN
    -- Check if policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'classes' 
        AND policyname = 'Students can view own classes'
    ) THEN
        RAISE EXCEPTION 'Policy "Students can view own classes" not found';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'classes' 
        AND policyname = 'Students can insert class bookings'
    ) THEN
        RAISE EXCEPTION 'Policy "Students can insert class bookings" not found';
    END IF;
    
    RAISE NOTICE 'All RLS policies for classes table have been created successfully';
END $$;
