-- Complete Verification System Setup
-- This script sets up the entire verification system in the correct order

-- Step 1: Create the verification-documents storage bucket FIRST
-- This must be done before creating RLS policies that reference it

DO $$
BEGIN
  -- Check if bucket already exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'verification-documents'
  ) THEN
    -- Create the bucket
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
END $$;

-- Step 2: Create verification_requests table
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

-- Step 3: Create verification_documents table
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

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_type ON verification_requests(user_type);
CREATE INDEX IF NOT EXISTS idx_verification_documents_request_id ON verification_documents(verification_request_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_type ON verification_documents(document_type);

-- Step 5: Enable Row Level Security
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for verification_requests
DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can update own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update all verification requests" ON verification_requests;

CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification requests" ON verification_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Step 7: Create RLS policies for verification_documents
DROP POLICY IF EXISTS "Users can view own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can create own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can update own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Admins can update all verification documents" ON verification_documents;

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

CREATE POLICY "Admins can view all verification documents" ON verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all verification documents" ON verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Step 8: Create storage policies for verification documents
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own verification documents" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload own verification documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own verification documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own verification documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Step 9: Grant permissions
GRANT ALL ON verification_requests TO authenticated;
GRANT ALL ON verification_documents TO authenticated;

-- Step 10: Add verified column to tutor_profiles if it doesn't exist
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

-- Step 11: Show success message and verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: verification_requests, verification_documents';
  RAISE NOTICE 'Storage bucket: verification-documents';
  RAISE NOTICE 'RLS policies: Enabled for all tables and storage';
  RAISE NOTICE 'Indexes: Created for optimal performance';
  RAISE NOTICE '========================================';
END $$;

-- Step 12: Verify the setup
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
