-- Comprehensive Field Comparison: 7-Step Registration vs SQL Function
-- This script compares ALL fields from the 7-step registration process with the SQL function

-- 1. Extract ALL fields from the 7-step registration process
-- Based on the InstitutionSignupContext.tsx file analysis

-- STEP 1 FIELDS (Basic Information)
SELECT 
    'STEP 1 - Basic Information' as step_category,
    'institutionName' as signup_field,
    'institution_name' as sql_function_parameter,
    'institution_name' as database_column,
    'MAPPED' as status
UNION ALL
SELECT 'STEP 1 - Basic Information', 'institutionType', 'p_institution_type', 'institution_type', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'otherInstitutionType', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'establishmentYear', 'p_establishment_year', 'established_year', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'registrationNumber', 'p_registration_number', 'registration_number', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'panNumber', 'p_pan_number', 'pan_number', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'gstNumber', 'p_gst_number', 'gst_number', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'officialEmail', 'p_official_email', 'official_email', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'password', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'primaryContact', 'p_primary_contact_number', 'primary_contact_number', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'secondaryContact', 'p_secondary_contact_number', 'secondary_contact_number', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'websiteUrl', 'p_website_url', 'website_url', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'completeAddress', 'p_complete_address', 'address', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'city', 'p_city', 'city', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'state', 'p_state', 'state', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'pinCode', 'p_pincode', 'pin_code', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'landmark', 'p_landmark', 'landmark', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'mapLocation', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'ownerDirectorName', 'p_owner_name', 'owner_name', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'ownerContactNumber', 'p_owner_contact_number', 'owner_contact_number', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'businessLicenseFile', 'p_business_license_file', 'business_license', 'MAPPED'
UNION ALL
SELECT 'STEP 1 - Basic Information', 'registrationCertificateFile', 'p_registration_certificate_file', 'registration_certificate', 'MAPPED'

-- STEP 2 FIELDS (Institution Details) - ALL MISSING
UNION ALL
SELECT 'STEP 2 - Institution Details', 'totalClassrooms', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'classroomCapacity', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'libraryAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'computerLabAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'wifiAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'parkingAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'cafeteriaAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'airConditioningAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'cctvSecurityAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'wheelchairAccessible', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'projectorsSmartBoardsAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'audioSystemAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'laboratoryFacilities', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'sportsFacilities', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'transportationProvided', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'hostelFacility', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'studyMaterialProvided', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'onlineClasses', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'recordedSessions', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'mockTestsAssessments', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'careerCounseling', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'jobPlacementAssistance', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'mainBuildingPhoto', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'classroomPhotos', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'laboratoryPhotos', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'facilitiesPhotos', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 2 - Institution Details', 'achievementPhotos', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'

-- STEP 3 FIELDS (Academic Programs) - ALL MISSING
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'courseCategories', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'courseDetails', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'totalCurrentStudents', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'averageBatchSize', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'studentTeacherRatio', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'classTimings', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'admissionTestRequired', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'minimumQualification', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'ageRestrictions', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'admissionFees', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'securityDeposit', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 3 - Academic Programs', 'refundPolicy', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'

-- STEP 4 FIELDS (Staff & Faculty) - ALL MISSING
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'totalTeachingStaff', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'totalNonTeachingStaff', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'averageFacultyExperience', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'principalDirectorName', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'principalDirectorQualification', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'principalDirectorExperience', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'principalDirectorPhoto', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'principalDirectorBio', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'departmentHeads', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'phdHolders', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'postGraduates', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'graduates', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'professionalCertified', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'awardsReceived', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'publications', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'industryExperience', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 4 - Staff & Faculty', 'trainingPrograms', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'

-- STEP 5 FIELDS (Results & Achievements) - ALL MISSING
UNION ALL
SELECT 'STEP 5 - Results & Achievements', 'boardExamResults', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 5 - Results & Achievements', 'competitiveExamResults', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 5 - Results & Achievements', 'institutionAwards', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 5 - Results & Achievements', 'studentAchievements', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 5 - Results & Achievements', 'accreditations', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 5 - Results & Achievements', 'successStories', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'

