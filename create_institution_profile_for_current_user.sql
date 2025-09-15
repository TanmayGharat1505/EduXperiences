-- Create Institution Profile for Current User
-- This script creates an institution profile for user 4136968b-f971-4b9c-82ed-bbc0c4d82171

-- 1. First, update the user's role in the profiles table
UPDATE profiles 
SET role = 'institution' 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Create an institution profile for this user
INSERT INTO institution_profiles (
    user_id,
    institution_name,
    institution_type,
    established_year,
    registration_number,
    pan_number,
    official_email,
    primary_contact_number,
    complete_address,
    city,
    state,
    pin_code,
    owner_director_name,
    owner_contact_number,
    agree_to_terms,
    agree_to_background_verification,
    verified,
    status,
    created_at,
    updated_at
) VALUES (
    '4136968b-f971-4b9c-82ed-bbc0c4d82171',
    'Global Learning Academy',
    'Training Center',
    2012,
    'REG-9876543210',
    'ABCDE1234F',
    'isml.intern1@gmail.com',
    '8008330765',
    'Global Learning Academy, Plot No. 56, Greenfield Colony, Madhapur, Hyderabad, Telangana, 500081',
    'Hyderabad',
    'Telangana',
    '500081',
    'Dr. Ramesh Varma',
    '9988776655',
    true,
    true,
    false,
    'pending',
    NOW(),
    NOW()
);

-- 3. Verify the profile was created
SELECT 
    'Institution Profile Created' as status,
    id,
    user_id,
    institution_name,
    institution_type,
    created_at
FROM institution_profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. Verify the profile role was updated
SELECT 
    'Profile Role Updated' as status,
    user_id,
    full_name,
    role,
    updated_at
FROM profiles 
WHERE user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';
