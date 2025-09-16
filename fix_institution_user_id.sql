-- Fix Institution User ID Mismatch
-- This script fixes the user_id in institution_profiles to match the correct auth user

-- 1. First, let's see what we're working with
SELECT 
    'Current State' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id as current_user_id,
    ip.official_email,
    u.email as current_user_email
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE ip.official_email = 'maseerah2003@gmail.com';

-- 2. Get the correct user ID
SELECT 
    'Correct User ID' as check_type,
    id as correct_user_id,
    email
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 3. Update the institution profile with the correct user_id
-- Replace 'YOUR_INSTITUTION_PROFILE_ID' with the actual ID from step 1
-- Replace '6b0f0c18-08fe-431b-af56-c4ab23e3b25c' with the correct user ID from step 2

-- UPDATE institution_profiles 
-- SET user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
-- WHERE id = 'YOUR_INSTITUTION_PROFILE_ID';

-- 4. Alternative: Update by official_email (safer)
UPDATE institution_profiles 
SET user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
WHERE official_email = 'maseerah2003@gmail.com';

-- 5. Verify the update
SELECT 
    'Updated State' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id as updated_user_id,
    ip.official_email,
    u.email as user_email
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE ip.official_email = 'maseerah2003@gmail.com';

-- 6. Also update the institution name if it's null
UPDATE institution_profiles 
SET institution_name = 'Bright Future Institute of Technology'
WHERE official_email = 'maseerah2003@gmail.com'
AND (institution_name IS NULL OR institution_name = '');

-- 7. Final verification
SELECT 
    'Final State' as check_type,
    ip.id,
    ip.institution_name,
    ip.user_id,
    ip.official_email,
    u.email as user_email,
    ip.created_at
FROM institution_profiles ip
LEFT JOIN auth.users u ON ip.user_id = u.id
WHERE ip.official_email = 'maseerah2003@gmail.com';
