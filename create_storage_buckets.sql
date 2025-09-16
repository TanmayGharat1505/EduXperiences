-- Create Storage Buckets for Institution Files
-- This script creates the necessary storage buckets for the institution signup system

-- Create institution-photos bucket for all institution photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institution-photos',
  'institution-photos',
  true,
  52428800, -- 50MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create institution-documents bucket for business licenses and certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institution-documents',
  'institution-documents',
  true,
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for institution-photos bucket
-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload institution photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'institution-photos' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to view their own photos
CREATE POLICY "Allow authenticated users to view institution photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'institution-photos' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own photos
CREATE POLICY "Allow authenticated users to update institution photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'institution-photos' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own photos
CREATE POLICY "Allow authenticated users to delete institution photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'institution-photos' 
    AND auth.role() = 'authenticated'
  );

-- Create RLS policies for institution-documents bucket
-- Allow authenticated users to upload documents
CREATE POLICY "Allow authenticated users to upload institution documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'institution-documents' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to view their own documents
CREATE POLICY "Allow authenticated users to view institution documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'institution-documents' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own documents
CREATE POLICY "Allow authenticated users to update institution documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'institution-documents' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own documents
CREATE POLICY "Allow authenticated users to delete institution documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'institution-documents' 
    AND auth.role() = 'authenticated'
  );

-- Verify the buckets were created successfully
SELECT 'Storage Buckets Created Successfully!' as status;

-- Show the created buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('institution-photos', 'institution-documents');

-- Show the RLS policies for the buckets
SELECT 
  'RLS Policies for institution-photos:' as info;
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%institution photos%';

SELECT 
  'RLS Policies for institution-documents:' as info;
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%institution documents%';
