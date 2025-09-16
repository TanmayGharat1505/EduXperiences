-- Create Missing Institution Profile
-- This script creates the institution profile data for maseerah2003@gmail.com

-- 1. First, let's check what we have
SELECT 
    'Current State Check' as check_type,
    'Auth User' as source,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 2. Check if there's any institution profile for this user
SELECT 
    'Institution Profile Check' as check_type,
    id,
    institution_name,
    user_id,
    official_email
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 3. Check if there's a profile in the profiles table
SELECT 
    'Profile Check' as check_type,
    id,
    full_name,
    role,
    user_id
FROM profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 4. Check if there's any institution data with maseerah2003@gmail.com email
SELECT 
    'Email Search' as check_type,
    id,
    institution_name,
    user_id,
    official_email
FROM institution_profiles 
WHERE official_email = 'maseerah2003@gmail.com';

-- 5. Create the missing institution profile
INSERT INTO institution_profiles (
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
    owner_name,
    owner_contact_number,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '6b0f0c18-08fe-431b-af56-c4ab23e3b25c',
    'Bright Future Institute of Technology',
    'Educational Institution',
    2020,
    'BFIT-2020-001',
    'ABCDE1234F',
    '22ABCDE1234F1Z5',
    'maseerah2003@gmail.com',
    '+91-9876543210',
    '+91-9876543211',
    'https://brightfuturetech.edu',
    '123 Education Street, Tech City',
    'Mumbai',
    'Maharashtra',
    '400001',
    'Near Tech Park',
    'Dr. Anil Kumar',
    '+91-9876543212',
    true,
    true,
    true,
    NOW(),
    NOW()
);

-- 6. Verify the creation
SELECT 
    'Created Institution Profile' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    created_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 7. Also ensure there's a profile in the profiles table
INSERT INTO profiles (
    id,
    user_id,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '6b0f0c18-08fe-431b-af56-c4ab23e3b25c',
    'Bright Future Institute of Technology',
    'institution',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = 'Bright Future Institute of Technology',
    role = 'institution',
    updated_at = NOW();

-- 8. Final verification
SELECT 
    'Final Verification' as check_type,
    ip.id as institution_profile_id,
    ip.institution_name,
    ip.user_id,
    ip.official_email,
    p.id as profile_id,
    p.full_name as profile_name,
    p.role as profile_role
FROM institution_profiles ip
LEFT JOIN profiles p ON ip.user_id = p.user_id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';
