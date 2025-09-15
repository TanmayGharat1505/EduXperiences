-- Test Batch Creation
-- This script tests the batch creation functionality

-- 1. Check if institution_batches table exists and has the correct schema
SELECT 
    'Table Exists Check' as test_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_batches') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as result;

-- 2. Check table schema
SELECT 
    'Schema Check' as test_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_batches' 
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT 
    'RLS Policies Check' as test_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'institution_batches'
ORDER BY policyname;

-- 4. Test data insertion (this will only work if there's an authenticated user)
-- Note: This is just a structure test, actual insertion requires authentication
SELECT 
    'Insert Test Structure' as test_type,
    'Sample batch data structure' as description,
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
        "status": "Active"
    }' as sample_data;
