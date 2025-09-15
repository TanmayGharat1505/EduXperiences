-- Create Storage Bucket for Verification Documents
-- This script creates the storage bucket needed for document uploads

-- Create the verification-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE 'Storage bucket "verification-documents" created/updated successfully!';
  RAISE NOTICE 'File size limit: 10MB';
  RAISE NOTICE 'Allowed types: PDF, JPEG, PNG, DOC, DOCX';
END $$;
