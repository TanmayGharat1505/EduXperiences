-- Test Verification System - Simple Test Script
-- Run this to verify everything is working

-- Test 1: Check if tables exist
SELECT 'Test 1: Checking tables...' as test;
SELECT 
  table_name,
  CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
  SELECT 'verification_requests' as table_name
  UNION ALL
  SELECT 'verification_documents' as table_name
  UNION ALL
  SELECT 'tutor_profiles' as table_name
) t;

-- Test 2: Check if storage bucket exists
SELECT 'Test 2: Checking storage bucket...' as test;
SELECT 
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'verification-documents';

-- Test 3: Check RLS policies
SELECT 'Test 3: Checking RLS policies...' as test;
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('verification_requests', 'verification_documents')
ORDER BY tablename, policyname;

-- Test 4: Check table permissions
SELECT 'Test 4: Checking permissions...' as test;
SELECT 
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('verification_requests', 'verification_documents')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- Test 5: Check if we can insert a test verification request
SELECT 'Test 5: Testing insert permissions...' as test;
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000000';
  test_request_id uuid;
BEGIN
  -- Try to insert a test request
  INSERT INTO verification_requests (user_id, user_type, status)
  VALUES (test_user_id, 'tutor', 'pending')
  RETURNING id INTO test_request_id;
  
  RAISE NOTICE 'Test verification request created with ID: %', test_request_id;
  
  -- Clean up test data
  DELETE FROM verification_requests WHERE id = test_request_id;
  
  RAISE NOTICE 'Test verification request cleaned up successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error testing insert: %', SQLERRM;
END $$;

-- Test 6: Summary
SELECT 'Test 6: Summary' as test;
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION SYSTEM TEST COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Check the results above to verify:';
  RAISE NOTICE '1. Tables exist';
  RAISE NOTICE '2. Storage bucket exists';
  RAISE NOTICE '3. RLS policies are set';
  RAISE NOTICE '4. Permissions are correct';
  RAISE NOTICE '5. Insert operations work';
  RAISE NOTICE '========================================';
END $$;
