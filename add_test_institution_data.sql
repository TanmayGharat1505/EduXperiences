-- Add Test Institution Data
-- This script adds test institution data for maseerah2003@gmail.com

-- 1. First, check if the email already exists
SELECT 
    'Existing Check' as check_type,
    COUNT(*) as existing_count
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com';

-- 2. If no institution exists, create one
INSERT INTO institutions (
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
    owner_contact_verified
) VALUES (
    'Maseerah Educational Institute',
    'Coaching',
    2020,
    'REG2024001',
    'ABCDE1234F',
    '12ABCDE1234F1Z5',
    'maseerah2003@gmail.com',
    '9876543210',
    '9876543211',
    'https://maseerah.edu',
    '123 Education Street, Knowledge City',
    'Mumbai',
    'Maharashtra',
    '400001',
    'Near Central Library',
    19.0760,
    72.8777,
    'Maseerah Khan',
    '9876543210',
    'approved',
    true,
    true,
    true,
    true
) ON CONFLICT (official_email) DO NOTHING;

-- 3. Verify the insertion
SELECT 
    'Insertion Verification' as check_type,
    id,
    name,
    official_email,
    type,
    status,
    created_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com';

-- 4. Check total count
SELECT 
    'Total Count' as check_type,
    COUNT(*) as total_institutions
FROM institutions;

-- 5. Success message
SELECT 
    'SUCCESS' as check_type,
    'Test institution data added for maseerah2003@gmail.com' as message,
    'Dashboard should now display institution information' as result;
