-- Create Basic Institution Profile
-- This script creates a minimal institution profile for testing

-- 1. Check current state
SELECT 
    'Current State' as check_type,
    'Auth User' as source,
    id,
    email
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 2. Create basic institution profile
INSERT INTO institution_profiles (
    user_id,
    institution_name,
    institution_type,
    established_year,
    registration_number,
    pan_number,
    official_email,
    primary_contact_number,
    address,
    city,
    state,
    pin_code,
    owner_name,
    owner_contact_number,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    created_at,
    updated_at
) VALUES (
    '6b0f0c18-08fe-431b-af56-c4ab23e3b25c',
    'Bright Future Institute of Technology',
    'Educational Institution',
    2020,
    'BFIT-2020-001',
    'ABCDE1234F',
    'maseerah2003@gmail.com',
    '+91-9876543210',
    '123 Education Street, Tech City',
    'Mumbai',
    'Maharashtra',
    '400001',
    'Dr. Anil Kumar',
    '+91-9876543212',
    true,
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    institution_name = 'Bright Future Institute of Technology',
    official_email = 'maseerah2003@gmail.com',
    updated_at = NOW();

-- 3. Create or update profile
INSERT INTO profiles (
    user_id,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    '6b0f0c18-08fe-431b-af56-c4ab23e3b25c',
    'Bright Future Institute of Technology',
    'institution',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = 'Bright Future Institute of Technology',
    role = 'institution',
    updated_at = NOW();

-- 4. Verify creation
SELECT 
    'Verification' as check_type,
    ip.institution_name,
    ip.official_email,
    ip.user_id,
    p.full_name as profile_name,
    p.role as profile_role
FROM institution_profiles ip
LEFT JOIN profiles p ON ip.user_id = p.user_id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';
