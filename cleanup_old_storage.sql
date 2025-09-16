-- Clean up old storage buckets and data from previous institution signup form
-- This will remove all old files and recreate clean buckets

-- First, delete all files from the old buckets
DELETE FROM storage.objects WHERE bucket_id IN ('institution-photos', 'institution-documents');

-- Delete the old buckets
DELETE FROM storage.buckets WHERE id IN ('institution-photos', 'institution-documents');

-- Now recreate clean buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('institution-photos', 'institution-photos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('institution-documents', 'institution-documents', true);

-- Verify the cleanup
SELECT 'Old storage cleaned up successfully!' as status;
SELECT id, name, public FROM storage.buckets WHERE id IN ('institution-photos', 'institution-documents');
