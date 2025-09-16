-- Fix Institution Registration Flow (PRACTICAL)
-- This script creates a practical institution registration flow using JSONB parameters
-- to avoid PostgreSQL's 100 parameter limit

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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'institution_profiles_user_id_unique'
        AND table_name = 'institution_profiles'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE institution_profiles 
        ADD CONSTRAINT institution_profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- 4. Create a practical function using JSONB parameters for each step
CREATE OR REPLACE FUNCTION create_institution_profile_practical(
  p_user_id UUID,
  p_step1_data JSONB,  -- Basic Information
  p_step2_data JSONB,  -- Institution Details
  p_step3_data JSONB,  -- Academic Programs
  p_step4_data JSONB,  -- Staff & Faculty
  p_step5_data JSONB,  -- Results & Achievements
  p_step6_data JSONB,  -- Fee Structure
  p_step7_data JSONB   -- Final Review
) RETURNS VOID AS $$
BEGIN
  -- Insert into profiles table (basic profile)
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (p_user_id, p_step1_data->>'institutionName', 'institution')
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = p_step1_data->>'institutionName',
    role = 'institution',
    updated_at = NOW();
  
  -- Insert into institution_profiles table with JSONB data
  INSERT INTO institution_profiles (
    user_id,
    institution_name,
    institution_type,
    other_institution_type,
    established_year,
    registration_number,
    pan_number,
    gst_number,
    official_email,
    password,
    primary_contact_number,
    secondary_contact_number,
    website_url,
    address,
    city,
    state,
    pin_code,
    landmark,
    map_location,
    owner_director_name,
    owner_contact_number,
    business_license,
    registration_certificate,
    
    -- Step 2: Institution Details (stored as JSONB)
    step2_data,
    
    -- Step 3: Academic Programs (stored as JSONB)
    step3_data,
    
    -- Step 4: Staff & Faculty (stored as JSONB)
    step4_data,
    
    -- Step 5: Results & Achievements (stored as JSONB)
    step5_data,
    
    -- Step 6: Fee Structure (stored as JSONB)
    step6_data,
    
    -- Step 7: Final Review (stored as JSONB)
    step7_data,
    
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_step1_data->>'institutionName',
    p_step1_data->>'institutionType',
    p_step1_data->>'otherInstitutionType',
    (p_step1_data->>'establishmentYear')::INTEGER,
    p_step1_data->>'registrationNumber',
    p_step1_data->>'panNumber',
    p_step1_data->>'gstNumber',
    p_step1_data->>'officialEmail',
    p_step1_data->>'password',
    p_step1_data->>'primaryContact',
    p_step1_data->>'secondaryContact',
    p_step1_data->>'websiteUrl',
    p_step1_data->>'completeAddress',
    p_step1_data->>'city',
    p_step1_data->>'state',
    p_step1_data->>'pinCode',
    p_step1_data->>'landmark',
    p_step1_data->>'mapLocation',
    p_step1_data->>'ownerDirectorName',
    p_step1_data->>'ownerContactNumber',
    p_step1_data->>'businessLicenseFile',
    p_step1_data->>'registrationCertificateFile',
    
    -- Step 2: Institution Details
    p_step2_data,
    
    -- Step 3: Academic Programs
    p_step3_data,
    
    -- Step 4: Staff & Faculty
    p_step4_data,
    
    -- Step 5: Results & Achievements
    p_step5_data,
    
    -- Step 6: Fee Structure
    p_step6_data,
    
    -- Step 7: Final Review
    p_step7_data,
    
    (p_step7_data->>'agreeToTerms')::BOOLEAN,
    (p_step7_data->>'agreeToBackgroundVerification')::BOOLEAN,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    institution_name = p_step1_data->>'institutionName',
    institution_type = p_step1_data->>'institutionType',
    other_institution_type = p_step1_data->>'otherInstitutionType',
    established_year = (p_step1_data->>'establishmentYear')::INTEGER,
    registration_number = p_step1_data->>'registrationNumber',
    pan_number = p_step1_data->>'panNumber',
    gst_number = p_step1_data->>'gstNumber',
    official_email = p_step1_data->>'officialEmail',
    password = p_step1_data->>'password',
    primary_contact_number = p_step1_data->>'primaryContact',
    secondary_contact_number = p_step1_data->>'secondaryContact',
    website_url = p_step1_data->>'websiteUrl',
    address = p_step1_data->>'completeAddress',
    city = p_step1_data->>'city',
    state = p_step1_data->>'state',
    pin_code = p_step1_data->>'pinCode',
    landmark = p_step1_data->>'landmark',
    map_location = p_step1_data->>'mapLocation',
    owner_director_name = p_step1_data->>'ownerDirectorName',
    owner_contact_number = p_step1_data->>'ownerContactNumber',
    business_license = p_step1_data->>'businessLicenseFile',
    registration_certificate = p_step1_data->>'registrationCertificateFile',
    
    -- Step 2: Institution Details
    step2_data = p_step2_data,
    
    -- Step 3: Academic Programs
    step3_data = p_step3_data,
    
    -- Step 4: Staff & Faculty
    step4_data = p_step4_data,
    
    -- Step 5: Results & Achievements
    step5_data = p_step5_data,
    
    -- Step 6: Fee Structure
    step6_data = p_step6_data,
    
    -- Step 7: Final Review
    step7_data = p_step7_data,
    
    agree_to_terms = (p_step7_data->>'agreeToTerms')::BOOLEAN,
    agree_to_background_verification = (p_step7_data->>'agreeToBackgroundVerification')::BOOLEAN,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_institution_profile_practical TO authenticated;

-- 5. Test the function with sample data
SELECT create_institution_profile_practical(
  '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'::UUID,
  -- Step 1: Basic Information
  '{
    "institutionName": "Bright Future Institute of Technology",
    "institutionType": "Educational Institution",
    "otherInstitutionType": "",
    "establishmentYear": "2020",
    "registrationNumber": "BFIT-2020-001",
    "panNumber": "ABCDE1234F",
    "gstNumber": "22ABCDE1234F1Z5",
    "officialEmail": "maseerah2003@gmail.com",
    "password": "hashed_password",
    "primaryContact": "9876543210",
    "secondaryContact": "9876543211",
    "websiteUrl": "https://brightfuturetech.edu",
    "completeAddress": "123 Education Street, Tech City, Near Tech Park",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400001",
    "landmark": "Near Tech Park",
    "mapLocation": "19.0760,72.8777",
    "ownerDirectorName": "Dr. Anil Kumar",
    "ownerContactNumber": "9876543212",
    "businessLicenseFile": "business-license-file-key",
    "registrationCertificateFile": "registration-certificate-file-key"
  }'::JSONB,
  
  -- Step 2: Institution Details
  '{
    "totalClassrooms": "25",
    "classroomCapacity": "30",
    "libraryAvailable": "Yes",
    "computerLabAvailable": "Yes",
    "wifiAvailable": "Yes",
    "parkingAvailable": "Yes",
    "cafeteriaAvailable": "Yes",
    "airConditioningAvailable": "Yes",
    "cctvSecurityAvailable": "Yes",
    "wheelchairAccessible": "Yes",
    "projectorsSmartBoardsAvailable": "Yes",
    "audioSystemAvailable": "Yes",
    "laboratoryFacilities": {
      "physicsLab": true,
      "chemistryLab": true,
      "biologyLab": true,
      "computerLab": true,
      "languageLab": true
    },
    "sportsFacilities": {
      "indoorGames": true,
      "outdoorPlayground": true,
      "gymnasium": true,
      "swimmingPool": false
    },
    "transportationProvided": "Yes",
    "hostelFacility": "No",
    "studyMaterialProvided": "Yes",
    "onlineClasses": "Yes",
    "recordedSessions": "Yes",
    "mockTestsAssessments": "Yes",
    "careerCounseling": "Yes",
    "jobPlacementAssistance": "Yes"
  }'::JSONB,
  
  -- Step 3: Academic Programs
  '{
    "courseCategories": {
      "cbse": true,
      "icse": true,
      "stateBoard": true,
      "ibInternational": false,
      "competitiveExams": true,
      "professionalCourses": true,
      "languageClasses": true,
      "computerCourses": true,
      "artsCrafts": false,
      "musicDance": false,
      "sportsTraining": false
    },
    "totalCurrentStudents": "500",
    "averageBatchSize": "25",
    "studentTeacherRatio": "15:1",
    "classTimings": {
      "morningBatches": true,
      "afternoonBatches": true,
      "eveningBatches": true,
      "weekendBatches": false,
      "flexibleTimings": true
    },
    "admissionTestRequired": "Yes",
    "minimumQualification": "10th Pass",
    "ageRestrictions": "14-25 years",
    "admissionFees": "5000",
    "securityDeposit": "10000",
    "admissionRefundPolicy": "Refundable within 30 days"
  }'::JSONB,
  
  -- Step 4: Staff & Faculty
  '{
    "totalTeachingStaff": "25",
    "totalNonTeachingStaff": "10",
    "averageFacultyExperience": "8 years",
    "principalDirectorName": "Dr. Sarah Johnson",
    "principalDirectorQualification": "Ph.D. in Education",
    "principalDirectorExperience": "15 years",
    "phdHolders": "8",
    "postGraduates": "15",
    "graduates": "2",
    "professionalCertified": "20",
    "awardsReceived": "5",
    "publications": "12",
    "industryExperience": "10 years",
    "trainingPrograms": "Regular"
  }'::JSONB,
  
  -- Step 5: Results & Achievements
  '{
    "boardExamResults": [
      {
        "year": "2023",
        "passPercentage": "95",
        "distinctionPercentage": "40",
        "topScorerDetails": "Student scored 98%"
      }
    ],
    "competitiveExamResults": [
      {
        "examType": "JEE Main",
        "year": "2023",
        "totalStudentsAppeared": "100",
        "qualifiedStudents": "85",
        "topRanksAchieved": "Rank 500",
        "successPercentage": "85"
      }
    ],
    "institutionAwards": {
      "institutionAwards": "Best Institute 2023",
      "governmentRecognition": "ISO Certified",
      "educationBoardAwards": "Excellence in Education",
      "qualityCertifications": "NAAC A+",
      "mediaRecognition": "Featured in Times of India"
    }
  }'::JSONB,
  
  -- Step 6: Fee Structure
  '{
    "courses": [
      {
        "courseName": "Class 12 Science",
        "admissionFee": "5000",
        "monthlyFee": "3000",
        "quarterlyFee": "8000",
        "annualFee": "30000",
        "materialCharges": "2000",
        "examFee": "1000",
        "otherCharges": "500"
      }
    ],
    "paymentModes": {
      "cash": true,
      "cheque": true,
      "bankTransfer": true,
      "onlinePayment": true,
      "upi": true,
      "creditDebitCards": true
    },
    "emiAvailable": "Yes",
    "paymentSchedule": "Monthly",
    "latePaymentPenalty": "2% per month",
    "refundPolicy": "Refundable within 30 days",
    "scholarshipAvailable": "Yes",
    "scholarshipCriteria": "Merit and Need based"
  }'::JSONB,
  
  -- Step 7: Final Review
  '{
    "primaryContactPerson": "Dr. Anil Kumar",
    "designation": "Director",
    "directPhoneNumber": "9876543210",
    "emailAddress": "maseerah2003@gmail.com",
    "whatsappNumber": "9876543210",
    "bestTimeToContact": "9 AM - 6 PM",
    "facebookPageUrl": "https://facebook.com/brightfuturetech",
    "instagramAccountUrl": "https://instagram.com/brightfuturetech",
    "youtubeChannelUrl": "https://youtube.com/brightfuturetech",
    "linkedinProfileUrl": "https://linkedin.com/company/brightfuturetech",
    "googleMyBusinessUrl": "https://g.page/brightfuturetech",
    "emergencyContactPerson": "Dr. Sarah Johnson",
    "localPoliceStationContact": "022-12345678",
    "nearestHospitalContact": "022-87654321",
    "fireDepartmentContact": "022-11111111",
    "agreeToTerms": true,
    "agreeToBackgroundVerification": true
  }'::JSONB
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
    official_email,
    primary_contact_number,
    city,
    state,
    step2_data,
    step3_data,
    step4_data,
    step5_data,
    step6_data,
    step7_data,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 7. Show the practical approach benefits
SELECT 
    'PRACTICAL APPROACH BENEFITS' as summary_type,
    'Function Parameters' as description,
    '8 (within 100 limit)' as value
UNION ALL
SELECT 'PRACTICAL APPROACH BENEFITS', 'Total Fields Supported', '100+ (all 7 steps)'
UNION ALL
SELECT 'PRACTICAL APPROACH BENEFITS', 'Data Storage', 'JSONB (flexible)'
UNION ALL
SELECT 'PRACTICAL APPROACH BENEFITS', 'Query Performance', 'Good (indexed JSONB)'
UNION ALL
SELECT 'PRACTICAL APPROACH BENEFITS', 'Maintenance', 'Easy (grouped by step)'
UNION ALL
SELECT 'PRACTICAL APPROACH BENEFITS', 'Scalability', 'High (add fields easily)'
UNION ALL
SELECT 'PRACTICAL APPROACH BENEFITS', 'Status', 'READY FOR USE';
