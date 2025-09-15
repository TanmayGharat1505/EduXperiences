-- Update Institution Name for Bright Future Institute of Technology
-- This script updates the institution_name in institution_profiles table

-- 1. First, let's see the current data
SELECT 
    'Current Institution Profile' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    created_at
FROM institution_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maseerah2003@gmail.com');

-- 2. Update the institution name
UPDATE institution_profiles 
SET institution_name = 'Bright Future Institute of Technology'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maseerah2003@gmail.com');

-- 3. Verify the update
SELECT 
    'Updated Institution Profile' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    created_at
FROM institution_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maseerah2003@gmail.com');

-- 4. Also check if we need to update the profiles table
SELECT 
    'Current Profile' as check_type,
    id,
    full_name,
    role,
    user_id
FROM profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maseerah2003@gmail.com')
AND role = 'institution';

-- 5. Update the profile name to match
UPDATE profiles 
SET full_name = 'Bright Future Institute of Technology'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maseerah2003@gmail.com')
AND role = 'institution';

-- 6. Verify the profile update
SELECT 
    'Updated Profile' as check_type,
    id,
    full_name,
    role,
    user_id
FROM profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maseerah2003@gmail.com')
AND role = 'institution';
