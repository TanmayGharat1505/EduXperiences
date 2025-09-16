-- Test Verification Data - Insert Test Requests
-- This script adds test verification requests to verify the system is working

-- Step 1: Check current data
SELECT 'Current verification requests:' as info;
SELECT COUNT(*) as total_requests FROM verification_requests;
SELECT status, COUNT(*) as count FROM verification_requests GROUP BY status;

-- Step 2: Insert test verification requests
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
  test_request_id uuid;
BEGIN
  -- Insert test tutor verification request
  INSERT INTO verification_requests (user_id, user_type, status)
  VALUES (test_user_id, 'tutor', 'pending')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO test_request_id;
  
  IF test_request_id IS NOT NULL THEN
    RAISE NOTICE 'Test tutor verification request created with ID: %', test_request_id;
    
    -- Insert test documents
    INSERT INTO verification_documents (
      verification_request_id, 
      document_type, 
      document_name, 
      file_url, 
      file_size, 
      mime_type
    ) VALUES 
    (test_request_id, 'government_id', 'test_id.pdf', 'https://example.com/test.pdf', 1024000, 'application/pdf'),
    (test_request_id, 'academic_certificate', 'test_cert.pdf', 'https://example.com/cert.pdf', 2048000, 'application/pdf');
    
    RAISE NOTICE 'Test documents inserted for request: %', test_request_id;
  ELSE
    RAISE NOTICE 'Test request already exists or failed to create';
  END IF;
END $$;

-- Step 3: Insert another test request
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000002';
  test_request_id uuid;
BEGIN
  -- Insert test institute verification request
  INSERT INTO verification_requests (user_id, user_type, status)
  VALUES (test_user_id, 'institute', 'pending')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO test_request_id;
  
  IF test_request_id IS NOT NULL THEN
    RAISE NOTICE 'Test institute verification request created with ID: %', test_request_id;
    
    -- Insert test documents
    INSERT INTO verification_documents (
      verification_request_id, 
      document_type, 
      document_name, 
      file_url, 
      file_size, 
      mime_type
    ) VALUES 
    (test_request_id, 'registration_certificate', 'test_reg.pdf', 'https://example.com/reg.pdf', 1536000, 'application/pdf'),
    (test_request_id, 'tax_id', 'test_tax.pdf', 'https://example.com/tax.pdf', 512000, 'application/pdf');
    
    RAISE NOTICE 'Test documents inserted for request: %', test_request_id;
  ELSE
    RAISE NOTICE 'Test request already exists or failed to create';
  END IF;
END $$;

-- Step 4: Verify the test data
SELECT 'After inserting test data:' as info;
SELECT COUNT(*) as total_requests FROM verification_requests;
SELECT status, COUNT(*) as count FROM verification_requests GROUP BY status;

SELECT 'Test verification requests:' as info;
SELECT 
  id,
  user_id,
  user_type,
  status,
  created_at
FROM verification_requests 
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
)
ORDER BY created_at;

SELECT 'Test documents:' as info;
SELECT 
  vd.id,
  vd.verification_request_id,
  vd.document_type,
  vd.document_name
FROM verification_documents vd
JOIN verification_requests vr ON vd.verification_request_id = vr.id
WHERE vr.user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
)
ORDER BY vd.uploaded_at;
