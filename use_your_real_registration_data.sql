-- Use YOUR Real Registration Data
-- This script finds your actual registration data and shows how to use it

-- 1. Find your real registration data in the institutions table
SELECT 
    'YOUR Real Registration Data' as check_type,
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

-- 2. Check if there are any documents associated with your registration
SELECT 
    'YOUR Registration Documents' as check_type,
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

-- 3. Check what's currently in your institution_profiles table
SELECT 
    'Current Institution Profile' as check_type,
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
    created_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 4. Update your institution profile with YOUR real data from institutions table
UPDATE institution_profiles 
SET 
    institution_name = (SELECT name FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    institution_type = (SELECT type FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    established_year = (SELECT establishment_year FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    registration_number = (SELECT registration_number FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    pan_number = (SELECT pan FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    gst_number = (SELECT gst FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    official_email = (SELECT official_email FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    primary_contact_number = (SELECT primary_contact FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    secondary_contact_number = (SELECT secondary_contact FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    website_url = (SELECT website FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    address = (SELECT complete_address FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    city = (SELECT city FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    state = (SELECT state FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    pin_code = (SELECT pincode FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    landmark = (SELECT landmark FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    owner_name = (SELECT owner_name FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    owner_contact_number = (SELECT owner_contact FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    agree_to_terms = (SELECT agree_terms FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    agree_to_background_verification = (SELECT agree_background_verification FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    verified = (SELECT primary_contact_verified FROM institutions WHERE official_email = 'maseerah2003@gmail.com' ORDER BY created_at DESC LIMIT 1),
    updated_at = NOW()
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 5. Verify the update with YOUR real data
SELECT 
    'Updated with YOUR Real Data' as check_type,
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
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';
