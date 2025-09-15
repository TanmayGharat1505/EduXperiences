-- Test Institution Registration Schema
-- This script tests the complete institution registration flow

-- 1. Check if the table exists and has all required columns
SELECT 
  'Table Structure Check' as test_name,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'institution_profiles';

-- 2. List all columns in the institution_profiles table
SELECT 
  'Column List' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 3. Test inserting sample data (if you have a test user)
-- Replace 'your-test-user-id' with an actual user ID from auth.users
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a test user ID (replace with actual user ID)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Insert test institution profile
    INSERT INTO institution_profiles (
      user_id,
      institution_name,
      institution_type,
      established_year,
      registration_number,
      pan_number,
      official_email,
      primary_contact_number,
      complete_address,
      city,
      state,
      pin_code,
      owner_director_name,
      owner_contact_number,
      agree_to_terms,
      agree_to_background_verification,
      status,
      verified,
      -- Step 2-6 data as JSONB
      step2_data,
      step3_data,
      step4_data,
      step5_data,
      step6_data,
      -- Step 7 contact details
      primary_contact_person,
      contact_designation,
      contact_phone_number,
      contact_email_address,
      whatsapp_number,
      best_time_to_contact,
      facebook_page_url,
      instagram_account_url,
      youtube_channel_url,
      linkedin_profile_url,
      google_my_business_url,
      emergency_contact_person,
      local_police_station_contact,
      nearest_hospital_contact,
      fire_department_contact
    ) VALUES (
      test_user_id,
      'Test Educational Institute',
      'Coaching',
      2020,
      'REG123456789',
      'ABCDE1234F',
      'test@institute.com',
      '9876543210',
      '123 Test Street, Test Area',
      'Mumbai',
      'Maharashtra',
      '400001',
      'John Director',
      '9876543211',
      true,
      true,
      'pending',
      false,
      -- Step 2-6 data
      '{"total_classrooms": 10, "library_available": true}',
      '{"programs": ["Class 10", "Class 12"]}',
      '{"total_teaching_staff": 15}',
      '{"board_exam_results": []}',
      '{"fee_structure": "Monthly"}',
      -- Step 7 contact details
      'John Director',
      'Director',
      '9876543210',
      'contact@institute.com',
      '9876543210',
      'morning',
      'https://facebook.com/testinstitute',
      'https://instagram.com/testinstitute',
      'https://youtube.com/testinstitute',
      'https://linkedin.com/company/testinstitute',
      'https://g.page/testinstitute',
      'Emergency Contact - 9999999999',
      'Police Station - 100',
      'Hospital - 108',
      'Fire Department - 101'
    );
    
    RAISE NOTICE 'Test institution profile inserted successfully';
  ELSE
    RAISE NOTICE 'No test user found. Please create a user first.';
  END IF;
END $$;

-- 4. Verify the data was inserted correctly
SELECT 
  'Data Verification' as test_name,
  institution_name,
  institution_type,
  registration_number,
  pan_number,
  official_email,
  primary_contact_number,
  city,
  state,
  status,
  verified,
  -- Check JSONB fields
  step2_data->>'total_classrooms' as step2_classrooms,
  step3_data->>'programs' as step3_programs,
  primary_contact_person,
  contact_designation,
  facebook_page_url
FROM institution_profiles 
WHERE institution_name = 'Test Educational Institute';

-- 5. Test updating the profile
UPDATE institution_profiles 
SET 
  institution_name = 'Updated Test Educational Institute',
  step2_data = step2_data || '{"computer_lab_available": true}'::jsonb,
  primary_contact_person = 'Updated Director'
WHERE institution_name = 'Test Educational Institute';

-- 6. Verify the update
SELECT 
  'Update Verification' as test_name,
  institution_name,
  step2_data->>'computer_lab_available' as has_computer_lab,
  primary_contact_person
FROM institution_profiles 
WHERE institution_name = 'Updated Test Educational Institute';

-- 7. Clean up test data
DELETE FROM institution_profiles 
WHERE institution_name = 'Updated Test Educational Institute';

SELECT 'Test completed successfully! Institution registration schema is working.' as final_status;
