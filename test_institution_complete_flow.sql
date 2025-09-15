-- Test Complete Institution Registration Flow
-- This script tests the exact same flow as tutor/student signup

-- 1. First, let's check the current structure of both tables
SELECT 
    'Current Institution Profiles Schema' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 2. Test the complete institution profile creation function
-- This simulates what happens after email verification (exactly like tutor/student)
SELECT create_institution_profile_simplified(
  '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'::UUID,
  -- Step 1: Basic Information (from 7-step form)
  '{
    "institutionName": "Bright Future Academy",
    "institutionType": "Educational Institution",
    "establishmentYear": "2020",
    "registrationNumber": "BFA-2020-001",
    "panNumber": "ABCDE1234F",
    "gstNumber": "22ABCDE1234F1Z5",
    "officialEmail": "maseerah2003@gmail.com",
    "primaryContact": "9876543210",
    "secondaryContact": "9876543211",
    "websiteUrl": "https://brightfutureacademy.edu",
    "completeAddress": "123 Education Street, Tech City, Near Tech Park",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400001",
    "landmark": "Near Tech Park",
    "ownerDirectorName": "Dr. Anil Kumar",
    "ownerContactNumber": "9876543212"
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
    "facebookPageUrl": "https://facebook.com/brightfutureacademy",
    "instagramAccountUrl": "https://instagram.com/brightfutureacademy",
    "youtubeChannelUrl": "https://youtube.com/brightfutureacademy",
    "linkedinProfileUrl": "https://linkedin.com/company/brightfutureacademy",
    "googleMyBusinessUrl": "https://g.page/brightfutureacademy",
    "emergencyContactPerson": "Dr. Sarah Johnson",
    "localPoliceStationContact": "022-12345678",
    "nearestHospitalContact": "022-87654321",
    "fireDepartmentContact": "022-11111111",
    "agreeToTerms": true,
    "agreeToBackgroundVerification": true
  }'::JSONB
);

-- 3. Verify the data was created in both tables (exactly like tutor/student)
SELECT 
    'Verification - Profiles Table' as check_type,
    id,
    user_id,
    full_name,
    role,
    city,
    area,
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
    owner_director_name,
    owner_contact_number,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 4. Show the complete flow summary
SELECT 
    'COMPLETE INSTITUTION FLOW SUMMARY' as summary_type,
    'Registration Process' as step,
    '7-step form completion' as description
UNION ALL
SELECT 'COMPLETE INSTITUTION FLOW SUMMARY', 'Data Storage', 'profiles + institution_profiles tables'
UNION ALL
SELECT 'COMPLETE INSTITUTION FLOW SUMMARY', 'Profile Creation', 'createInstitutionProfileAfterVerification()'
UNION ALL
SELECT 'COMPLETE INSTITUTION FLOW SUMMARY', 'Dashboard Loading', 'profiles + institution_profiles queries'
UNION ALL
SELECT 'COMPLETE INSTITUTION FLOW SUMMARY', 'Welcome Message', 'Shows institution name from profiles.full_name'
UNION ALL
SELECT 'COMPLETE INSTITUTION FLOW SUMMARY', 'Data Display', 'All 7-step data available in dashboard'
UNION ALL
SELECT 'COMPLETE INSTITUTION FLOW SUMMARY', 'Pattern Match', 'EXACTLY like tutor/student flow'
UNION ALL
SELECT 'COMPLETE INSTITUTION FLOW SUMMARY', 'Status', 'READY FOR TESTING';
