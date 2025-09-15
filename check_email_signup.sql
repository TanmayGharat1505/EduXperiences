-- SQL Script to Check Email Signup Status
-- Run this in Supabase SQL Editor to check if maseerah2003@gmail.com is saved

-- 1. Check auth.users table (main authentication table)
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'VERIFIED'
        ELSE 'UNVERIFIED'
    END as verification_status
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 2. Check profiles table (user profiles)
SELECT 
    'profiles' as table_name,
    user_id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'maseerah2003@gmail.com';

-- 3. Check public_users table (if exists)
SELECT 
    'public_users' as table_name,
    id,
    email,
    role,
    verification_status,
    created_at,
    updated_at
FROM public_users 
WHERE email = 'maseerah2003@gmail.com';

-- 4. Check tutor_profiles table (if user is a tutor)
SELECT 
    'tutor_profiles' as table_name,
    tp.user_id,
    tp.full_name,
    tp.bio,
    tp.verified,
    tp.created_at,
    u.email
FROM tutor_profiles tp
JOIN auth.users u ON tp.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com';

-- 5. Check student_profiles table (if user is a student)
SELECT 
    'student_profiles' as table_name,
    sp.user_id,
    sp.date_of_birth,
    sp.education_level,
    sp.onboarding_completed,
    sp.created_at,
    u.email
FROM student_profiles sp
JOIN auth.users u ON sp.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com';

-- 6. Check institution_profiles table (if user is an institution)
SELECT 
    'institution_profiles' as table_name,
    ip.user_id,
    ip.institution_name,
    ip.institution_type,
    ip.created_at,
    u.email
FROM institution_profiles ip
JOIN auth.users u ON ip.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com';

-- 7. Check for any pending profiles in localStorage (this would need to be checked manually)
-- Note: localStorage data is not stored in the database, so you'll need to check the browser

-- 8. Summary query - Get all records for this email across all tables
WITH all_records AS (
    -- Auth users
    SELECT 'auth.users' as table_name, id::text as record_id, email, created_at, 'AUTH_USER' as record_type
    FROM auth.users WHERE email = 'maseerah2003@gmail.com'
    
    UNION ALL
    
    -- Profiles
    SELECT 'profiles' as table_name, user_id::text as record_id, email, created_at, 'PROFILE' as record_type
    FROM profiles WHERE email = 'maseerah2003@gmail.com'
    
    UNION ALL
    
    -- Public users
    SELECT 'public_users' as table_name, id::text as record_id, email, created_at, 'PUBLIC_USER' as record_type
    FROM public_users WHERE email = 'maseerah2003@gmail.com'
    
    UNION ALL
    
    -- Tutor profiles
    SELECT 'tutor_profiles' as table_name, tp.user_id::text as record_id, u.email, tp.created_at, 'TUTOR_PROFILE' as record_type
    FROM tutor_profiles tp
    JOIN auth.users u ON tp.user_id = u.id
    WHERE u.email = 'maseerah2003@gmail.com'
    
    UNION ALL
    
    -- Student profiles
    SELECT 'student_profiles' as table_name, sp.user_id::text as record_id, u.email, sp.created_at, 'STUDENT_PROFILE' as record_type
    FROM student_profiles sp
    JOIN auth.users u ON sp.user_id = u.id
    WHERE u.email = 'maseerah2003@gmail.com'
    
    UNION ALL
    
    -- Institution profiles
    SELECT 'institution_profiles' as table_name, ip.user_id::text as record_id, u.email, ip.created_at, 'INSTITUTION_PROFILE' as record_type
    FROM institution_profiles ip
    JOIN auth.users u ON ip.user_id = u.id
    WHERE u.email = 'maseerah2003@gmail.com'
)
SELECT 
    table_name,
    record_id,
    email,
    created_at,
    record_type,
    CASE 
        WHEN table_name = 'auth.users' THEN 'Main authentication record'
        WHEN table_name = 'profiles' THEN 'User profile record'
        WHEN table_name = 'public_users' THEN 'Public user record'
        WHEN table_name = 'tutor_profiles' THEN 'Tutor-specific profile'
        WHEN table_name = 'student_profiles' THEN 'Student-specific profile'
        WHEN table_name = 'institution_profiles' THEN 'Institution-specific profile'
        ELSE 'Unknown record type'
    END as description
FROM all_records
ORDER BY created_at DESC;

-- 9. Check if email verification is pending
SELECT 
    'VERIFICATION_STATUS' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'maseerah2003@gmail.com' AND email_confirmed_at IS NULL) 
        THEN 'EMAIL_VERIFICATION_PENDING'
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'maseerah2003@gmail.com' AND email_confirmed_at IS NOT NULL) 
        THEN 'EMAIL_VERIFIED'
        ELSE 'EMAIL_NOT_FOUND'
    END as status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'maseerah2003@gmail.com' AND email_confirmed_at IS NULL) 
        THEN 'User exists but email is not verified. Check your email for verification link.'
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'maseerah2003@gmail.com' AND email_confirmed_at IS NOT NULL) 
        THEN 'User exists and email is verified. You should be able to log in.'
        ELSE 'No user found with this email address.'
    END as message;
