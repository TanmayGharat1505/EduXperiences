-- Test Storage Access - Run this to diagnose storage issues
-- This script helps identify what's wrong with storage access

-- Test 1: Check if we can access storage.buckets
SELECT 'Test 1: Can we access storage.buckets?' as test;
SELECT COUNT(*) as bucket_count FROM storage.buckets;

-- Test 2: Check if verification-documents bucket exists
SELECT 'Test 2: Does verification-documents bucket exist?' as test;
SELECT * FROM storage.buckets WHERE id = 'verification-documents';

-- Test 3: Try to create a simple test bucket
SELECT 'Test 3: Can we create a test bucket?' as test;
DO $$
BEGIN
  -- Try to create a test bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('test-bucket-' || extract(epoch from now())::text, 'test-bucket', true)
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Test bucket creation successful!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test bucket: %', SQLERRM;
    RAISE NOTICE 'This indicates a permissions issue with storage.buckets';
END $$;

-- Test 4: Check current user permissions
SELECT 'Test 4: Current user info' as test;
SELECT 
  auth.uid() as current_user_id,
  current_user as current_user_name,
  session_user as session_user_name;

-- Test 5: Check if we're authenticated
SELECT 'Test 5: Authentication status' as test;
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Authenticated'
    ELSE 'Not authenticated'
  END as auth_status;

-- Test 6: Check storage policies
SELECT 'Test 6: Storage policies' as test;
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
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Test 7: Check if we can insert into storage.objects (this will fail but show the error)
SELECT 'Test 7: Testing storage.objects insert permission' as test;
DO $$
BEGIN
  -- This will likely fail, but it will show us the exact error
  INSERT INTO storage.objects (bucket_id, name, owner)
  VALUES ('test-bucket', 'test-file.txt', auth.uid());
  
  RAISE NOTICE 'Storage.objects insert successful!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Storage.objects insert failed: %', SQLERRM;
    RAISE NOTICE 'This is expected if the bucket doesnt exist or RLS is blocking it';
END $$;

-- Test 8: Summary
SELECT 'Test 8: Summary' as test;
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STORAGE ACCESS DIAGNOSTIC COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Check the results above to identify the issue.';
  RAISE NOTICE 'Most likely causes:';
  RAISE NOTICE '1. Storage bucket doesnt exist';
  RAISE NOTICE '2. RLS policies are blocking access';
  RAISE NOTICE '3. User lacks storage permissions';
  RAISE NOTICE '========================================';
END $$;
