-- Manual Verification System Setup - Run Step by Step
-- This script helps troubleshoot and set up the verification system manually

-- STEP 1: Check if storage bucket exists
SELECT 'Checking storage bucket...' as status;
SELECT * FROM storage.buckets WHERE id = 'verification-documents';

-- STEP 2: Try to create storage bucket manually
-- If the above query returns no results, run this:
DO $$
BEGIN
  -- Check if bucket already exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'verification-documents'
  ) THEN
    -- Try to create the bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'verification-documents',
      'verification-documents',
      false, -- Private bucket for security
      10485760, -- 10MB file size limit
      ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    );
    
    RAISE NOTICE 'Storage bucket "verification-documents" created successfully!';
  ELSE
    RAISE NOTICE 'Storage bucket "verification-documents" already exists!';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating storage bucket: %', SQLERRM;
    RAISE NOTICE 'This might be a permissions issue. Check if you have storage.buckets INSERT permission.';
END $$;

-- STEP 3: Verify storage bucket was created
SELECT 'Verifying storage bucket...' as status;
SELECT * FROM storage.buckets WHERE id = 'verification-documents';

-- STEP 4: Create verification_requests table
SELECT 'Creating verification_requests table...' as status;
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('tutor', 'institute')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Create verification_documents table
SELECT 'Creating verification_documents table...' as status;
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'government_id', 'academic_certificate', 'teaching_certificate', 
    'registration_certificate', 'tax_id', 'location_proof'
  )),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_required BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- STEP 6: Enable RLS
SELECT 'Enabling Row Level Security...' as status;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create basic RLS policies (simplified)
SELECT 'Creating RLS policies...' as status;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can update own verification requests" ON verification_requests;

-- Create simple policies
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own verification documents" ON verification_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_documents.verification_request_id
      AND verification_requests.user_id = auth.uid()
    )
  );

-- STEP 8: Grant permissions
SELECT 'Granting permissions...' as status;
GRANT ALL ON verification_requests TO authenticated;
GRANT ALL ON verification_documents TO authenticated;

-- STEP 9: Add verified column to tutor_profiles
SELECT 'Adding verified column to tutor_profiles...' as status;
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tutor_profiles' 
    AND column_name = 'verified'
  ) THEN
    ALTER TABLE tutor_profiles ADD COLUMN verified BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added verified column to tutor_profiles table';
  ELSE
    RAISE NOTICE 'verified column already exists in tutor_profiles table';
  END IF;
END $$;

-- STEP 10: Final verification
SELECT 'Final verification...' as status;
SELECT 
  'verification_requests' as table_name,
  COUNT(*) as row_count
FROM verification_requests
UNION ALL
SELECT 
  'verification_documents' as table_name,
  COUNT(*) as row_count
FROM verification_documents
UNION ALL
SELECT 
  'storage_bucket' as table_name,
  COUNT(*) as row_count
FROM storage.buckets 
WHERE id = 'verification-documents';

-- STEP 11: Show success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MANUAL SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'If you see errors above, check the specific step.';
  RAISE NOTICE 'Most common issue: Storage bucket creation permissions.';
  RAISE NOTICE '========================================';
END $$;
