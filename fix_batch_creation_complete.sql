-- Complete Fix for Batch Creation
-- This migration fixes all issues with batch creation including price constraint

-- 1. Check current state
SELECT 
    'Current State' as check_type,
    'institution_batches table exists' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_batches') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- 2. Check current schema
SELECT 
    'Current Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_batches' 
ORDER BY ordinal_position;

-- 3. Fix price column constraint
-- Make price nullable and set default
ALTER TABLE institution_batches 
ALTER COLUMN price DROP NOT NULL;

ALTER TABLE institution_batches 
ALTER COLUMN price SET DEFAULT 0;

-- 4. Update any existing null prices
UPDATE institution_batches 
SET price = 0 
WHERE price IS NULL;

-- 5. Add missing columns if they don't exist
ALTER TABLE institution_batches 
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS class_timings TEXT,
ADD COLUMN IF NOT EXISTS days_of_week TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
ADD COLUMN IF NOT EXISTS assigned_faculty TEXT,
ADD COLUMN IF NOT EXISTS classroom_assignment TEXT,
ADD COLUMN IF NOT EXISTS fee_schedule JSONB DEFAULT '{}';

-- 6. Update institution_id for existing records
UPDATE institution_batches 
SET institution_id = (
    SELECT institution_courses.institution_id 
    FROM institution_courses 
    WHERE institution_courses.id = institution_batches.course_id
)
WHERE institution_id IS NULL;

-- 7. Make institution_id NOT NULL
ALTER TABLE institution_batches 
ALTER COLUMN institution_id SET NOT NULL;

-- 8. Update RLS policies
DROP POLICY IF EXISTS "Institutions can view own batches" ON institution_batches;
DROP POLICY IF EXISTS "Institutions can insert own batches" ON institution_batches;
DROP POLICY IF EXISTS "Institutions can update own batches" ON institution_batches;
DROP POLICY IF EXISTS "Institutions can delete own batches" ON institution_batches;
DROP POLICY IF EXISTS "Students can view active institution batches" ON institution_batches;

CREATE POLICY "Institutions can view own batches" ON institution_batches
    FOR SELECT USING (institution_id = auth.uid());

CREATE POLICY "Institutions can insert own batches" ON institution_batches
    FOR INSERT WITH CHECK (institution_id = auth.uid());

CREATE POLICY "Institutions can update own batches" ON institution_batches
    FOR UPDATE USING (institution_id = auth.uid());

CREATE POLICY "Institutions can delete own batches" ON institution_batches
    FOR DELETE USING (institution_id = auth.uid());

CREATE POLICY "Students can view active institution batches" ON institution_batches
    FOR SELECT USING (status IN ('Active', 'Upcoming', 'Ongoing'));

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_institution_batches_institution_id ON institution_batches(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_batches_class_timings ON institution_batches(class_timings);
CREATE INDEX IF NOT EXISTS idx_institution_batches_days_of_week ON institution_batches USING GIN(days_of_week);

-- 10. Verify final schema
SELECT 
    'Final Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_batches' 
ORDER BY ordinal_position;

-- 11. Test data structure
SELECT 
    'Test Data Structure' as check_type,
    'Sample batch creation data' as description,
    '{
        "batch_name": "Test Batch 2024-001",
        "course_id": "sample-course-id",
        "institution_id": "sample-institution-id",
        "start_date": "2024-01-15",
        "end_date": "2024-06-15", 
        "class_timings": "9:00 AM - 11:00 AM",
        "days_of_week": ["Monday", "Wednesday", "Friday"],
        "max_capacity": 30,
        "assigned_faculty": "Dr. John Smith",
        "classroom_assignment": "Room 101",
        "fee_schedule": {
            "type": "fixed",
            "amount": "5000",
            "currency": "USD",
            "installments": 1
        },
        "price": 5000,
        "status": "Active"
    }' as sample_data;