-- STEP 6 FIELDS (Fee Structure) - ALL MISSING
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'courses', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'paymentModes', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'emiAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'paymentSchedule', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'latePaymentPenalty', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'refundPolicy', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'scholarshipAvailable', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'scholarshipCriteria', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'discountMultipleCourses', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'siblingDiscount', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'earlyBirdDiscount', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'educationLoanAssistance', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'installmentFacility', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 6 - Fee Structure', 'hardshipSupport', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'

-- STEP 7 FIELDS (Final Review) - ALL MISSING
UNION ALL
SELECT 'STEP 7 - Final Review', 'primaryContactPerson', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'designation', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'directPhoneNumber', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'emailAddress', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'whatsappNumber', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'bestTimeToContact', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'facebookPageUrl', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'instagramAccountUrl', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'youtubeChannelUrl', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'linkedinProfileUrl', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'googleMyBusinessUrl', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'emergencyContactPerson', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'localPoliceStationContact', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'nearestHospitalContact', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'fireDepartmentContact', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'businessRegistrationCertificate', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'educationBoardAffiliationCertificate', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'fireSafetyCertificate', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'buildingPlanApproval', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'panCardDocument', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'gstCertificateDocument', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'bankAccountDetailsDocument', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'institutionPhotographs', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'insuranceDocuments', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'accreditationCertificates', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'awardCertificates', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'facultyQualificationCertificates', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'safetyComplianceCertificates', 'NOT_MAPPED', 'NOT_MAPPED', 'MISSING'
UNION ALL
SELECT 'STEP 7 - Final Review', 'agreeToTerms', 'p_agree_to_terms', 'agree_to_terms', 'MAPPED'
UNION ALL
SELECT 'STEP 7 - Final Review', 'agreeToBackgroundVerification', 'p_agree_to_background_verification', 'agree_to_background_verification', 'MAPPED'

ORDER BY step_category, signup_field;

-- 2. Summary of mapping status
SELECT 
    'MAPPING SUMMARY' as summary_type,
    step_category,
    COUNT(*) as total_fields,
    COUNT(CASE WHEN status = 'MAPPED' THEN 1 END) as mapped_fields,
    COUNT(CASE WHEN status = 'MISSING' THEN 1 END) as missing_fields,
    ROUND(
        (COUNT(CASE WHEN status = 'MAPPED' THEN 1 END) * 100.0 / COUNT(*)), 
        2
    ) as mapping_percentage
FROM (
    -- Same query as above but without ORDER BY
    SELECT 'STEP 1 - Basic Information' as step_category, 'institutionName' as signup_field, 'MAPPED' as status
    UNION ALL SELECT 'STEP 1 - Basic Information', 'institutionType', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'otherInstitutionType', 'MISSING'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'establishmentYear', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'registrationNumber', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'panNumber', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'gstNumber', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'officialEmail', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'password', 'MISSING'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'primaryContact', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'secondaryContact', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'websiteUrl', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'completeAddress', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'city', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'state', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'pinCode', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'landmark', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'mapLocation', 'MISSING'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'ownerDirectorName', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'ownerContactNumber', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'businessLicenseFile', 'MAPPED'
    UNION ALL SELECT 'STEP 1 - Basic Information', 'registrationCertificateFile', 'MAPPED'
    -- Add all other steps with MISSING status
    UNION ALL SELECT 'STEP 2 - Institution Details', 'totalClassrooms', 'MISSING'
    UNION ALL SELECT 'STEP 2 - Institution Details', 'classroomCapacity', 'MISSING'
    -- ... (all other fields from steps 2-7 would be MISSING)
    UNION ALL SELECT 'STEP 7 - Final Review', 'agreeToTerms', 'MAPPED'
    UNION ALL SELECT 'STEP 7 - Final Review', 'agreeToBackgroundVerification', 'MAPPED'
) as all_fields
GROUP BY step_category
ORDER BY step_category;
