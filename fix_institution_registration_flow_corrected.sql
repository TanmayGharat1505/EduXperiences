-- Fix Institution Registration Flow (CORRECTED)
-- This script creates the proper institution registration flow like tutor and student

-- 1. First, let's check the current structure of institution_profiles table
SELECT 
    'Current Institution Profile Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 2. Check if there are any unique constraints on institution_profiles
SELECT 
    'Unique Constraints on Institution Profiles' as check_type,
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'institution_profiles'
  AND tc.table_schema = 'public'
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.constraint_name;

-- 3. Add unique constraint on user_id if it doesn't exist
ALTER TABLE institution_profiles 
ADD CONSTRAINT institution_profiles_user_id_unique UNIQUE (user_id);

-- 4. Create a function to insert institution profiles (like tutor and student)
CREATE OR REPLACE FUNCTION create_institution_profile(
  p_user_id UUID,
  p_institution_name TEXT,
  p_institution_type TEXT,
  p_established_year INTEGER,
  p_registration_number TEXT,
  p_pan_number TEXT,
  p_gst_number TEXT,
  p_official_email TEXT,
  p_primary_contact_number TEXT,
  p_secondary_contact_number TEXT,
  p_website_url TEXT,
  p_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_pin_code TEXT,
  p_landmark TEXT,
  p_owner_name TEXT,
  p_owner_contact_number TEXT,
  p_agree_to_terms BOOLEAN,
  p_agree_to_background_verification BOOLEAN
) RETURNS VOID AS $$
BEGIN
  -- Insert into profiles table (basic profile)
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (p_user_id, p_institution_name, 'institution')
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = p_institution_name,
    role = 'institution',
    updated_at = NOW();
  
  -- Insert into institution_profiles table (detailed profile)
  INSERT INTO institution_profiles (
    user_id,
    institution_name,
    institution_type,
    established_year,
    registration_number,
    pan_number,
    gst_number,
    official_email,
    primary_contact_number,
    secondary_contact_number,
    website_url,
    address,
    city,
    state,
    pin_code,
    landmark,
    owner_name,
    owner_contact_number,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_institution_name,
    p_institution_type,
    p_established_year,
    p_registration_number,
    p_pan_number,
    p_gst_number,
    p_official_email,
    p_primary_contact_number,
    p_secondary_contact_number,
    p_website_url,
    p_address,
    p_city,
    p_state,
    p_pin_code,
    p_landmark,
    p_owner_name,
    p_owner_contact_number,
    p_agree_to_terms,
    p_agree_to_background_verification,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    institution_name = p_institution_name,
    institution_type = p_institution_type,
    established_year = p_established_year,
    registration_number = p_registration_number,
    pan_number = p_pan_number,
    gst_number = p_gst_number,
    official_email = p_official_email,
    primary_contact_number = p_primary_contact_number,
    secondary_contact_number = p_secondary_contact_number,
    website_url = p_website_url,
    address = p_address,
    city = p_city,
    state = p_state,
    pin_code = p_pin_code,
    landmark = p_landmark,
    owner_name = p_owner_name,
    owner_contact_number = p_owner_contact_number,
    agree_to_terms = p_agree_to_terms,
    agree_to_background_verification = p_agree_to_background_verification,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_institution_profile TO authenticated;

-- 5. Test the function with sample data
SELECT create_institution_profile(
  '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'::UUID,
  'Bright Future Institute of Technology',
  'Educational Institution',
  2020,
  'BFIT-2020-001',
  'ABCDE1234F',
  '22ABCDE1234F1Z5',
  'maseerah2003@gmail.com',
  '9876543210',
  '9876543211',
  'https://brightfuturetech.edu',
  '123 Education Street, Tech City',
  'Mumbai',
  'Maharashtra',
  '400001',
  'Near Tech Park',
  'Dr. Anil Kumar',
  '9876543212',
  true,
  true
);

-- 6. Verify the data was created
SELECT 
    'Verification - Profiles Table' as check_type,
    id,
    user_id,
    full_name,
    role,
    created_at
FROM profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

SELECT 
    'Verification - Institution Profiles Table' as check_type,
    id,
    user_id,
    institution_name,
    institution_type,
    established_year,
    registration_number,
    pan_number,
    gst_number,
    official_email,
    primary_contact_number,
    secondary_contact_number,
    website_url,
    address,
    city,
    state,
    pin_code,
    landmark,
    owner_name,
    owner_contact_number,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';
