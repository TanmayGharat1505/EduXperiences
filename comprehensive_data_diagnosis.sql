-- Comprehensive Data Diagnosis
-- This script checks what data actually exists for your account

-- 1. Check your auth user account
SELECT 
    'Your Auth User Account' as check_type,
    id,
    email,
    created_at,
    email_confirmed_at,
    phone_confirmed_at
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 2. Check your profile in profiles table
SELECT 
    'Your Profile Data' as check_type,
    id,
    full_name,
    role,
    user_id,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 3. Check institution_profiles table
SELECT 
    'Institution Profiles Data' as check_type,
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
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 4. Check institutions table
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
    latitude,
    longitude,
    owner_name,
    owner_contact,
    status,
    agree_terms,
    agree_background_verification,
    primary_contact_verified,
    owner_contact_verified,
    created_at,
    updated_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com'
ORDER BY created_at DESC;

-- 5. Check if there are any institution documents
SELECT 
    'Institution Documents' as check_type,
    id,
    institution_id,
    file_key,
    file_name,
    file_type,
    file_size,
    doc_type,
    created_at
FROM institution_documents 
WHERE institution_id IN (
    SELECT id FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
)
ORDER BY created_at DESC;

-- 6. Check if there are any phone OTPs for verification
SELECT 
    'Phone OTP Verification' as check_type,
    id,
    phone,
    purpose,
    verified_at,
    created_at
FROM phone_otps 
WHERE phone IN (
    SELECT primary_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
    UNION
    SELECT owner_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
)
ORDER BY created_at DESC;

-- 7. Check all tables that might contain your data
SELECT 
    'All Institution Related Tables' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%institution%'
       OR table_name LIKE '%registration%'
       OR table_name LIKE '%form%'
       OR table_name LIKE '%step%'
       OR table_name LIKE '%profile%')
ORDER BY table_name;

-- 8. Check if there are any courses created by you
SELECT 
    'Your Institution Courses' as check_type,
    ic.id,
    ic.title,
    ic.description,
    ic.institution_id,
    ic.created_at
FROM institution_courses ic
JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
ORDER BY ic.created_at DESC;

-- 9. Check if there are any batches created by you
SELECT 
    'Your Institution Batches' as check_type,
    ib.id,
    ib.batch_name,
    ib.course_id,
    ib.institution_id,
    ib.created_at
FROM institution_batches ib
JOIN institution_profiles ip ON ib.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
ORDER BY ib.created_at DESC;

-- 10. Check if there are any enrollments for your courses
SELECT 
    'Enrollments in Your Courses' as check_type,
    ce.id,
    ce.course_id,
    ce.student_id,
    ce.status,
    ce.enrolled_at
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
ORDER BY ce.enrolled_at DESC;
