-- Fix Institution Registration Flow (FINAL)
-- This script creates the proper institution registration flow with all signup form fields

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

-- 2. Check if there are any unique constraints on institution_profiles (FIXED)
SELECT 
    'Unique Constraints on Institution Profiles' as check_type,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'institution_profiles'
  AND tc.table_schema = 'public'
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.constraint_name;

-- 3. Add unique constraint on user_id if it doesn't exist
ALTER TABLE institution_profiles 
ADD CONSTRAINT institution_profiles_user_id_unique UNIQUE (user_id);

-- 4. Check what fields are in the institution signup form by looking at the API
-- Based on the API, we need these fields:
-- Basic Information: name, type, establishment_year, registration_number, pan, gst, official_email, primary_contact, secondary_contact, website
-- Address: complete_address, city, state, pincode, landmark, latitude, longitude
-- Legal: owner_name, owner_contact, business_license_file, registration_certificate_file, agree_terms, agree_background_verification

-- 5. Create a comprehensive function to insert institution profiles with ALL signup form fields
CREATE OR REPLACE FUNCTION create_institution_profile_comprehensive(
  p_user_id UUID,
  p_institution_name TEXT,
  p_institution_type TEXT,
  p_establishment_year INTEGER,
  p_registration_number TEXT,
  p_pan_number TEXT,
  p_gst_number TEXT,
  p_official_email TEXT,
  p_primary_contact_number TEXT,
  p_secondary_contact_number TEXT,
  p_website_url TEXT,
  p_complete_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_pincode TEXT,
  p_landmark TEXT,
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_owner_name TEXT,
  p_owner_contact_number TEXT,
  p_business_license_file TEXT,
  p_registration_certificate_file TEXT,
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
  
  -- Insert into institution_profiles table (detailed profile with ALL signup form fields)
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
    google_maps_location,
    owner_name,
    owner_contact_number,
    business_license,
    registration_certificate,
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
    p_establishment_year,
    p_registration_number,
    p_pan_number,
    p_gst_number,
    p_official_email,
    p_primary_contact_number,
    p_secondary_contact_number,
    p_website_url,
    p_complete_address,
    p_city,
    p_state,
    p_pincode,
    p_landmark,
    CASE 
      WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL 
      THEN json_build_object('lat', p_latitude, 'lng', p_longitude)::text
      ELSE NULL
    END,
    p_owner_name,
    p_owner_contact_number,
    p_business_license_file,
    p_registration_certificate_file,
    p_agree_to_terms,
    p_agree_to_background_verification,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    institution_name = p_institution_name,
    institution_type = p_institution_type,
    established_year = p_establishment_year,
    registration_number = p_registration_number,
    pan_number = p_pan_number,
    gst_number = p_gst_number,
    official_email = p_official_email,
    primary_contact_number = p_primary_contact_number,
    secondary_contact_number = p_secondary_contact_number,
    website_url = p_website_url,
    address = p_complete_address,
    city = p_city,
    state = p_state,
    pin_code = p_pincode,
    landmark = p_landmark,
    google_maps_location = CASE 
      WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL 
      THEN json_build_object('lat', p_latitude, 'lng', p_longitude)::text
      ELSE NULL
    END,
    owner_name = p_owner_name,
    owner_contact_number = p_owner_contact_number,
    business_license = p_business_license_file,
    registration_certificate = p_registration_certificate_file,
    agree_to_terms = p_agree_to_terms,
    agree_to_background_verification = p_agree_to_background_verification,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_institution_profile_comprehensive TO authenticated;

-- 6. Test the function with comprehensive sample data
SELECT create_institution_profile_comprehensive(
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
  '123 Education Street, Tech City, Near Tech Park',
  'Mumbai',
  'Maharashtra',
  '400001',
  'Near Tech Park',
  19.0760,
  72.8777,
  'Dr. Anil Kumar',
  '9876543212',
  'business-license-file-key',
  'registration-certificate-file-key',
  true,
  true
);

-- 7. Verify the data was created
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
    google_maps_location,
    owner_name,
    owner_contact_number,
    business_license,
    registration_certificate,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 8. Show the mapping between signup form fields and database columns
SELECT 
    'Signup Form Field Mapping' as check_type,
    'Basic Information' as category,
    'name' as signup_field,
    'institution_name' as database_column
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'type', 'institution_type'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'establishment_year', 'established_year'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'registration_number', 'registration_number'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'pan', 'pan_number'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'gst', 'gst_number'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'official_email', 'official_email'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'primary_contact', 'primary_contact_number'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'secondary_contact', 'secondary_contact_number'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Basic Information', 'website', 'website_url'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Address', 'complete_address', 'address'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Address', 'city', 'city'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Address', 'state', 'state'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Address', 'pincode', 'pin_code'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Address', 'landmark', 'landmark'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Address', 'latitude/longitude', 'google_maps_location'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Legal', 'owner_name', 'owner_name'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Legal', 'owner_contact', 'owner_contact_number'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Legal', 'business_license_file', 'business_license'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Legal', 'registration_certificate_file', 'registration_certificate'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Legal', 'agree_terms', 'agree_to_terms'
UNION ALL
SELECT 'Signup Form Field Mapping', 'Legal', 'agree_background_verification', 'agree_to_background_verification';
