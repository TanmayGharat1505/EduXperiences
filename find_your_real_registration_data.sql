-- Find YOUR Real Registration Data
-- This script searches for your actual 7-page registration data

-- 1. Check what's currently in your institution profile
SELECT 
    'Current Institution Profile Data' as check_type,
    id,
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
    course_categories,
    course_details,
    class_timings,
    total_classrooms,
    classroom_capacity,
    library_available,
    computer_lab_available,
    wifi_available,
    parking_available,
    cafeteria_available,
    air_conditioning_available,
    cctv_security_available,
    wheelchair_accessible,
    projectors_smart_boards,
    audio_system,
    physics_lab,
    chemistry_lab,
    biology_lab,
    computer_lab,
    language_lab,
    indoor_games,
    outdoor_playground,
    gymnasium,
    swimming_pool,
    transportation_provided,
    hostel_facility,
    study_material_provided,
    online_classes,
    recorded_sessions,
    mock_tests_assessments,
    career_counseling,
    job_placement_assistance,
    main_building_photo,
    classroom_photos,
    laboratory_photos,
    facilities_photos,
    achievement_photos,
    total_current_students,
    average_batch_size,
    student_teacher_ratio,
    admission_test_required,
    minimum_qualification,
    age_restrictions,
    admission_fees,
    security_deposit,
    refund_policy,
    total_teaching_staff,
    total_non_teaching_staff,
    average_faculty_experience,
    principal_director_name,
    principal_director_qualification,
    principal_director_experience,
    principal_director_photo,
    principal_director_bio,
    department_heads,
    phd_holders,
    post_graduates,
    graduates,
    professional_certified,
    awards_received,
    publications,
    industry_experience,
    training_programs,
    board_exam_results,
    competitive_exam_results,
    institution_awards,
    student_achievements,
    accreditations,
    success_stories,
    courses,
    payment_modes,
    emi_available,
    payment_schedule,
    late_payment_penalty,
    scholarship_available,
    scholarship_criteria,
    discount_multiple_courses,
    sibling_discount,
    early_bird_discount,
    education_loan_assistance,
    installment_facility,
    hardship_support,
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
    fire_department_contact,
    business_registration_certificate,
    education_board_affiliation_certificate,
    fire_safety_certificate,
    building_plan_approval,
    pan_card_document,
    gst_certificate_document,
    bank_account_details_document,
    institution_photographs,
    insurance_documents,
    accreditation_certificates,
    award_certificates,
    faculty_qualification_certificates,
    safety_compliance_certificates,
    verified,
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 2. Check if there's data in the institutions table
SELECT 
    'Institutions Table Data' as check_type,
    id,
    name,
    type,
    establishment_year,
    registration_number,
    pan,
    gst,
    official_email,
    primary_contact,
    secondary_contact,
    website,
    complete_address,
    city,
    state,
    pincode,
    landmark,
    owner_name,
    owner_contact,
    status,
    agree_terms,
    agree_background_verification,
    created_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com'
ORDER BY created_at DESC;

-- 3. Check if there are any other tables with your registration data
SELECT 
    'Other Registration Tables' as check_type,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%registration%'
       OR table_name LIKE '%form%'
       OR table_name LIKE '%step%'
       OR table_name LIKE '%institution%')
ORDER BY table_name;

-- 4. Check if there's data in any JSONB fields that might contain your registration
SELECT 
    'JSONB Data Check' as check_type,
    id,
    institution_name,
    course_categories,
    course_details,
    class_timings,
    department_heads,
    board_exam_results,
    competitive_exam_results,
    institution_awards,
    student_achievements,
    accreditations,
    success_stories,
    courses,
    payment_modes,
    institution_photographs,
    insurance_documents,
    accreditation_certificates,
    award_certificates,
    faculty_qualification_certificates,
    safety_compliance_certificates
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
  AND (course_categories IS NOT NULL 
       OR course_details IS NOT NULL
       OR class_timings IS NOT NULL
       OR department_heads IS NOT NULL
       OR board_exam_results IS NOT NULL
       OR competitive_exam_results IS NOT NULL
       OR institution_awards IS NOT NULL
       OR student_achievements IS NOT NULL
       OR accreditations IS NOT NULL
       OR success_stories IS NOT NULL
       OR courses IS NOT NULL
       OR payment_modes IS NOT NULL
       OR institution_photographs IS NOT NULL
       OR insurance_documents IS NOT NULL
       OR accreditation_certificates IS NOT NULL
       OR award_certificates IS NOT NULL
       OR faculty_qualification_certificates IS NOT NULL
       OR safety_compliance_certificates IS NOT NULL);
