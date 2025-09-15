-- Update Institution Batches Schema to Match UI Form
-- This migration updates the institution_batches table to match the fields in the Create Batch form

-- 1. First, let's check the current schema
SELECT 
    'Current Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_batches' 
ORDER BY ordinal_position;

-- 2. Add missing columns to match the UI form
ALTER TABLE institution_batches 
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS class_timings TEXT,
ADD COLUMN IF NOT EXISTS days_of_week TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
ADD COLUMN IF NOT EXISTS assigned_faculty TEXT,
ADD COLUMN IF NOT EXISTS classroom_assignment TEXT,
ADD COLUMN IF NOT EXISTS fee_schedule JSONB DEFAULT '{}';

-- 2.1. Handle the price column constraint
-- Make price nullable since we have fee_schedule for detailed pricing
ALTER TABLE institution_batches 
ALTER COLUMN price DROP NOT NULL;

-- Set default value for price
ALTER TABLE institution_batches 
ALTER COLUMN price SET DEFAULT 0;

-- 3. Update existing columns to match UI expectations
-- Rename schedule to class_timings if it exists and is different
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_batches' AND column_name = 'schedule') THEN
        -- Copy data from schedule to class_timings if class_timings is empty
        UPDATE institution_batches 
        SET class_timings = schedule 
        WHERE class_timings IS NULL OR class_timings = '';
        
        -- Drop the old schedule column
        ALTER TABLE institution_batches DROP COLUMN IF EXISTS schedule;
    END IF;
END $$;

-- Rename max_students to max_capacity if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_batches' AND column_name = 'max_students') THEN
        -- Copy data from max_students to max_capacity if max_capacity is empty
        UPDATE institution_batches 
        SET max_capacity = max_students 
        WHERE max_capacity IS NULL;
        
        -- Drop the old max_students column
        ALTER TABLE institution_batches DROP COLUMN IF EXISTS max_students;
    END IF;
END $$;

-- Rename instructor to assigned_faculty if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_batches' AND column_name = 'instructor') THEN
        -- Copy data from instructor to assigned_faculty if assigned_faculty is empty
        UPDATE institution_batches 
        SET assigned_faculty = instructor 
        WHERE assigned_faculty IS NULL OR assigned_faculty = '';
        
        -- Drop the old instructor column
        ALTER TABLE institution_batches DROP COLUMN IF EXISTS instructor;
    END IF;
END $$;

-- Rename location to classroom_assignment if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_batches' AND column_name = 'location') THEN
        -- Copy data from location to classroom_assignment if classroom_assignment is empty
        UPDATE institution_batches 
        SET classroom_assignment = location 
        WHERE classroom_assignment IS NULL OR classroom_assignment = '';
        
        -- Drop the old location column
        ALTER TABLE institution_batches DROP COLUMN IF EXISTS location;
    END IF;
END $$;

-- 4. Update the status check constraint to match our UI
ALTER TABLE institution_batches 
DROP CONSTRAINT IF EXISTS institution_batches_status_check;

ALTER TABLE institution_batches 
ADD CONSTRAINT institution_batches_status_check 
CHECK (status IN ('Active', 'Inactive', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'));

-- 5. Set default status to 'Active' to match our UI
ALTER TABLE institution_batches 
ALTER COLUMN status SET DEFAULT 'Active';

-- 6. Make institution_id NOT NULL after adding it
UPDATE institution_batches 
SET institution_id = (
    SELECT institution_courses.institution_id 
    FROM institution_courses 
    WHERE institution_courses.id = institution_batches.course_id
)
WHERE institution_id IS NULL;

ALTER TABLE institution_batches 
ALTER COLUMN institution_id SET NOT NULL;

-- 7. Update RLS policies to include institution_id
-- Drop all existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Institutions can view own batches" ON institution_batches;
DROP POLICY IF EXISTS "Institutions can insert own batches" ON institution_batches;
DROP POLICY IF EXISTS "Institutions can update own batches" ON institution_batches;
DROP POLICY IF EXISTS "Institutions can delete own batches" ON institution_batches;
DROP POLICY IF EXISTS "Students can view active institution batches" ON institution_batches;

-- Create updated RLS policies
CREATE POLICY "Institutions can view own batches" ON institution_batches
    FOR SELECT USING (institution_id = auth.uid());

CREATE POLICY "Institutions can insert own batches" ON institution_batches
    FOR INSERT WITH CHECK (institution_id = auth.uid());

CREATE POLICY "Institutions can update own batches" ON institution_batches
    FOR UPDATE USING (institution_id = auth.uid());

CREATE POLICY "Institutions can delete own batches" ON institution_batches
    FOR DELETE USING (institution_id = auth.uid());

-- Students can view active batches
CREATE POLICY "Students can view active institution batches" ON institution_batches
    FOR SELECT USING (status IN ('Active', 'Upcoming', 'Ongoing'));

-- 8. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_institution_batches_institution_id ON institution_batches(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_batches_class_timings ON institution_batches(class_timings);
CREATE INDEX IF NOT EXISTS idx_institution_batches_days_of_week ON institution_batches USING GIN(days_of_week);

-- 9. Verify the updated schema
SELECT 
    'Updated Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_batches' 
ORDER BY ordinal_position;

-- 10. Show sample data structure
SELECT 
    'Sample Data Structure' as check_type,
    'Expected fields for UI form' as description,
    'batch_name, course_id, institution_id, start_date, end_date, class_timings, days_of_week, max_capacity, assigned_faculty, classroom_assignment, fee_schedule, status' as fields;
