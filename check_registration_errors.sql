-- Check Registration Errors
-- This script checks for any errors in the registration process

-- 1. Check if there are any failed registration attempts
SELECT 
    'Failed Registration Attempts' as check_type,
    id,
    institution_name,
    institution_type,
    official_email,
    primary_contact_number,
    created_at,
    updated_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
  AND (institution_name IS NULL 
       OR institution_name = ''
       OR official_email IS NULL
       OR official_email = '');

-- 2. Check if there are any incomplete registrations
SELECT 
    'Incomplete Registrations' as check_type,
    id,
    name,
    type,
    establishment_year,
    registration_number,
    pan,
    official_email,
    primary_contact,
    complete_address,
    city,
    state,
    pincode,
    owner_name,
    owner_contact,
    status,
    created_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com'
  AND (name IS NULL 
       OR name = ''
       OR registration_number IS NULL
       OR registration_number = ''
       OR pan IS NULL
       OR pan = ''
       OR primary_contact IS NULL
       OR primary_contact = ''
       OR complete_address IS NULL
       OR complete_address = ''
       OR city IS NULL
       OR city = ''
       OR state IS NULL
       OR state = ''
       OR pincode IS NULL
       OR pincode = ''
       OR owner_name IS NULL
       OR owner_name = ''
       OR owner_contact IS NULL
       OR owner_contact = '');

-- 3. Check if there are any registration records with different email variations
SELECT 
    'Registration with Different Email Variations' as check_type,
    id,
    name,
    type,
    official_email,
    primary_contact,
    created_at
FROM institutions 
WHERE official_email LIKE '%maseerah%'
   OR official_email LIKE '%2003%'
   OR official_email LIKE '%gmail%'
ORDER BY created_at DESC;

-- 4. Check if there are any registration records with different phone numbers
SELECT 
    'Registration with Different Phone Numbers' as check_type,
    id,
    name,
    type,
    official_email,
    primary_contact,
    owner_contact,
    created_at
FROM institutions 
WHERE primary_contact LIKE '%maseerah%'
   OR owner_contact LIKE '%maseerah%'
   OR primary_contact LIKE '%2003%'
   OR owner_contact LIKE '%2003%'
ORDER BY created_at DESC;

-- 5. Check if there are any registration records with similar names
SELECT 
    'Registration with Similar Names' as check_type,
    id,
    name,
    type,
    official_email,
    primary_contact,
    created_at
FROM institutions 
WHERE name ILIKE '%bright%'
   OR name ILIKE '%future%'
   OR name ILIKE '%institute%'
   OR name ILIKE '%technology%'
   OR name ILIKE '%anil%'
   OR name ILIKE '%kumar%'
ORDER BY created_at DESC;

-- 6. Check if there are any registration records with similar registration numbers
SELECT 
    'Registration with Similar Registration Numbers' as check_type,
    id,
    name,
    type,
    registration_number,
    official_email,
    created_at
FROM institutions 
WHERE registration_number LIKE '%BFIT%'
   OR registration_number LIKE '%2020%'
   OR registration_number LIKE '%001%'
ORDER BY created_at DESC;

-- 7. Check if there are any registration records with similar PAN numbers
SELECT 
    'Registration with Similar PAN Numbers' as check_type,
    id,
    name,
    type,
    pan,
    official_email,
    created_at
FROM institutions 
WHERE pan LIKE '%ABCDE%'
   OR pan LIKE '%1234F%'
ORDER BY created_at DESC;

-- 8. Check if there are any registration records with similar addresses
SELECT 
    'Registration with Similar Addresses' as check_type,
    id,
    name,
    type,
    complete_address,
    city,
    state,
    official_email,
    created_at
FROM institutions 
WHERE complete_address ILIKE '%education%'
   OR complete_address ILIKE '%tech%'
   OR complete_address ILIKE '%mumbai%'
   OR complete_address ILIKE '%maharashtra%'
ORDER BY created_at DESC;
