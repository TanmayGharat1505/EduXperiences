-- Add Step 7 fields to institution_profiles table
-- This script adds contact information, social media, emergency contacts, and document verification fields

-- Contact Information Section
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'primary_contact_person') THEN
    ALTER TABLE institution_profiles ADD COLUMN primary_contact_person VARCHAR(255);
    COMMENT ON COLUMN institution_profiles.primary_contact_person IS 'Primary contact person name for the institution';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'contact_designation') THEN
    ALTER TABLE institution_profiles ADD COLUMN contact_designation VARCHAR(50);
    COMMENT ON COLUMN institution_profiles.contact_designation IS 'Designation of the primary contact person (Director/Principal/Manager/Admin)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'contact_phone_number') THEN
    ALTER TABLE institution_profiles ADD COLUMN contact_phone_number VARCHAR(15);
    COMMENT ON COLUMN institution_profiles.contact_phone_number IS 'Direct phone number for the primary contact person';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'contact_email_address') THEN
    ALTER TABLE institution_profiles ADD COLUMN contact_email_address VARCHAR(255);
    COMMENT ON COLUMN institution_profiles.contact_email_address IS 'Email address for the primary contact person (different from institution email)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE institution_profiles ADD COLUMN whatsapp_number VARCHAR(15);
    COMMENT ON COLUMN institution_profiles.whatsapp_number IS 'WhatsApp number for the institution';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'best_time_to_contact') THEN
    ALTER TABLE institution_profiles ADD COLUMN best_time_to_contact VARCHAR(50);
    COMMENT ON COLUMN institution_profiles.best_time_to_contact IS 'Best time to contact the institution';
  END IF;
END $$;

-- Social Media & Online Presence Section
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'facebook_page_url') THEN
    ALTER TABLE institution_profiles ADD COLUMN facebook_page_url TEXT;
    COMMENT ON COLUMN institution_profiles.facebook_page_url IS 'Facebook page URL for the institution';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'instagram_account_url') THEN
    ALTER TABLE institution_profiles ADD COLUMN instagram_account_url TEXT;
    COMMENT ON COLUMN institution_profiles.instagram_account_url IS 'Instagram account URL for the institution';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'youtube_channel_url') THEN
    ALTER TABLE institution_profiles ADD COLUMN youtube_channel_url TEXT;
    COMMENT ON COLUMN institution_profiles.youtube_channel_url IS 'YouTube channel URL for the institution';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'linkedin_profile_url') THEN
    ALTER TABLE institution_profiles ADD COLUMN linkedin_profile_url TEXT;
    COMMENT ON COLUMN institution_profiles.linkedin_profile_url IS 'LinkedIn profile URL for the institution';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'google_my_business_url') THEN
    ALTER TABLE institution_profiles ADD COLUMN google_my_business_url TEXT;
    COMMENT ON COLUMN institution_profiles.google_my_business_url IS 'Google My Business URL for the institution';
  END IF;
END $$;

-- Emergency Contacts Section
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'emergency_contact_person') THEN
    ALTER TABLE institution_profiles ADD COLUMN emergency_contact_person TEXT;
    COMMENT ON COLUMN institution_profiles.emergency_contact_person IS 'Emergency contact person name and phone number';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'local_police_station_contact') THEN
    ALTER TABLE institution_profiles ADD COLUMN local_police_station_contact TEXT;
    COMMENT ON COLUMN institution_profiles.local_police_station_contact IS 'Local police station contact information';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'nearest_hospital_contact') THEN
    ALTER TABLE institution_profiles ADD COLUMN nearest_hospital_contact TEXT;
    COMMENT ON COLUMN institution_profiles.nearest_hospital_contact IS 'Nearest hospital contact information';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'fire_department_contact') THEN
    ALTER TABLE institution_profiles ADD COLUMN fire_department_contact TEXT;
    COMMENT ON COLUMN institution_profiles.fire_department_contact IS 'Fire department contact information';
  END IF;
END $$;

-- Document Verification Section
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'business_registration_certificate') THEN
    ALTER TABLE institution_profiles ADD COLUMN business_registration_certificate TEXT;
    COMMENT ON COLUMN institution_profiles.business_registration_certificate IS 'Business registration certificate file path';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'education_board_affiliation_certificate') THEN
    ALTER TABLE institution_profiles ADD COLUMN education_board_affiliation_certificate TEXT;
    COMMENT ON COLUMN institution_profiles.education_board_affiliation_certificate IS 'Education board affiliation certificate file path';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'fire_safety_certificate') THEN
    ALTER TABLE institution_profiles ADD COLUMN fire_safety_certificate TEXT;
    COMMENT ON COLUMN institution_profiles.fire_safety_certificate IS 'Fire safety certificate file path';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'building_plan_approval') THEN
    ALTER TABLE institution_profiles ADD COLUMN building_plan_approval TEXT;
    COMMENT ON COLUMN institution_profiles.building_plan_approval IS 'Building plan approval file path';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'pan_card_document') THEN
    ALTER TABLE institution_profiles ADD COLUMN pan_card_document TEXT;
    COMMENT ON COLUMN institution_profiles.pan_card_document IS 'PAN card document file path';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'gst_certificate_document') THEN
    ALTER TABLE institution_profiles ADD COLUMN gst_certificate_document TEXT;
    COMMENT ON COLUMN institution_profiles.gst_certificate_document IS 'GST certificate document file path';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'bank_account_details_document') THEN
    ALTER TABLE institution_profiles ADD COLUMN bank_account_details_document TEXT;
    COMMENT ON COLUMN institution_profiles.bank_account_details_document IS 'Bank account details document file path';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'institution_photographs') THEN
    ALTER TABLE institution_profiles ADD COLUMN institution_photographs JSONB DEFAULT '[]';
    COMMENT ON COLUMN institution_profiles.institution_photographs IS 'Array of institution photograph file paths';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'insurance_documents') THEN
    ALTER TABLE institution_profiles ADD COLUMN insurance_documents JSONB DEFAULT '[]';
    COMMENT ON COLUMN institution_profiles.insurance_documents IS 'Array of insurance document file paths';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'accreditation_certificates') THEN
    ALTER TABLE institution_profiles ADD COLUMN accreditation_certificates JSONB DEFAULT '[]';
    COMMENT ON COLUMN institution_profiles.accreditation_certificates IS 'Array of accreditation certificate file paths';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'award_certificates') THEN
    ALTER TABLE institution_profiles ADD COLUMN award_certificates JSONB DEFAULT '[]';
    COMMENT ON COLUMN institution_profiles.award_certificates IS 'Array of award certificate file paths';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'faculty_qualification_certificates') THEN
    ALTER TABLE institution_profiles ADD COLUMN faculty_qualification_certificates JSONB DEFAULT '[]';
    COMMENT ON COLUMN institution_profiles.faculty_qualification_certificates IS 'Array of faculty qualification certificate file paths';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'safety_compliance_certificates') THEN
    ALTER TABLE institution_profiles ADD COLUMN safety_compliance_certificates JSONB DEFAULT '[]';
    COMMENT ON COLUMN institution_profiles.safety_compliance_certificates IS 'Array of safety compliance certificate file paths';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_profiles_contact_phone ON institution_profiles(contact_phone_number);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_contact_email ON institution_profiles(contact_email_address);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_emergency_contact ON institution_profiles(emergency_contact_person);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON institution_profiles TO authenticated;

-- Update table comment
COMMENT ON TABLE institution_profiles IS 'Institution profiles with complete 7-step registration data including contact information, social media, emergency contacts, and document verification';

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Step 7 fields added successfully to institution_profiles table';
END $$;
