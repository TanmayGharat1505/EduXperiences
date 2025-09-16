-- Institution Signup System with Contact Verification Migration
-- This script adds the missing contact verification table for Page 7

-- Add the contact verification table for Page 7 data
CREATE TABLE IF NOT EXISTS institution_contact_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Contact Information
  primary_contact_person TEXT NOT NULL,
  designation VARCHAR(50) NOT NULL,
  direct_phone_number VARCHAR(15) NOT NULL,
  email_address TEXT NOT NULL,
  whatsapp_number VARCHAR(15),
  best_time_to_contact VARCHAR(50) NOT NULL,
  
  -- Social Media & Online Presence
  facebook_page TEXT,
  instagram_account TEXT,
  youtube_channel TEXT,
  linkedin_profile TEXT,
  google_my_business TEXT,
  
  -- Emergency Contacts
  emergency_contact_person TEXT NOT NULL,
  emergency_contact_phone VARCHAR(15) NOT NULL,
  local_police_station_contact VARCHAR(15),
  nearest_hospital_contact VARCHAR(15),
  fire_department_contact VARCHAR(15),
  
  -- Document Verification Status
  mobile_otp_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  document_verification_status VARCHAR(20) DEFAULT 'pending' CHECK (document_verification_status IN ('pending', 'approved', 'rejected')),
  physical_verification_required BOOLEAN DEFAULT false,
  background_check_consent BOOLEAN DEFAULT false,
  
  -- Final Submission Status
  terms_accepted BOOLEAN DEFAULT false,
  submitted_for_review BOOLEAN DEFAULT false,
  email_confirmation_sent BOOLEAN DEFAULT false,
  account_activated BOOLEAN DEFAULT false,
  review_timeline VARCHAR(50) DEFAULT '5-7 business days',
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for institution documents (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institution-documents',
  'institution-documents',
  true,
  52428800, -- 50MB limit for documents
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create index for the new table
CREATE INDEX IF NOT EXISTS idx_institution_contact_verification_institution_id ON institution_contact_verification(institution_id);

-- Enable RLS for the new table
ALTER TABLE institution_contact_verification ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for institution_contact_verification (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_contact_verification' AND policyname = 'Anyone can view institution contact verification') THEN
    CREATE POLICY "Anyone can view institution contact verification" ON institution_contact_verification FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_contact_verification' AND policyname = 'Anyone can insert institution contact verification') THEN
    CREATE POLICY "Anyone can insert institution contact verification" ON institution_contact_verification FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_contact_verification' AND policyname = 'Anyone can update institution contact verification') THEN
    CREATE POLICY "Anyone can update institution contact verification" ON institution_contact_verification FOR UPDATE USING (true);
  END IF;
END $$;

-- Create storage policies for institution documents (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Anyone can upload institution documents'
  ) THEN
    CREATE POLICY "Anyone can upload institution documents" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'institution-documents');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Anyone can view institution documents'
  ) THEN
    CREATE POLICY "Anyone can view institution documents" ON storage.objects
      FOR SELECT USING (bucket_id = 'institution-documents');
  END IF;
END $$;

-- Grant permissions for the new table
GRANT ALL ON institution_contact_verification TO authenticated;

-- Success message
SELECT 'Contact Verification Table Added Successfully!' as status;
