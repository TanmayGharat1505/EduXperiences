-- Check Institutions Table Data
-- This script checks what's actually in the institutions table

-- 1. Check all data in institutions table
SELECT 
    'All Institutions Data' as check_type,
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
ORDER BY created_at DESC;

-- 2. Check specifically for your email
SELECT 
    'Your Institution Data' as check_type,
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

-- 3. Check if there are any other tables that might contain your 7-page data
SELECT 
    'All Institution Related Tables' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%institution%'
       OR table_name LIKE '%registration%'
       OR table_name LIKE '%form%'
       OR table_name LIKE '%step%')
ORDER BY table_name;

-- 4. Check if there's a separate table for the 7-page registration data
SELECT 
    'Institution Registration Steps' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'institutions'
  AND (column_name LIKE '%step%'
       OR column_name LIKE '%page%'
       OR column_name LIKE '%form%'
       OR column_name LIKE '%registration%')
ORDER BY column_name;

-- 5. Check if there are any other tables with your user_id
SELECT 
    'Tables with Your User ID' as check_type,
    'institution_profiles' as table_name,
    COUNT(*) as record_count
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
UNION ALL
SELECT 
    'Tables with Your User ID' as check_type,
    'profiles' as table_name,
    COUNT(*) as record_count
FROM profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
UNION ALL
SELECT 
    'Tables with Your User ID' as check_type,
    'institutions' as table_name,
    COUNT(*) as record_count
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com';
