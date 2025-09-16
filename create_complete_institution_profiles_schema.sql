-- Complete Institution Profiles Schema - All 7-Step Form Fields
-- This creates a comprehensive institution_profiles table that supports all form fields

-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS institution_profiles CASCADE;

-- Create the complete institution_profiles table
CREATE TABLE institution_profiles (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Step 1: Basic Information
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  other_institution_type TEXT,
  established_year INTEGER NOT NULL,
  registration_number TEXT NOT NULL,
  pan_number TEXT NOT NULL,
  gst_number TEXT,
  official_email TEXT NOT NULL,
  primary_contact_number TEXT NOT NULL,
  secondary_contact_number TEXT,
  website_url TEXT,
  complete_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  landmark TEXT,
  map_location TEXT,
  owner_director_name TEXT NOT NULL,
  owner_contact_number TEXT NOT NULL,
  business_license TEXT,
  registration_certificate TEXT,
  
  -- Step 2: Infrastructure Details (stored as JSONB for flexibility)
  step2_data JSONB DEFAULT '{}',
  
  -- Step 3: Academic Programs (stored as JSONB for flexibility)
  step3_data JSONB DEFAULT '{}',
  
  -- Step 4: Staff & Faculty (stored as JSONB for flexibility)
  step4_data JSONB DEFAULT '{}',
  
  -- Step 5: Results & Achievements (stored as JSONB for flexibility)
  step5_data JSONB DEFAULT '{}',
  
  -- Step 6: Fee Structure (stored as JSONB for flexibility)
  step6_data JSONB DEFAULT '{}',
  
  -- Step 7: Contact & Verification
  primary_contact_person TEXT,
  contact_designation TEXT,
  contact_phone_number TEXT,
  contact_email_address TEXT,
  whatsapp_number TEXT,
  best_time_to_contact TEXT,
  facebook_page_url TEXT,
  instagram_account_url TEXT,
  youtube_channel_url TEXT,
  linkedin_profile_url TEXT,
  google_my_business_url TEXT,
  emergency_contact_person TEXT,
  local_police_station_contact TEXT,
  nearest_hospital_contact TEXT,
  fire_department_contact TEXT,
  business_registration_certificate TEXT,
  education_board_affiliation_certificate TEXT,
  fire_safety_certificate TEXT,
  building_plan_approval TEXT,
  pan_card_document TEXT,
  gst_certificate_document TEXT,
  bank_account_details_document TEXT,
  institution_photographs TEXT[],
  insurance_documents TEXT[],
  accreditation_certificates TEXT[],
  award_certificates TEXT[],
  faculty_qualification_certificates TEXT[],
  safety_compliance_certificates TEXT[],
  
  -- Legal agreements
  agree_to_terms BOOLEAN NOT NULL DEFAULT false,
  agree_to_background_verification BOOLEAN NOT NULL DEFAULT false,
  
  -- Status and verification
  verified BOOLEAN DEFAULT false NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_institution_profiles_user_id ON institution_profiles(user_id);
CREATE INDEX idx_institution_profiles_verified ON institution_profiles(verified);
CREATE INDEX idx_institution_profiles_status ON institution_profiles(status);
CREATE INDEX idx_institution_profiles_institution_type ON institution_profiles(institution_type);
CREATE INDEX idx_institution_profiles_city ON institution_profiles(city);
CREATE INDEX idx_institution_profiles_state ON institution_profiles(state);

-- Create GIN indexes for JSONB fields for better query performance
CREATE INDEX idx_institution_profiles_step2_data ON institution_profiles USING GIN(step2_data);
CREATE INDEX idx_institution_profiles_step3_data ON institution_profiles USING GIN(step3_data);
CREATE INDEX idx_institution_profiles_step4_data ON institution_profiles USING GIN(step4_data);
CREATE INDEX idx_institution_profiles_step5_data ON institution_profiles USING GIN(step5_data);
CREATE INDEX idx_institution_profiles_step6_data ON institution_profiles USING GIN(step6_data);

-- Enable Row Level Security
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy 1: Allow users to insert their own institution profile
CREATE POLICY "Allow new institution profile creation" ON institution_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow users to view their own institution profile
CREATE POLICY "Users can view own institution profile" ON institution_profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy 3: Allow users to update their own institution profile
CREATE POLICY "Users can update own institution profile" ON institution_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy 4: Allow public viewing of verified institution profiles
CREATE POLICY "Public can view verified institution profiles" ON institution_profiles
  FOR SELECT 
  USING (verified = true);

-- Policy 5: Allow admins to view all institution profiles
CREATE POLICY "Admins can view all institution profiles" ON institution_profiles
  FOR ALL 
  USING (auth.role() = 'admin');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_institution_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER institution_profiles_updated_at
  BEFORE UPDATE ON institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_profiles_updated_at();

-- Grant necessary permissions
GRANT ALL ON institution_profiles TO authenticated;
GRANT ALL ON institution_profiles TO service_role;

-- Test the table creation
SELECT 'Institution Profiles Table Created Successfully!' as status;
SELECT 
  COUNT(*) as total_columns,
  'institution_profiles' as table_name
FROM information_schema.columns 
WHERE table_name = 'institution_profiles';
