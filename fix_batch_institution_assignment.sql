-- Fix Batch Institution Assignment
-- This script moves the batch from the student account to the institution account

-- 1. Check current batch assignment
SELECT 
    'Current Batch Assignment' as info,
    id,
    batch_name,
    institution_id,
    course_id,
    created_at
FROM institution_batches 
WHERE id = '415f8fcf-7230-4533-82ec-81227a553220';

-- 2. Update the batch to assign it to the correct institution
UPDATE institution_batches 
SET institution_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
WHERE id = '415f8fcf-7230-4533-82ec-81227a553220';

-- 3. Verify the update
SELECT 
    'Updated Batch Assignment' as info,
    id,
    batch_name,
    institution_id,
    course_id,
    updated_at
FROM institution_batches 
WHERE id = '415f8fcf-7230-4533-82ec-81227a553220';

-- 4. Check all batches for the correct institution
SELECT 
    'All Institution Batches' as info,
    id,
    batch_name,
    institution_id,
    course_id,
    created_at
FROM institution_batches 
WHERE institution_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
ORDER BY created_at DESC;

-- 5. Check if there are any other batches assigned to the wrong account
SELECT 
    'Wrongly Assigned Batches' as info,
    id,
    batch_name,
    institution_id,
    course_id,
    created_at
FROM institution_batches 
WHERE institution_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';
