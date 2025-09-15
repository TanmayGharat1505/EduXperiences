-- Check Institution Profile Schema
-- This script examines the current schema and compares it with 7-step registration fields

-- 1. Check current institution_profiles table structure
SELECT 
    'Current Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 2. Check your current institution profile data
SELECT 
    'Current Data' as check_type,
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
    created_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 3. Check if there are any missing columns that should be in 7-step registration
SELECT 
    'Missing Columns Check' as check_type,
    'Should have these columns for 7-step registration:' as note,
    'institution_name, institution_type, established_year, registration_number, pan_number, gst_number, official_email, primary_contact_number, secondary_contact_number, website_url, address, city, state, pin_code, landmark, owner_name, owner_contact_number, business_license, registration_certificate, agree_to_terms, agree_to_background_verification, total_classrooms, classroom_capacity, library_available, computer_lab_available, wifi_available, parking_available, cafeteria_available, air_conditioning_available, cctv_security_available, wheelchair_accessible, projectors_smart_boards, audio_system, physics_lab, chemistry_lab, biology_lab, computer_lab, language_lab, indoor_games, outdoor_playground, gymnasium, swimming_pool, transportation_provided, hostel_facility, study_material_provided, online_classes, recorded_sessions, mock_tests_assessments, career_counseling, job_placement_assistance, main_building_photo, classroom_photos, laboratory_photos, facilities_photos, achievement_photos, course_categories, course_details, total_current_students, average_batch_size, student_teacher_ratio, class_timings, admission_test_required, minimum_qualification, age_restrictions, admission_fees, security_deposit, refund_policy, total_teaching_staff, total_non_teaching_staff, average_faculty_experience, principal_director_name, principal_director_qualification, principal_director_experience, principal_director_photo, principal_director_bio, department_heads, phd_holders, post_graduates, graduates, professional_certified, awards_received, publications, industry_experience, training_programs, board_exam_results, competitive_exam_results, institution_awards, student_achievements, accreditations, success_stories, courses, payment_modes, emi_available, payment_schedule, late_payment_penalty, scholarship_available, scholarship_criteria, discount_multiple_courses, sibling_discount, early_bird_discount, education_loan_assistance, installment_facility, hardship_support, primary_contact_person, contact_designation, contact_phone_number, contact_email_address, whatsapp_number, best_time_to_contact, facebook_page_url, instagram_account_url, youtube_channel_url, linkedin_profile_url, google_my_business_url, emergency_contact_person, local_police_station_contact, nearest_hospital_contact, fire_department_contact, business_registration_certificate, education_board_affiliation_certificate, fire_safety_certificate, building_plan_approval, pan_card_document, gst_certificate_document, bank_account_details_document, institution_photographs, insurance_documents, accreditation_certificates, award_certificates, faculty_qualification_certificates, safety_compliance_certificates' as expected_columns;

-- 4. Check if there's data in other tables that might contain the 7-step registration
SELECT 
    'Other Tables Check' as check_type,
    table_name,
    column_count
FROM information_schema.tables t
LEFT JOIN (
    SELECT table_name, COUNT(*) as column_count
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    GROUP BY table_name
) c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND (t.table_name LIKE '%institution%' 
       OR t.table_name LIKE '%registration%'
       OR t.table_name LIKE '%profile%')
ORDER BY t.table_name;

-- 5. Check if there's a separate registration table
SELECT 
    'Registration Tables' as check_type,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%registration%'
       OR table_name LIKE '%form%'
       OR table_name LIKE '%step%')
ORDER BY table_name;
