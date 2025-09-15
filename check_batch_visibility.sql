-- Check Batch Visibility Issue
-- This script will help identify why batches are not visible

-- 1. Check all institution batches
SELECT 
    'All Institution Batches' as info,
    id,
    batch_name,
    institution_id,
    course_id,
    created_at,
    status
FROM institution_batches 
ORDER BY created_at DESC;

-- 2. Check the specific batch you mentioned
SELECT 
    'Specific Batch Check' as info,
    id,
    batch_name,
    institution_id,
    course_id,
    created_at,
    status
FROM institution_batches 
WHERE id = '415f8fcf-7230-4533-82ec-81227a553220';

-- 3. Check if the batch belongs to the correct institution
SELECT 
    'Batch Institution Check' as info,
    ib.id,
    ib.batch_name,
    ib.institution_id,
    ib.course_id,
    u.email as institution_email,
    p.full_name as institution_name
FROM institution_batches ib
LEFT JOIN auth.users u ON ib.institution_id = u.id
LEFT JOIN profiles p ON ib.institution_id = p.user_id
WHERE ib.id = '415f8fcf-7230-4533-82ec-81227a553220';

-- 4. Check all batches for the institution user
SELECT 
    'Institution Batches' as info,
    ib.id,
    ib.batch_name,
    ib.institution_id,
    ib.course_id,
    ib.created_at
FROM institution_batches ib
WHERE ib.institution_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
ORDER BY ib.created_at DESC;

-- 5. Check if there are any RLS policies blocking batch access
SELECT 
    'Batch RLS Policies' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_batches';
