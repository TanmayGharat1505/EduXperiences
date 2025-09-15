-- Fix Batch Price Constraint Issue
-- This migration handles the price column constraint in institution_batches

-- 1. Check current schema
SELECT 
    'Current Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_batches' 
ORDER BY ordinal_position;

-- 2. Check constraints
SELECT 
    'Constraints' as check_type,
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'institution_batches';

-- 3. Make price column nullable or set a default value
-- Option 1: Make price nullable (recommended since we have fee_schedule)
ALTER TABLE institution_batches 
ALTER COLUMN price DROP NOT NULL;

-- Option 2: Set a default value (alternative approach)
-- ALTER TABLE institution_batches 
-- ALTER COLUMN price SET DEFAULT 0;

-- 4. Update existing records that might have null price
UPDATE institution_batches 
SET price = 0 
WHERE price IS NULL;

-- 5. Verify the change
SELECT 
    'Updated Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_batches' 
AND column_name = 'price';
