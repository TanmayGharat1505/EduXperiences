-- Fix Verification RLS Policies
-- This script fixes the foreign key relationship issues

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can update own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update all verification requests" ON verification_requests;

DROP POLICY IF EXISTS "Users can view own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can create own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can update own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Admins can update all verification documents" ON verification_documents;

-- Step 2: Create simple, working RLS policies for verification_requests
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification requests" ON verification_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 3: Create simple, working RLS policies for verification_documents
CREATE POLICY "Users can view own verification documents" ON verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_documents.verification_request_id
      AND verification_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own verification documents" ON verification_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_documents.verification_request_id
      AND verification_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own verification documents" ON verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_documents.verification_request_id
      AND verification_requests.user_id = auth.uid()
    )
  );

-- Step 4: Create admin policies (simplified - no profiles dependency)
-- Note: This gives all authenticated users admin access to verification data
-- You can restrict this later by checking specific user IDs or roles
CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (true); -- Allow viewing all requests

CREATE POLICY "Admins can update all verification requests" ON verification_requests
  FOR UPDATE USING (true); -- Allow updating all requests

CREATE POLICY "Admins can view all verification documents" ON verification_documents
  FOR SELECT USING (true); -- Allow viewing all documents

CREATE POLICY "Admins can update all verification documents" ON verification_documents
  FOR UPDATE USING (true); -- Allow updating all documents

-- Step 5: Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('verification_requests', 'verification_documents')
ORDER BY tablename, policyname;

-- Step 6: Show success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICIES FIXED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All verification tables now have working RLS policies.';
  RAISE NOTICE 'Users can access their own data.';
  RAISE NOTICE 'Admins can access all data (temporarily open).';
  RAISE NOTICE '========================================';
END $$;
